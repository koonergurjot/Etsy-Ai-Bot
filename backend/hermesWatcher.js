import { EventEmitter } from 'events';
import { watch, existsSync, statSync, createReadStream } from 'fs';
import { createInterface } from 'readline';
import path from 'path';

// Map log-level agent aliases to canonical dashboard IDs
const AGENT_ALIASES = {
  nova: 'nova', research: 'nova', researcher: 'nova',
  forge: 'forge', copy: 'forge', copywriter: 'forge', writer: 'forge',
  ledger: 'ledger', finance: 'ledger', accountant: 'ledger', financial: 'ledger',
  queen: 'queen', qc: 'queen', quality: 'queen',
  atlas: 'atlas', market: 'atlas', intelligence: 'atlas', intel: 'atlas',
  cipher: 'cipher', comms: 'cipher', coordinator: 'cipher',
};

// Supported Hermes Agent log line patterns (extend as needed)
const LOG_PATTERNS = [
  // [2026-04-19 10:23:45] [nova] TASK: doing something
  {
    re: /\[([^\]]+)\]\s+\[(\w+)\]\s+(TASK|STATUS|COMPLETED|ERROR):\s+(.+)/i,
    extract: m => ({ ts: m[1], agent: m[2], type: m[3].toUpperCase(), detail: m[4] }),
  },
  // [nova] TASK: doing something   (the format hermes-skills/*.json emit)
  {
    re: /^\s*\[(\w+)\]\s+(TASK|STATUS|COMPLETED|ERROR):\s+(.+)/i,
    extract: m => ({ agent: m[1], type: m[2].toUpperCase(), detail: m[3] }),
  },
  // nova TASK: doing something
  {
    re: /^(\w+)\s+(TASK|STATUS|COMPLETED|ERROR):\s+(.+)/i,
    extract: m => ({ agent: m[1], type: m[2].toUpperCase(), detail: m[3] }),
  },
  // Agent: nova | Task: doing something | Status: processing
  {
    re: /Agent:\s*(\w+)\s*\|\s*Task:\s*(.+?)\s*\|\s*Status:\s*(\w+)/i,
    extract: m => ({ agent: m[1], type: 'TASK', detail: m[2], statusRaw: m[3] }),
  },
  // nova -> doing something [processing]
  {
    re: /^(\w+)\s+->\s+(.+?)\s+\[(\w+)\]$/i,
    extract: m => ({ agent: m[1], type: 'TASK', detail: m[2], statusRaw: m[3] }),
  },
];

const INITIAL_STATE = () => ({
  nova:   { id: 'nova',   status: 'idle', task: 'Awaiting Hermes log...', progress: 0, lastSeen: null },
  forge:  { id: 'forge',  status: 'idle', task: 'Awaiting Hermes log...', progress: 0, lastSeen: null },
  ledger: { id: 'ledger', status: 'idle', task: 'Awaiting Hermes log...', progress: 0, lastSeen: null },
  queen:  { id: 'queen',  status: 'idle', task: 'Awaiting Hermes log...', progress: 0, lastSeen: null },
  atlas:  { id: 'atlas',  status: 'idle', task: 'Awaiting Hermes log...', progress: 0, lastSeen: null },
  cipher: { id: 'cipher', status: 'idle', task: 'Awaiting Hermes log...', progress: 0, lastSeen: null },
});

export class HermesWatcher extends EventEmitter {
  constructor(logPath, { pollIntervalMs = 1000 } = {}) {
    super();
    this.logPath = logPath;
    this.pollIntervalMs = pollIntervalMs;
    this.lastSize = 0;
    this.active = false;
    this.agentState = INITIAL_STATE();

    this._reading = false;      // read in flight
    this._pending = false;      // another read was requested mid-flight
    this._fileWatcher = null;
    this._dirWatcher = null;
    this._poll = null;
  }

  isActive() { return this.active; }
  getAgentState() { return this.agentState; }

  parseLine(line) {
    for (const { re, extract } of LOG_PATTERNS) {
      const m = line.match(re);
      if (m) return extract(m);
    }
    return null;
  }

  applyEvent(evt) {
    if (!evt) return;
    const key = AGENT_ALIASES[(evt.agent || '').toLowerCase()];
    if (!key) return;

    const s = this.agentState[key];
    const now = new Date().toISOString();

    if (evt.type === 'TASK') {
      s.task = evt.detail;
      s.status = (evt.statusRaw || '').toLowerCase().includes('error') ? 'error' : 'processing';
      s.lastSeen = now;
      this.emit('agentUpdate', { agent: key, ...s });
    } else if (evt.type === 'STATUS') {
      const raw = (evt.detail || evt.statusRaw || '').toLowerCase();
      s.status = raw.includes('complet') ? 'active' : raw.includes('error') ? 'error' : 'processing';
      s.lastSeen = now;
      this.emit('agentUpdate', { agent: key, ...s });
    } else if (evt.type === 'COMPLETED') {
      // Surface the completion text as the current task, otherwise the
      // dashboard keeps showing whatever was there before it finished.
      s.task = evt.detail || s.task;
      s.status = 'active';
      s.progress = 100;
      s.lastSeen = now;
      this.emit('taskComplete', { agent: key, result: evt.detail, ...s });
    } else if (evt.type === 'ERROR') {
      s.task = evt.detail || s.task;
      s.status = 'error';
      s.lastSeen = now;
      this.emit('agentUpdate', { agent: key, ...s });
    }
  }

  async readNewLines() {
    // Guard against overlapping reads: a second trigger while a read is in
    // flight would re-read the same byte range and emit duplicate events.
    if (this._reading) { this._pending = true; return; }
    this._reading = true;

    try {
      do {
        this._pending = false;
        if (!existsSync(this.logPath)) return;

        const { size } = statSync(this.logPath);
        if (size < this.lastSize) {
          // Log was truncated/rotated; continue from the new file start.
          this.lastSize = 0;
        }
        if (size === this.lastSize) continue;

        const from = this.lastSize;
        await new Promise((resolve, reject) => {
          // Bound the read to the size we stat'd. Without an explicit end the
          // stream would read past it if the file grows mid-read, while
          // lastSize advances only to `size` — re-reading those bytes next
          // pass and double-emitting. The next trigger picks up the rest.
          const stream = createReadStream(this.logPath, { start: from, end: size - 1 });
          const rl = createInterface({ input: stream });
          rl.on('line', line => { if (line.trim()) this.applyEvent(this.parseLine(line)); });
          rl.on('close', () => { this.lastSize = size; resolve(); });
          stream.on('error', reject);
        });
      } while (this._pending);
    } catch (err) {
      console.error('[Hermes] Read error:', err.message);
    } finally {
      this._reading = false;
    }
  }

  // Watch the log file itself. fs.watch on a *directory* only reliably reports
  // create/rename — appends to an existing file are missed — so the file-level
  // watcher is what actually catches Hermes writing new lines.
  _attachFileWatcher() {
    if (this._fileWatcher || !existsSync(this.logPath)) return;
    try {
      this._fileWatcher = watch(this.logPath, { persistent: false }, () => this.readNewLines());
      this._fileWatcher.on('error', () => { this._fileWatcher = null; });
      this.active = true;
    } catch {
      this._fileWatcher = null;
    }
  }

  start() {
    const dir = path.dirname(path.resolve(this.logPath));
    const filename = path.basename(this.logPath);

    if (existsSync(this.logPath)) {
      this.active = true;
      this.readNewLines(); // pick up anything already in the file
    } else {
      console.log(`[Hermes] Log not found at ${this.logPath} — will watch for it`);
    }

    this._attachFileWatcher();

    // Directory watcher: catches the log being created or rotated, so we can
    // (re)bind the file watcher to the new inode.
    try {
      this._dirWatcher = watch(dir, { persistent: false }, (_, f) => {
        if (f && f !== filename) return;
        if (!existsSync(this.logPath)) return;
        if (this._fileWatcher) { this._fileWatcher.close(); this._fileWatcher = null; }
        this._attachFileWatcher();
        this.readNewLines();
      });
    } catch (err) {
      console.error('[Hermes] Directory watch error:', err.message);
    }

    // Polling safety net. fs.watch is unreliable on Windows, WSL, Docker bind
    // mounts and network shares — exactly where this tends to run — so poll as
    // a backstop. Cheap: a stat that returns early when the size is unchanged.
    this._poll = setInterval(() => {
      if (!existsSync(this.logPath)) return;
      this.active = true;
      if (!this._fileWatcher) this._attachFileWatcher();
      this.readNewLines();
    }, this.pollIntervalMs);
    this._poll.unref?.(); // don't keep the process alive on the poll alone

    console.log(`[Hermes] Watching: ${this.logPath} (events + ${this.pollIntervalMs}ms poll)`);
  }

  stop() {
    clearInterval(this._poll);
    this._fileWatcher?.close();
    this._dirWatcher?.close();
    this._fileWatcher = this._dirWatcher = this._poll = null;
  }
}
