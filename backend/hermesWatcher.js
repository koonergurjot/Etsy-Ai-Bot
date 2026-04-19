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
  constructor(logPath) {
    super();
    this.logPath = logPath;
    this.lastSize = 0;
    this.active = false;
    this.agentState = INITIAL_STATE();
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
      s.status = 'active';
      s.progress = 100;
      s.lastSeen = now;
      this.emit('taskComplete', { agent: key, result: evt.detail, ...s });
    } else if (evt.type === 'ERROR') {
      s.status = 'error';
      s.lastSeen = now;
      this.emit('agentUpdate', { agent: key, ...s });
    }
  }

  async readNewLines() {
    if (!existsSync(this.logPath)) return;
    const { size } = statSync(this.logPath);
    if (size <= this.lastSize) return;

    await new Promise(resolve => {
      const stream = createReadStream(this.logPath, { start: this.lastSize });
      const rl = createInterface({ input: stream });
      rl.on('line', line => { if (line.trim()) this.applyEvent(this.parseLine(line)); });
      rl.on('close', () => { this.lastSize = size; resolve(); });
    });
  }

  start() {
    const dir = path.dirname(path.resolve(this.logPath));
    const filename = path.basename(this.logPath);

    if (!existsSync(this.logPath)) {
      console.log(`[Hermes] Log not found at ${this.logPath} — will watch for it`);
    } else {
      this.active = true;
      this.readNewLines(); // read any existing content on startup
    }

    try {
      watch(dir, { persistent: false }, async (_, f) => {
        if (f && f !== filename) return;
        if (!existsSync(this.logPath)) return;
        this.active = true;
        await this.readNewLines();
      });
      console.log(`[Hermes] Watching: ${this.logPath}`);
    } catch (err) {
      console.error('[Hermes] Watch error:', err.message);
    }
  }
}
