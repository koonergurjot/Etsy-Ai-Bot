import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ═════════════════════════ DATA ═════════════════════════ */

const ZONES = {
  engineering: { name: "Engineering", color: "#ffb000", icon: "⚙", desc: "CI/CD & production workflows" },
  science: { name: "Science Labs", color: "#00ff9d", icon: "⚗", desc: "Research, trends, and intelligence" },
  lifeSupport: { name: "Life Support", color: "#ff5f7a", icon: "♥", desc: "Infrastructure and system vitals" },
  command: { name: "Command", color: "#66f0ff", icon: "⌘", desc: "Strategic oversight and dispatch" },
  comms: { name: "Comms", color: "#4bc9ff", icon: "◉", desc: "Marketing and customer channels" },
  quarters: { name: "Media Bay", color: "#bf8cff", icon: "◈", desc: "Content studio and render queue" },
};

const mk = (o) => ({
  missions: 30, fixes: 0, shift: "CONTINUOUS", priority: 5, autoDispatch: true, channel: "Comms Deck",
  ...o,
});

const BASE_AGENTS = [
  mk({ id: "commander", name: "Commander", role: "Founder & Captain", zone: "command", room: "bridge", color: "#66f0ff", symbol: "★", status: "active", efficiency: 94, xp: 4850, missions: 47, fixes: 3, skills: { leadership: 95, strategy: 90, analytics: 78 }, bio: "Station founder. Oversees all operations.", history: ["Q2 Strategy Review", "Approve new product line"], ticket: { id: "ETSY-501", title: "Approve Q2 product line & KPI review", progress: 62, priority: "HIGH", eta: "1h 20m" } }),
  mk({ id: "ultron", name: "Ultron", role: "Task Dispatcher", zone: "command", room: "bridge", color: "#00ff9d", symbol: "◆", status: "active", efficiency: 97, xp: 3920, missions: 62, fixes: 1, skills: { automation: 98, scheduling: 92, logistics: 85 }, bio: "Neural backbone for command routing.", history: ["Dispatch batch #47", "Optimize task queue"], ticket: { id: "OPS-204", title: "Dispatch 3 design briefs to Forge", progress: 45, priority: "MED", eta: "30m" } }),
  mk({ id: "nova", name: "Nova", role: "Product Research", zone: "science", room: "research", color: "#ff7eb6", symbol: "●", status: "active", efficiency: 89, xp: 3400, missions: 38, skills: { research: 94, analytics: 88, trends: 91 }, bio: "Predictive niche intelligence specialist.", history: ["Trend analysis: Q2 apparel", "Competitor pricing scan"], ticket: { id: "RND-118", title: "Trending niches analysis for May launch", progress: 73, priority: "MED", eta: "2h" } }),
  mk({ id: "forge", name: "Forge", role: "Design & Copy", zone: "engineering", room: "factory", color: "#ffb000", symbol: "▲", status: "active", efficiency: 91, xp: 3100, missions: 44, skills: { design: 96, copywriting: 88, branding: 82 }, bio: "Design fabricator and copy crafter.", history: ["Hoodie mockup batch #12", "Mug design: Developer humor"], ticket: { id: "DES-402", title: "Fixing bug #402 — hoodie mockup export", progress: 88, priority: "HIGH", eta: "12m" } }),
  mk({ id: "pixel", name: "Pixel", role: "Media & Content", zone: "quarters", room: "media", color: "#bf8cff", symbol: "■", status: "processing", efficiency: 85, xp: 2650, missions: 31, skills: { video: 90, photo: 85, social: 92 }, bio: "Visual storytelling and media ops.", history: ["Product photoshoot batch", "TikTok content calendar"], ticket: { id: "MED-089", title: "Render product showcase video", progress: 67, priority: "LOW", eta: "45m" } }),
  mk({ id: "cipher", name: "Cipher", role: "Comms Officer", zone: "comms", room: "comms", color: "#4bc9ff", symbol: "◇", status: "active", efficiency: 87, xp: 2200, missions: 28, skills: { communication: 93, support: 88, seo: 75 }, bio: "Outbound growth and customer messaging.", history: ["Email campaign: Spring sale", "Customer review responses"], ticket: { id: "COM-220", title: "SEO audit for 18 active listings", progress: 30, priority: "MED", eta: "3h" } }),
  mk({ id: "ledger", name: "Ledger", role: "Financial Officer", zone: "command", room: "treasury", color: "#6dff9b", symbol: "▼", status: "active", efficiency: 96, xp: 2900, missions: 40, fixes: 2, skills: { accounting: 97, forecasting: 90, reporting: 88 }, bio: "Treasury and profitability watchdog.", history: ["Monthly P&L report", "Budget reallocation"], ticket: { id: "FIN-077", title: "Reconcile all revenue streams", progress: 92, priority: "HIGH", eta: "5m" } }),
  mk({ id: "atlas", name: "Atlas", role: "Strategy & Intel", zone: "science", room: "warroom", color: "#ff5f7a", symbol: "⬟", status: "error", efficiency: 82, xp: 2100, missions: 25, fixes: 5, skills: { strategy: 91, intel: 87, planning: 84 }, bio: "Strategic planner recovering from feed outage.", history: ["Market intelligence report", "Risk assessment: new platform (failed)"], ticket: { id: "INT-003", title: "Restore data feed — critical failure", progress: 14, priority: "CRITICAL", eta: "HALTED" } }),
  mk({ id: "queen", name: "Queen", role: "Quality Control", zone: "command", room: "bridge", color: "#ff9a5f", symbol: "♛", status: "active", efficiency: 93, xp: 1800, missions: 22, skills: { review: 95, standards: 90, speed: 74 }, bio: "Approves every mockup before it ships.", history: ["Approve mockup batch #11"], ticket: { id: "QC-031", title: "Quality pass on new hoodie designs", progress: 55, priority: "MED", eta: "25m" } }),
];

const ROOMS = [
  { id: "bridge", name: "The Bridge", zone: "command", level: 3, icon: "⌘", color: "#66f0ff", desc: "Global command and KPI oversight" },
  { id: "factory", name: "The Forge", zone: "engineering", level: 2, icon: "⚙", color: "#ffb000", desc: "Design production and automation" },
  { id: "research", name: "Research Lab", zone: "science", level: 2, icon: "⚗", color: "#00ff9d", desc: "Niche and trend intelligence" },
  { id: "warroom", name: "War Room", zone: "science", level: 2, icon: "⚔", color: "#ff5f7a", desc: "Risk and expansion strategy" },
  { id: "comms", name: "Comms Deck", zone: "comms", level: 1, icon: "◉", color: "#4bc9ff", desc: "Campaigns and audience ops" },
  { id: "media", name: "Media Bay", zone: "quarters", level: 2, icon: "◈", color: "#bf8cff", desc: "Render queue and content shots" },
  { id: "treasury", name: "Treasury", zone: "command", level: 1, icon: "◆", color: "#6dff9b", desc: "Revenue command and finance" },
  { id: "archives", name: "Archives", zone: "engineering", level: 1, icon: "◫", color: "#8e96ff", desc: "Storage and historical logs" },
];

const FEED = [
  { agent: "Ultron", color: "#00ff9d", msg: "Dispatching 4 design briefs and 2 listing updates.", tone: "active" },
  { agent: "Ledger", color: "#6dff9b", msg: "Revenue pulse +$42.18 in last 20 minutes.", tone: "good" },
  { agent: "Atlas", color: "#ff5f7a", msg: "War Room intel stream degraded. Rebuilding cache.", tone: "error" },
  { agent: "Nova", color: "#ff7eb6", msg: "Predicted conversion lift: +8.2% on AI niche shirts.", tone: "active" },
  { agent: "Cipher", color: "#4bc9ff", msg: "Campaign open-rate stabilized at 34.1%.", tone: "good" },
];

const SALES = [
  "Introvert's Social Battery Hoodie — $85.44",
  "Caffeine & Code Mug — $27.65",
  "404 Sleep Not Found Tee — $31.50",
  "Works On My Machine Hoodie — $82.00",
  "Ctrl+Z My Monday Mug — $24.99",
];

const TICKET_POOL = [
  { id: "ETSY-502", title: "Review pricing for 5 new products", priority: "MED", eta: "2h" },
  { id: "RND-119", title: "Competitor analysis: summer trends", priority: "MED", eta: "3h" },
  { id: "OPS-205", title: "Optimize task routing queue", priority: "LOW", eta: "1h" },
  { id: "DES-403", title: "Create mug design: gaming niche", priority: "MED", eta: "1h 30m" },
  { id: "MED-090", title: "Edit product photos batch #15", priority: "LOW", eta: "2h" },
  { id: "COM-221", title: "Draft Q3 email campaign", priority: "MED", eta: "4h" },
  { id: "FIN-078", title: "Generate revenue report", priority: "HIGH", eta: "1h" },
  { id: "INT-004", title: "Deploy v2 intelligence model", priority: "MED", eta: "3h" },
];

const INITIAL_PIPELINES = [
  { id: "pl-1", name: "Product Deploy #247", status: "success", duration: "2m 14s", branch: "main" },
  { id: "pl-2", name: "Design Assets Build #89", status: "running", duration: "1m 30s", branch: "feature/new-mugs" },
  { id: "pl-3", name: "Listing Sync #156", status: "success", duration: "45s", branch: "main" },
  { id: "pl-4", name: "Analytics Pipeline #78", status: "failed", duration: "3m 02s", branch: "hotfix/data-feed" },
];

const INITIAL_EXPERIMENTS = [
  { id: "exp-1", name: "Niche Trend Predictor v3", progress: 78, status: "running", researcher: "Nova", eta: "2h 15m", log: ["[09:12] Dataset initialised — 18,420 listings", "[10:03] Clustering phase 1 done — 47 segments", "[11:30] Anomaly in segment #12, reviewing", "[14:22] Trend vectors computed, 94% confidence"] },
  { id: "exp-2", name: "Pricing Elasticity Model", progress: 100, status: "complete", researcher: "Nova", eta: "Done", log: ["[08:00] Training started (2,800 data points)", "[11:00] Validation accuracy 94.2%", "[12:15] Model exported and deployed"] },
  { id: "exp-3", name: "Customer Segment Analysis", progress: 45, status: "running", researcher: "Atlas", eta: "4h 30m", log: ["[10:00] Ingesting 15,000 customer records", "[12:30] 7 initial clusters identified", "[14:00] Validation in progress"] },
  { id: "exp-4", name: "Competitor Product Scraper", progress: 12, status: "error", researcher: "Atlas", eta: "HALTED", log: ["[09:00] Scraper started — 500 competitor products", "[09:15] ⚠ Rate limit hit, backing off", "[09:45] ⚠ IP flagged by target site", "[10:00] ✗ Data feed disconnected — manual intervention required"] },
];

const DATACENTERS = [
  { id: "us-west", name: "US-West (Oregon)", lat: 45, lon: -122, load: 47, color: "#66f0ff" },
  { id: "us-east", name: "US-East (Virginia)", lat: 38, lon: -78, load: 61, color: "#42ffb5" },
  { id: "eu-fra", name: "EU-Frankfurt", lat: 50, lon: 8, load: 72, color: "#ffb000" },
  { id: "eu-lon", name: "EU-London", lat: 51, lon: 0, load: 55, color: "#bf8cff" },
  { id: "ap-sg", name: "AP-Singapore", lat: 1, lon: 104, load: 88, color: "#ff7eb6" },
  { id: "ap-syd", name: "AP-Sydney", lat: -33, lon: 151, load: 34, color: "#6dff9b" },
  { id: "sa-gru", name: "SA-São Paulo", lat: -23, lon: -46, load: 22, color: "#4bc9ff" },
];

const INITIAL_VITALS = { cpu: 34, memory: 62, disk: 45, o2: 98, power: 72, latency: 42, requests: 847, uptime: "47d 12h" };

const statusLabel = { active: "ACTIVE", processing: "PROCESSING", error: "ERROR", idle: "IDLE" };
const statusClass = { active: "st-active", processing: "st-processing", error: "st-error", idle: "st-idle" };
const statusColor = { active: "#42ffb5", processing: "#ffc14f", error: "#ff6f8f", idle: "#8592ad" };
const prioColor = { CRITICAL: "#ff6f8f", HIGH: "#ffb000", MED: "#4bc9ff", LOW: "#8ca4d4" };

/* ═════════════════════════ HELPERS ═════════════════════════ */

const levelOf = (xp) => Math.floor(Math.sqrt(xp / 30));
const levelFloor = (l) => l * l * 30;
const xpProgress = (xp) => {
  const l = levelOf(xp);
  return ((xp - levelFloor(l)) / (levelFloor(l + 1) - levelFloor(l))) * 100;
};

const phaseOf = (d = new Date()) => {
  const h = d.getHours();
  return h >= 6 && h < 12 ? "morning" : h < 17 && h >= 12 ? "afternoon" : h >= 17 && h < 21 ? "evening" : "night";
};
const PHASE_SKY = {
  morning: { bg: "#0a0c18", neb: "255,180,50" },
  afternoon: { bg: "#060913", neb: "98,74,245" },
  evening: { bg: "#0c0614", neb: "220,70,100" },
  night: { bg: "#02030a", neb: "30,40,140" },
};

const hash = (s) => { let h = 0; for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0; return Math.abs(h); };

const roomCrew = (agents, roomId) => agents.filter((a) => a.room === roomId);

const WS_URL = (() => {
  if (typeof window === "undefined") return null;
  const env = import.meta.env?.VITE_WS_URL;
  if (env) return env;
  return ["localhost", "127.0.0.1"].includes(window.location.hostname) ? "ws://localhost:3001" : null;
})();

const loadConfig = () => { try { return JSON.parse(localStorage.getItem("ultronos.config") || "{}"); } catch { return {}; } };
const saveConfig = (cfg) => { try { localStorage.setItem("ultronos.config", JSON.stringify(cfg)); } catch { /* storage unavailable */ } };

/* ═════════════════════════ HOOKS ═════════════════════════ */

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const id = useRef(0);
  const push = useCallback((text, color = "#66f0ff") => {
    const n = ++id.current;
    setToasts((t) => [...t.slice(-3), { id: n, text, color }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== n)), 4200);
  }, []);
  return { toasts, push };
}

function useWebSocket(url, handlers) {
  const [connected, setConnected] = useState(false);
  const ref = useRef(handlers);
  ref.current = handlers;
  useEffect(() => {
    if (!url) return undefined;
    let dead = false, ws, timer, tries = 0;
    const connect = () => {
      if (dead) return;
      try { ws = new WebSocket(url); } catch { return; }
      ws.onopen = () => { tries = 0; setConnected(true); ref.current.onOpen?.(); };
      ws.onmessage = (e) => { try { ref.current.onEvent?.(JSON.parse(e.data)); } catch { /* bad frame */ } };
      ws.onclose = () => {
        setConnected(false);
        if (dead) return;
        ref.current.onClose?.();
        timer = setTimeout(connect, Math.min(30000, 1000 * 2 ** Math.min(tries++, 5)));
      };
      ws.onerror = () => ws.close();
    };
    connect();
    return () => { dead = true; clearTimeout(timer); if (ws) { ws.onclose = null; ws.close(); } };
  }, [url]);
  return connected;
}

/* ═════════════════════════ SMALL COMPONENTS ═════════════════════════ */

const Dot = ({ status, label }) => (
  <span className="dot-wrap">
    <i className={`dot ${statusClass[status]}`} style={{ background: statusColor[status] }} />
    {label && <small style={{ color: statusColor[status] }}>{label}</small>}
  </span>
);

const Bar = ({ value, color, warn }) => (
  <div className="bar"><div style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: warn ? "linear-gradient(90deg,#ffb000,#ff6f8f)" : color || "linear-gradient(90deg,#5d9fff,#43ffbf)" }} /></div>
);

function Starfield() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return undefined;
    const ctx = c.getContext("2d");
    let w = window.innerWidth, h = window.innerHeight;
    c.width = w; c.height = h;
    const stars = Array.from({ length: 240 }, () => ({ x: Math.random() * w, y: Math.random() * h, s: Math.random() * 1.5 + 0.5, p: Math.random() * 0.015 + 0.003 }));
    let raf;
    const draw = () => {
      const sky = PHASE_SKY[phaseOf()];
      const t = Date.now();
      ctx.fillStyle = sky.bg;
      ctx.fillRect(0, 0, w, h);
      stars.forEach((s) => {
        ctx.fillStyle = `rgba(186,208,255,${0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.p + s.x))})`;
        ctx.fillRect(s.x, s.y, s.s, s.s);
      });
      const n = ctx.createRadialGradient(w * 0.75, h * 0.2, 0, w * 0.75, h * 0.2, 340);
      n.addColorStop(0, `rgba(${sky.neb},0.2)`);
      n.addColorStop(1, "transparent");
      ctx.fillStyle = n;
      ctx.fillRect(0, 0, w, h);
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { w = window.innerWidth; h = window.innerHeight; c.width = w; c.height = h; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={ref} className="starfield" aria-hidden />;
}

function AgentBadge({ agent, onClick, onHover }) {
  return (
    <button className={`agent-badge ${statusClass[agent.status]}`} onMouseMove={(e) => onHover(agent, e)} onMouseLeave={() => onHover(null)} onClick={() => onClick(agent)}>
      <span className="agent-avatar" style={{ borderColor: `${agent.color}99`, color: agent.color }}>{agent.symbol}</span>
      <span className="agent-meta">
        <strong style={{ color: agent.color }}>{agent.name}</strong>
        <small>{agent.role}</small>
        <Bar value={xpProgress(agent.xp)} color={agent.color} />
      </span>
      <span className="agent-level">LV {levelOf(agent.xp)}</span>
    </button>
  );
}

function RoomTile({ room, agents, selected, onSelect, onAgentClick, onAgentHover, onRoomHover }) {
  const crew = roomCrew(agents, room.id);
  return (
    <article className={`room-tile ${selected ? "selected" : ""}`} style={{ "--room-color": room.color }} onClick={() => onSelect(room.id)}
      onMouseMove={(e) => onRoomHover(room, e)} onMouseLeave={() => onRoomHover(null)}>
      <header><span>{room.icon}</span><h4>{room.name}</h4><em>LV.{room.level}</em></header>
      <p>{room.desc}</p>
      <div className="occupants-strip">
        {crew.length ? crew.map((a) => (
          <button key={a.id} className="occupant" onClick={(e) => { e.stopPropagation(); onAgentClick(a); }}
            onMouseMove={(e) => { e.stopPropagation(); onAgentHover(a, e); }} onMouseLeave={() => onAgentHover(null)}>
            <Dot status={a.status} /> {a.symbol} {a.name}
          </button>
        )) : <span className="empty-room">No crew assigned</span>}
      </div>
    </article>
  );
}

function ZoneStrip({ agents, active, onPick }) {
  return (
    <div className="zone-strip">
      {Object.entries(ZONES).map(([key, z]) => {
        const crew = agents.filter((a) => a.zone === key);
        const on = crew.filter((a) => a.status === "active").length;
        const proc = crew.filter((a) => a.status === "processing").length;
        const err = crew.filter((a) => a.status === "error").length;
        return (
          <button key={key} className={`zone-card ${active === key ? "on" : ""} ${err ? "alert" : ""}`} style={{ "--z": z.color }} onClick={() => onPick(active === key ? "all" : key)}>
            <div><span>{z.icon}</span> {z.name}</div>
            <Bar value={crew.length ? ((on + proc * 0.5) / crew.length) * 100 : 0} color={z.color} />
            <small>
              <b style={{ color: statusColor.active }}>{on}</b>/<b style={{ color: statusColor.processing }}>{proc}</b>/<b style={{ color: statusColor.error }}>{err}</b> of {crew.length}
              {z.name === "Life Support" && !crew.length ? " · server health" : ""}
            </small>
          </button>
        );
      })}
    </div>
  );
}

/* ═════════════════════════ MODULES ═════════════════════════ */

function LifeSupportModule({ v }) {
  const crit = v.cpu > 80 || v.o2 < 92 || v.memory > 85;
  const rows = [["CPU LOAD", v.cpu, true], ["MEMORY", v.memory, true], ["DISK", v.disk], ["POWER", v.power]];
  return (
    <section className={`module ${crit ? "critical" : ""}`} style={{ "--m": "#ff5f7a" }}>
      <h4>♥ Life Support <Dot status={crit ? "error" : v.cpu > 60 ? "processing" : "active"} /></h4>
      {crit && <div className="alarm">⚠ {v.o2 < 92 ? "O₂ SCRUBBER FAILING" : "SYSTEM LOAD CRITICAL"}</div>}
      {rows.map(([k, val, c]) => (
        <div key={k} className="vital"><span>{k}</span><b>{Math.round(val)}%</b><Bar value={val} warn={c && val > 80} /></div>
      ))}
      <div className="vital-grid">
        <span>UPTIME<b>{v.uptime}</b></span>
        <span>O₂<b style={{ color: v.o2 < 92 ? "#ff6f8f" : "#42ffb5" }}>{Math.round(v.o2)}%</b></span>
        <span>LATENCY<b>{Math.round(v.latency)}ms</b></span>
        <span>REQ/MIN<b>{v.requests}</b></span>
      </div>
    </section>
  );
}

function EngineeringModule({ pipelines }) {
  const icon = { success: "⛏", running: "✦", failed: "✗" };
  const word = { success: "mined", running: "welding", failed: "failed" };
  return (
    <section className="module" style={{ "--m": "#ffb000" }}>
      <h4>⚙ Engineering · CI/CD</h4>
      {pipelines.map((p) => (
        <div key={p.id} className={`pipe ${p.status}`}>
          <span className={`pipe-icon ${p.status}`}>{icon[p.status]}</span>
          <div><strong>{p.name}</strong><small>{p.branch} · {p.duration} · {word[p.status]}</small></div>
        </div>
      ))}
    </section>
  );
}

function ScienceModule({ experiments, onOpen }) {
  const st = { complete: "active", running: "processing", error: "error" };
  return (
    <section className="module" style={{ "--m": "#00ff9d" }}>
      <h4>⚗ Science Labs <small>click for research data</small></h4>
      {experiments.map((e) => (
        <button key={e.id} className="exp" onClick={() => onOpen(e.id)}>
          <div><strong>{e.name}</strong><Dot status={st[e.status]} /></div>
          <Bar value={e.progress} warn={e.status === "error"} />
          <small>{e.researcher} · {Math.round(e.progress)}% · ETA {e.eta}</small>
        </button>
      ))}
    </section>
  );
}

function Leaderboard({ agents, onPick }) {
  const sorted = [...agents].sort((a, b) => b.xp - a.xp);
  const medal = ["#ffd36e", "#c0c8d8", "#cd8a52"];
  return (
    <section className="module" style={{ "--m": "#ffd36e" }}>
      <h4>🏆 Leaderboard</h4>
      {sorted.map((a, i) => (
        <button key={a.id} className="lb-row" onClick={() => onPick(a)}>
          <b style={{ color: medal[i] || "#8ca4d4" }}>{i + 1}</b>
          <span style={{ color: a.color }}>{a.symbol} {a.name}</span>
          <small>{a.missions} missions · {a.fixes} fixes</small>
          <em>LV {levelOf(a.xp)} · {a.xp} XP</em>
        </button>
      ))}
    </section>
  );
}

function Milestones({ items }) {
  return (
    <section className="module" style={{ "--m": "#bf8cff" }}>
      <h4>⚡ Milestones & Unlocks</h4>
      {items.map((m) => (
        <div key={m.id} className={`mile ${m.done ? "done" : ""}`}>
          <div><strong>{m.done ? "✓" : "○"} {m.name}</strong>{m.done && <em>UNLOCKED</em>}</div>
          {!m.done && <Bar value={(m.cur / m.target) * 100} color="linear-gradient(90deg,#bf8cff,#4bc9ff)" />}
          <small>{m.done ? `Reward: ${m.reward}` : `${Math.round(m.cur)} / ${m.target} · unlocks ${m.reward}`}</small>
        </div>
      ))}
    </section>
  );
}

/* ═════════════════════════ GLOBE ═════════════════════════ */

function Globe({ wsOn }) {
  const ref = useRef(null);
  const rot = useRef(0);
  const drag = useRef(null);
  const size = 260;
  useEffect(() => {
    const ctx = ref.current.getContext("2d");
    const cx = size / 2, cy = size / 2, R = size * 0.4;
    const proj = (lat, lon) => {
      const p = (lat * Math.PI) / 180, t = ((lon - rot.current) * Math.PI) / 180;
      return { x: cx + R * Math.cos(p) * Math.sin(t), y: cy - R * Math.sin(p), z: Math.cos(p) * Math.cos(t) };
    };
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
      const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.05, cx, cy, R);
      g.addColorStop(0, "#16306a"); g.addColorStop(1, "#050914");
      ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = "rgba(102,240,255,.14)"; ctx.lineWidth = 0.6;
      for (let lat = -60; lat <= 60; lat += 30) {
        const ph = (lat * Math.PI) / 180;
        ctx.beginPath(); ctx.ellipse(cx, cy - R * Math.sin(ph), R * Math.cos(ph), R * Math.cos(ph) * 0.18, 0, 0, 7); ctx.stroke();
      }
      for (let lon = 0; lon < 180; lon += 30) {
        const t = ((lon - rot.current) * Math.PI) / 180;
        ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(R * Math.sin(t)) + 0.5, R, 0, 0, 7); ctx.stroke();
      }
      ctx.restore();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.strokeStyle = "rgba(102,240,255,.45)"; ctx.lineWidth = 1.2; ctx.stroke();
      const ph = (Date.now() % 2000) / 2000;
      DATACENTERS.forEach((d) => {
        const { x, y, z } = proj(d.lat, d.lon);
        if (z < 0.05) return;
        ctx.globalAlpha = Math.min(1, z + 0.35);
        ctx.beginPath(); ctx.arc(x, y, 3 + ph * 9, 0, 7); ctx.strokeStyle = d.color; ctx.globalAlpha *= 1 - ph; ctx.stroke();
        ctx.globalAlpha = Math.min(1, z + 0.35);
        ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fillStyle = d.color; ctx.fill();
        ctx.globalAlpha = 1;
      });
      if (!drag.current) rot.current = (rot.current + 0.2) % 360;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  const move = (x) => { if (drag.current !== null) { rot.current = (rot.current - (x - drag.current) * 0.5 + 360) % 360; drag.current = x; } };
  return (
    <section className="module globe-module" style={{ "--m": "#66f0ff" }}>
      <h4>◉ Global Infrastructure <small>{DATACENTERS.length} DCs · feed {wsOn ? "LIVE" : "simulated"}</small></h4>
      <div className="globe-row">
        <canvas ref={ref} width={size} height={size} className="globe" style={{ cursor: "grab" }}
          onMouseDown={(e) => { drag.current = e.clientX; }} onMouseMove={(e) => move(e.clientX)}
          onMouseUp={() => { drag.current = null; }} onMouseLeave={() => { drag.current = null; }} />
        <div className="dc-list">
          {DATACENTERS.map((d) => (
            <div key={d.id}>
              <span><i className="dot" style={{ background: d.color }} /> {d.name}</span>
              <Bar value={d.load} color={d.load > 80 ? "#ff6f8f" : d.color} /><small>{d.load}%</small>
            </div>
          ))}
          <small className="hint">drag the globe to rotate</small>
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════ OVERLAYS ═════════════════════════ */

function AgentModal({ agent, onClose, onSave }) {
  const [tab, setTab] = useState("status");
  const [cfg, setCfg] = useState({ zone: agent.zone, room: agent.room, priority: agent.priority, autoDispatch: agent.autoDispatch, shift: agent.shift, channel: agent.channel });
  const rooms = ROOMS.filter((r) => r.zone === cfg.zone);
  const lvl = levelOf(agent.xp);
  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ "--a": agent.color }} onClick={(e) => e.stopPropagation()}>
        <header>
          <span className="big-avatar" style={{ color: agent.color }}>{agent.symbol}</span>
          <div>
            <h2 style={{ color: agent.color }}>{agent.name} <Dot status={agent.status} label={statusLabel[agent.status]} /></h2>
            <p>{agent.role} · {ZONES[agent.zone].name}</p>
            <small>{agent.bio}</small>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </header>
        <div className="xp-row"><b>LEVEL {lvl}</b><small>{agent.xp} / {levelFloor(lvl + 1)} XP</small></div>
        <Bar value={xpProgress(agent.xp)} color={agent.color} />
        <nav className="tabs">
          {["status", "config", "history"].map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}
        </nav>

        {tab === "status" && (
          <div className="tab-body">
            <h5>Current ticket</h5>
            <div className="ticket">
              <span style={{ color: prioColor[agent.ticket.priority] }}>{agent.ticket.id} · {agent.ticket.priority}</span>
              <p>{agent.ticket.title}</p>
              <Bar value={agent.ticket.progress} color={agent.color} /><small>{Math.round(agent.ticket.progress)}% · ETA {agent.ticket.eta}</small>
            </div>
            <h5>Performance</h5>
            <div className="stat-grid">
              <span>Efficiency<b style={{ color: agent.efficiency >= 90 ? "#42ffb5" : "#ffb000" }}>{agent.efficiency}%</b></span>
              <span>Missions<b>{agent.missions}</b></span>
              <span>Critical fixes<b>{agent.fixes}</b></span>
            </div>
            <h5>Skills</h5>
            {Object.entries(agent.skills).map(([k, v]) => (
              <div key={k} className="vital"><span>{k}</span><b>{v}</b><Bar value={v} color={v >= 90 ? "#42ffb5" : v >= 80 ? "#ffb000" : "#ff7eb6"} /></div>
            ))}
          </div>
        )}

        {tab === "config" && (
          <div className="tab-body form">
            <label>Zone<select value={cfg.zone} onChange={(e) => { const z = e.target.value; setCfg((c) => ({ ...c, zone: z, room: ROOMS.find((r) => r.zone === z).id })); }}>
              {Object.entries(ZONES).filter(([k]) => ROOMS.some((r) => r.zone === k)).map(([k, z]) => <option key={k} value={k}>{z.name}</option>)}</select></label>
            <label>Home room<select value={cfg.room} onChange={(e) => set("room", e.target.value)}>
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
            <label>Priority: {cfg.priority}<input type="range" min="1" max="10" value={cfg.priority} onChange={(e) => set("priority", +e.target.value)} /></label>
            <label className="check"><input type="checkbox" checked={cfg.autoDispatch} onChange={(e) => set("autoDispatch", e.target.checked)} /> Auto-dispatch tickets</label>
            <label>Shift<select value={cfg.shift} onChange={(e) => set("shift", e.target.value)}>{["DAY", "NIGHT", "CONTINUOUS"].map((s) => <option key={s}>{s}</option>)}</select></label>
            <label>Notify via<select value={cfg.channel} onChange={(e) => set("channel", e.target.value)}>{["Comms Deck", "Email", "None"].map((s) => <option key={s}>{s}</option>)}</select></label>
            <button className="save" onClick={() => onSave(agent.id, cfg)}>Save configuration</button>
          </div>
        )}

        {tab === "history" && (
          <div className="tab-body">
            <h5>Recent history</h5>
            {[...agent.history].reverse().map((h, i) => <div key={i} className="hist">✓ {h}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}

function HoverCard({ agent, room, x, y, agents }) {
  const style = { left: Math.min(x + 14, window.innerWidth - 270), top: y - 12 };
  if (agent) {
    const h = hash(agent.id);
    return (
      <div className="hover-card" style={style}>
        <strong style={{ color: agent.color }}>{agent.symbol} {agent.name} <Dot status={agent.status} /></strong>
        <p style={{ color: prioColor[agent.ticket.priority] }}>{agent.ticket.id} · {agent.ticket.priority}</p>
        <p>{agent.ticket.title}</p>
        <Bar value={agent.ticket.progress} color={agent.color} />
        <small>{Math.round(agent.ticket.progress)}% · ETA {agent.ticket.eta} · LV {levelOf(agent.xp)} · {agent.efficiency}% eff.</small>
        <small>signal {50 + (h % 50)}% · {agent.room}</small>
      </div>
    );
  }
  if (room) {
    const h = hash(room.id), crew = roomCrew(agents, room.id), t = Date.now() / 1000;
    return (
      <div className="hover-card" style={style}>
        <strong style={{ color: room.color }}>{room.icon} {room.name}</strong>
        <p>COORDS {(h % 90).toString().padStart(2, "0")}.{(h % 97)}°N {(h % 170)}.{(h % 89)}°E</p>
        <p>VELOCITY {(room.level * 1.4 + Math.sin(t + h) * 0.3).toFixed(2)} u/s</p>
        <p>VISIBILITY {crew.some((a) => a.status === "error") ? "OBSCURED" : "CLEAR"} · CREW {crew.length}</p>
      </div>
    );
  }
  return null;
}

function Drawer({ exp, onClose }) {
  if (!exp) return null;
  return (
    <aside className="drawer">
      <button className="x" onClick={onClose}>✕</button>
      <h3>{exp.name}</h3>
      <small>{exp.researcher} · {exp.status.toUpperCase()}</small>
      <Bar value={exp.progress} warn={exp.status === "error"} />
      <h5>Research data</h5>
      <pre>{exp.log.join("\n")}</pre>
    </aside>
  );
}

/* ═════════════════════════ DASHBOARD ═════════════════════════ */

export default function UltronosDashboard() {
  const [agents, setAgents] = useState(() => {
    const cfg = loadConfig();
    return BASE_AGENTS.map((a) => ({ ...a, ...(cfg[a.id] || {}) }));
  });
  const [selectedRoom, setSelectedRoom] = useState("bridge");
  const [selectedId, setSelectedId] = useState(null);
  const [hover, setHover] = useState(null);
  const [feed, setFeed] = useState(FEED);
  const [vitals, setVitals] = useState(INITIAL_VITALS);
  const [pipelines, setPipelines] = useState(INITIAL_PIPELINES);
  const [experiments, setExperiments] = useState(INITIAL_EXPERIMENTS);
  const [openExp, setOpenExp] = useState(null);
  const [stats, setStats] = useState({ revenue: 1886.72, orders: 47, products: 18 });
  const [zoneFilter, setZoneFilter] = useState("all");
  const [view, setView] = useState("station");
  const [clock, setClock] = useState(new Date());
  const { toasts, push } = useToasts();

  const selected = agents.find((a) => a.id === selectedId) || null;

  /* award XP, promote ticket, toast level-ups */
  const agentsRef = useRef(agents);
  agentsRef.current = agents;
  const completeTicket = useCallback((id, result) => {
    const a = agentsRef.current.find((x) => x.id === id);
    if (!a) return;
    const gain = 40 + Math.floor(Math.random() * 60);
    const xp = a.xp + gain;
    const next = TICKET_POOL[Math.floor(Math.random() * TICKET_POOL.length)];
    push(`✓ ${a.name} completed ${a.ticket.id} (+${gain} XP)`, a.color);
    if (levelOf(xp) > levelOf(a.xp)) push(`⬆ ${a.name} reached LEVEL ${levelOf(xp)}!`, "#ffd36e");
    // update the ref immediately so a second call in the same tick cannot double-pay
    agentsRef.current = agentsRef.current.map((x) => (x.id === id ? { ...x, ticket: { ...next, progress: 0 } } : x));
    setAgents((prev) => prev.map((x) => (x.id === id
      ? { ...x, xp: x.xp + gain, missions: x.missions + 1, history: [...x.history.slice(-5), result || x.ticket.title], ticket: { ...next, progress: 0 } }
      : x)));
  }, [push]);

  /* live backend events */
  const onEvent = useCallback((m) => {
    const patch = (key, fn) => setAgents((prev) => prev.map((a) => (a.id === key ? fn(a) : a)));
    if (m.type === "init") {
      if (m.etsyStats) setStats((s) => ({ revenue: m.etsyStats.revenue?.total ?? s.revenue, orders: m.etsyStats.orders?.total ?? s.orders, products: m.etsyStats.products?.active ?? s.products }));
      Object.values(m.agentState || {}).forEach((s) => patch(s.id, (a) => (s.lastSeen ? { ...a, status: s.status, ticket: { ...a.ticket, title: s.task } } : a)));
    } else if (m.type === "agentUpdate") {
      patch(m.agent, (a) => ({ ...a, status: m.status, ticket: { ...a.ticket, title: m.task || a.ticket.title } }));
      setFeed((f) => [{ agent: m.agent, color: "#66f0ff", msg: m.task, tone: m.status === "error" ? "error" : "active" }, ...f].slice(0, 12));
    } else if (m.type === "taskComplete") {
      completeTicket(m.agent, m.result);
      patch(m.agent, (a) => ({ ...a, status: m.status || "active" }));
      setFeed((f) => [{ agent: m.agent, color: "#6dff9b", msg: `Completed: ${m.result}`, tone: "good" }, ...f].slice(0, 12));
    } else if (m.type === "etsyStats") {
      setStats((s) => ({ revenue: m.revenue?.total ?? s.revenue, orders: m.orders?.total ?? s.orders, products: m.products?.active ?? s.products }));
    }
  }, [completeTicket]);

  const live = useWebSocket(WS_URL, {
    onEvent,
    onOpen: () => push("◉ Live backend connected", "#42ffb5"),
    onClose: () => push("Backend offline — simulation mode", "#ffb000"),
  });

  /* clock */
  useEffect(() => { const i = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(i); }, []);

  /* vitals always drift (no backend source yet) */
  useEffect(() => {
    const i = setInterval(() => setVitals((v) => ({
      ...v,
      cpu: Math.max(18, Math.min(96, v.cpu + (Math.random() - 0.5) * 8)),
      memory: Math.max(35, Math.min(92, v.memory + (Math.random() - 0.5) * 5)),
      power: Math.max(50, Math.min(95, v.power + (Math.random() - 0.5) * 4)),
      o2: Math.max(88, Math.min(100, v.o2 + (Math.random() - 0.48))),
      latency: Math.max(16, Math.min(120, v.latency + (Math.random() - 0.5) * 9)),
      requests: v.requests + Math.floor(Math.random() * 9),
    })), 2200);
    return () => clearInterval(i);
  }, []);

  /* simulation only while no live backend */
  useEffect(() => {
    if (live) return undefined;
    const i = setInterval(() => {
      setStats((s) => (Math.random() > 0.6 ? { ...s, revenue: Math.round((s.revenue + Math.random() * 9) * 100) / 100, orders: s.orders + (Math.random() > 0.8 ? 1 : 0) } : s));
      setExperiments((es) => es.map((e) => (e.status === "running" ? { ...e, progress: Math.min(100, e.progress + Math.random() * 1.5), status: e.progress >= 99 ? "complete" : "running" } : e)));
      setPipelines((ps) => ps.map((p) => (p.status === "running" && Math.random() > 0.9 ? { ...p, status: "success" } : p)));
      setFeed((f) => { const r = [...f]; r.push(r.shift()); return r; });
      setAgents((prev) => prev.map((a) => (a.ticket.progress < 100 && a.status !== "error" ? { ...a, ticket: { ...a.ticket, progress: Math.min(100, a.ticket.progress + (Math.random() > 0.55 ? 1 + Math.random() * 3 : 0)) } } : a)));
    }, 2500);
    return () => clearInterval(i);
  }, [live]);

  /* a finished ticket pays out XP and rotates in a new one */
  useEffect(() => {
    agents.forEach((a) => { if (a.ticket.progress >= 100 && a.status !== "error") completeTicket(a.id); });
  }, [agents, completeTicket]);

  /* milestones derive from real numbers; toast on unlock */
  const milestones = useMemo(() => [
    { id: "m1", name: "First Sale", cur: stats.orders, target: 1, reward: "Sales Ticker Module" },
    { id: "m2", name: "Revenue $1,000", cur: stats.revenue, target: 1000, reward: "Treasury Room" },
    { id: "m3", name: "Revenue $5,000", cur: stats.revenue, target: 5000, reward: "War Room Upgrade" },
    { id: "m4", name: "50 Products Live", cur: stats.products, target: 50, reward: "Factory Level 3" },
    { id: "m5", name: "100 Sales", cur: stats.orders, target: 100, reward: "Leaderboard Hologram" },
    { id: "m6", name: "Revenue $10,000", cur: stats.revenue, target: 10000, reward: "Station Expansion" },
  ].map((m) => ({ ...m, done: m.cur >= m.target })), [stats]);
  const seen = useRef(null);
  useEffect(() => {
    const done = new Set(milestones.filter((m) => m.done).map((m) => m.id));
    if (seen.current) milestones.forEach((m) => { if (m.done && !seen.current.has(m.id)) push(`⚡ UNLOCKED: ${m.name} → ${m.reward}`, "#bf8cff"); });
    seen.current = done;
  }, [milestones, push]);

  const saveAgentConfig = useCallback((id, cfg) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...cfg } : a)));
    const all = loadConfig();
    all[id] = cfg;
    saveConfig(all);
    push(`Configuration saved for ${id}`, "#42ffb5");
  }, [push]);

  const onAgentHover = useCallback((agent, e) => setHover(agent && e ? { agent, x: e.clientX, y: e.clientY } : null), []);
  const onRoomHover = useCallback((room, e) => setHover(room && e ? { room, x: e.clientX, y: e.clientY } : null), []);

  const activeCount = agents.filter((a) => a.status === "active").length;
  const errCount = agents.filter((a) => a.status === "error").length;
  const rooms = zoneFilter === "all" ? ROOMS : ROOMS.filter((r) => r.zone === zoneFilter);
  const room = ROOMS.find((r) => r.id === selectedRoom);
  const crew = room ? roomCrew(agents, room.id) : [];
  const phase = phaseOf(clock);
  const openExperiment = experiments.find((e) => e.id === openExp);
  const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="ultronos">
      <Starfield />
      <div className="scanline" />

      <header className="command-bar">
        <div>
          <h1>ULTRONOS // COMMAND DECK</h1>
          <p>AI Etsy Print-on-Demand Station · <Dot status={live ? "active" : "processing"} label={live ? "LIVE BACKEND" : "SIMULATED"} /> {errCount > 0 && <Dot status="error" label={`${errCount} ALERT${errCount > 1 ? "S" : ""}`} />}</p>
        </div>
        <div className="headline-metrics">
          <span><label>Revenue</label><strong>${fmt(stats.revenue)}</strong></span>
          <span><label>Orders</label><strong>{stats.orders}</strong></span>
          <span><label>Crew</label><strong>{activeCount}/{agents.length}</strong></span>
          <span><label>Latency</label><strong>{Math.round(vitals.latency)}ms</strong></span>
          <span><label>{phase}</label><strong>{clock.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</strong></span>
        </div>
      </header>

      <nav className="view-tabs">
        {[["station", "⌘ Station"], ["modules", "◈ Modules"], ["globe", "◉ Globe"]].map(([k, l]) => (
          <button key={k} className={view === k ? "on" : ""} onClick={() => setView(k)}>{l}</button>
        ))}
      </nav>

      <main className="command-grid">
        <aside className="panel crew-panel">
          <div className="panel-title"><h3>Crew Agents</h3><small>click for dossier</small></div>
          <div className="agent-list">
            {agents.map((a) => <AgentBadge key={a.id} agent={a} onClick={(x) => setSelectedId(x.id)} onHover={onAgentHover} />)}
          </div>
          <section className="mini-vitals">
            <h4>Ship Status</h4>
            {[["CPU", vitals.cpu], ["Memory", vitals.memory], ["O₂", vitals.o2], ["Power", vitals.power]].map(([k, v]) => <div key={k}><span>{k}</span><strong>{Math.round(v)}%</strong></div>)}
          </section>
        </aside>

        <section className="panel station-panel">
          {view === "station" && (
            <>
              <div className="panel-title"><h3>Station Map</h3><small>{zoneFilter === "all" ? "all zones" : ZONES[zoneFilter].name} · active/processing/error</small></div>
              <ZoneStrip agents={agents} active={zoneFilter} onPick={setZoneFilter} />
              <div className="rooms-grid">
                {rooms.map((r) => (
                  <RoomTile key={r.id} room={r} agents={agents} selected={r.id === selectedRoom} onSelect={setSelectedRoom}
                    onAgentClick={(a) => setSelectedId(a.id)} onAgentHover={onAgentHover} onRoomHover={onRoomHover} />
                ))}
              </div>
              <section className="telemetry-grid">
                <article>
                  <h4>Revenue Telemetry</h4>
                  <div className="big-stat">${fmt(stats.revenue)}</div>
                  <div className="sparkline">{Array.from({ length: 18 }).map((_, i) => <span key={i} style={{ height: `${30 + ((i * 17) % 60)}%` }} />)}</div>
                </article>
                <article>
                  <h4>Live Activity Feed</h4>
                  <div className="feed-list">
                    {feed.map((f, i) => <p key={`${f.agent}-${i}`} className={f.tone}><b style={{ color: f.color }}>{f.agent}</b> {f.msg}</p>)}
                  </div>
                </article>
              </section>
            </>
          )}
          {view === "modules" && (
            <div className="modules-grid">
              <LifeSupportModule v={vitals} />
              <EngineeringModule pipelines={pipelines} />
              <ScienceModule experiments={experiments} onOpen={setOpenExp} />
              <Leaderboard agents={agents} onPick={(a) => setSelectedId(a.id)} />
              <div className="span-2"><Milestones items={milestones} /></div>
            </div>
          )}
          {view === "globe" && <div className="modules-grid"><div className="span-2"><Globe wsOn={live} /></div></div>}
        </section>

        <aside className="panel detail-panel">
          <div className="panel-title"><h3>Selected Room</h3><small>{room?.name}</small></div>
          {room && (
            <>
              <article className="room-focus" style={{ "--room-color": room.color }}>
                <h4>{room.icon} {room.name}</h4>
                <p>{room.desc}</p>
                <div className="room-stats">
                  <span>Level <strong>{room.level}</strong></span>
                  <span>Crew <strong>{crew.length}</strong></span>
                  <span>Status <strong>{crew.some((a) => a.status === "error") ? "Alert" : "Stable"}</strong></span>
                </div>
              </article>
              <div className="crew-mini-list">
                {crew.length ? crew.map((a) => (
                  <button key={a.id} onClick={() => setSelectedId(a.id)} className="mini-crew">
                    <Dot status={a.status} /><span style={{ color: a.color }}>{a.symbol}</span><span>{a.name}</span><small>{statusLabel[a.status]}</small>
                  </button>
                )) : <p className="empty-room">No one stationed here.</p>}
              </div>
            </>
          )}
          <article className="agent-dossier">
            <h4>Quick Dossier</h4>
            {selected ? (
              <>
                <header><span style={{ color: selected.color }}>{selected.symbol}</span>
                  <div><strong style={{ color: selected.color }}>{selected.name}</strong><small>{selected.role}</small></div>
                  <Dot status={selected.status} label={statusLabel[selected.status]} /></header>
                <p>{selected.ticket.id}: {selected.ticket.title}</p>
                <Bar value={selected.ticket.progress} color={selected.color} />
              </>
            ) : <p>Click any crew member to open their full Personal Status window.</p>}
          </article>
        </aside>
      </main>

      <footer className="sales-ticker">
        <strong>Live Sales</strong>
        <div className="ticker-track">{[...SALES, ...SALES].map((s, i) => <span key={`${s}-${i}`}>{s}</span>)}</div>
      </footer>

      {hover && !selected && <HoverCard {...hover} agents={agents} />}
      {selected && <AgentModal key={selected.id} agent={selected} onClose={() => setSelectedId(null)} onSave={saveAgentConfig} />}
      <Drawer exp={openExperiment} onClose={() => setOpenExp(null)} />
      <div className="toasts">{toasts.map((t) => <div key={t.id} className="toast" style={{ borderColor: t.color, color: t.color }}>{t.text}</div>)}</div>
    </div>
  );
}
