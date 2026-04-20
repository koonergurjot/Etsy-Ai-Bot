import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// WEBSOCKET — Real-time data from ULTRONOS backend
// Falls back to simulation automatically when backend is offline
// ═══════════════════════════════════════════════════════════════

function useRealtimeData() {
  const [connected, setConnected] = useState(false);
  const [wsEtsyStats, setWsEtsyStats] = useState(null);
  const [agentUpdates, setAgentUpdates] = useState({});
  const wsRef = useRef(null);
  const retryRef = useRef(null);

  useEffect(() => {
    const WS_URL = import.meta.env?.VITE_WS_URL || "ws://localhost:3001";

    function connect() {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;
        ws.onopen = () => { setConnected(true); clearTimeout(retryRef.current); };
        ws.onmessage = ({ data }) => {
          try {
            const msg = JSON.parse(data);
            if (msg.type === "init") {
              if (msg.etsyStats) setWsEtsyStats(msg.etsyStats);
              if (msg.agentState) setAgentUpdates(msg.agentState);
            } else if (msg.type === "etsyStats") {
              setWsEtsyStats(msg);
            } else if (msg.type === "agentUpdate" || msg.type === "taskComplete") {
              setAgentUpdates(prev => ({ ...prev, [msg.agent]: msg }));
            }
          } catch { /* ignore parse errors */ }
        };
        ws.onclose = () => { setConnected(false); retryRef.current = setTimeout(connect, 4000); };
        ws.onerror = () => ws.close();
      } catch {
        retryRef.current = setTimeout(connect, 4000);
      }
    }

    connect();
    return () => { clearTimeout(retryRef.current); wsRef.current?.close(); };
  }, []);

  return { connected, wsEtsyStats, agentUpdates };
}

// ═══════════════════════════════════════════════════════════════
// DATA — Rich mock data for the ULTRONOS Space Station Dashboard
// ═══════════════════════════════════════════════════════════════

const ZONES = {
  engineering: { name: "Engineering", color: "#ffb000", icon: "⚙", desc: "CI/CD Pipelines & Production", category: "ops" },
  science: { name: "Science Labs", color: "#00ff41", icon: "⚗", desc: "R&D & Analytics", category: "research" },
  lifeSupport: { name: "Life Support", color: "#ff4040", icon: "♥", desc: "Server Health & Vitals", category: "critical" },
  command: { name: "Command", color: "#00ffff", icon: "⌘", desc: "Strategy & Oversight", category: "command" },
  comms: { name: "Communications", color: "#00ddff", icon: "◉", desc: "Outreach & Marketing", category: "ops" },
  quarters: { name: "Crew Quarters", color: "#bf5fff", icon: "◈", desc: "Content & Media", category: "support" },
};

const AGENTS = [
  {
    id: "commander", name: "Commander", role: "Founder & Captain", zone: "command",
    color: "#00ffff", symbol: "★", status: "active", xp: 4850, level: 12,
    skills: { leadership: 95, strategy: 90, analytics: 78, creativity: 65 },
    taskHistory: [
      { task: "Q2 Strategy Review", status: "completed", xpEarned: 120 },
      { task: "Approve new product line", status: "completed", xpEarned: 80 },
      { task: "Team performance review", status: "in_progress", xpEarned: 0 },
    ],
    currentTask: "Reviewing station-wide KPIs",
    efficiency: 94, missionsCompleted: 47, criticalFixes: 3,
    bio: "Station founder. Oversees all operations with an iron will and pixel heart.",
  },
  {
    id: "ultron", name: "Ultron", role: "Task Dispatcher", zone: "command",
    color: "#00ff41", symbol: "◆", status: "active", xp: 3920, level: 10,
    skills: { automation: 98, scheduling: 92, logistics: 85, coding: 70 },
    taskHistory: [
      { task: "Dispatch batch #47", status: "completed", xpEarned: 60 },
      { task: "Optimize task queue", status: "completed", xpEarned: 100 },
      { task: "Auto-assign sprint tickets", status: "completed", xpEarned: 75 },
    ],
    currentTask: "Dispatching design briefs to Forge",
    efficiency: 97, missionsCompleted: 62, criticalFixes: 1,
    bio: "The station's neural backbone. Routes every task with millisecond precision.",
  },
  {
    id: "nova", name: "Nova", role: "Product Research", zone: "science",
    color: "#ff6b9d", symbol: "●", status: "active", xp: 3400, level: 9,
    skills: { research: 94, analytics: 88, trendSpotting: 91, creativity: 76 },
    taskHistory: [
      { task: "Trend analysis: Q2 apparel", status: "completed", xpEarned: 90 },
      { task: "Competitor pricing scan", status: "completed", xpEarned: 70 },
      { task: "Customer sentiment report", status: "in_progress", xpEarned: 0 },
    ],
    currentTask: "Analyzing trending niches for May launch",
    efficiency: 89, missionsCompleted: 38, criticalFixes: 0,
    bio: "Data scientist with an eye for trends. Her models predict revenue with 92% accuracy.",
  },
  {
    id: "forge", name: "Forge", role: "Design & Copy", zone: "engineering",
    color: "#ffb000", symbol: "▲", status: "active", xp: 3100, level: 8,
    skills: { design: 96, copywriting: 88, branding: 82, speed: 71 },
    taskHistory: [
      { task: "Hoodie mockup batch #12", status: "completed", xpEarned: 85 },
      { task: "Mug design: Developer humor", status: "completed", xpEarned: 65 },
      { task: "Brand guideline update", status: "completed", xpEarned: 110 },
    ],
    currentTask: "Creating new t-shirt designs for tech niche",
    efficiency: 91, missionsCompleted: 44, criticalFixes: 0,
    bio: "Master craftsman. Every pixel placed with purpose. Ships designs at warp speed.",
  },
  {
    id: "pixel", name: "Pixel", role: "Media & Content", zone: "quarters",
    color: "#bf5fff", symbol: "■", status: "processing", xp: 2650, level: 7,
    skills: { videoEditing: 90, photography: 85, socialMedia: 92, animation: 78 },
    taskHistory: [
      { task: "Product photoshoot batch", status: "completed", xpEarned: 80 },
      { task: "TikTok content calendar", status: "completed", xpEarned: 60 },
      { task: "Instagram reel series", status: "in_progress", xpEarned: 0 },
    ],
    currentTask: "Rendering product showcase video",
    efficiency: 85, missionsCompleted: 31, criticalFixes: 0,
    bio: "Visual storyteller. Turns products into experiences through lens and light.",
  },
  {
    id: "cipher", name: "Cipher", role: "Comms Officer", zone: "comms",
    color: "#00ddff", symbol: "◇", status: "active", xp: 2200, level: 6,
    skills: { communication: 93, customerService: 88, marketing: 80, seo: 75 },
    taskHistory: [
      { task: "Email campaign: Spring sale", status: "completed", xpEarned: 70 },
      { task: "Customer review responses", status: "completed", xpEarned: 40 },
      { task: "SEO audit: product listings", status: "in_progress", xpEarned: 0 },
    ],
    currentTask: "Drafting customer outreach messages",
    efficiency: 87, missionsCompleted: 28, criticalFixes: 0,
    bio: "The station's voice. Every message crafted to connect and convert.",
  },
  {
    id: "ledger", name: "Ledger", role: "Financial Officer", zone: "command",
    color: "#41ff90", symbol: "▼", status: "active", xp: 2900, level: 8,
    skills: { accounting: 97, forecasting: 90, reporting: 88, compliance: 82 },
    taskHistory: [
      { task: "Monthly P&L report", status: "completed", xpEarned: 100 },
      { task: "Tax prep: Q1 2026", status: "completed", xpEarned: 120 },
      { task: "Budget reallocation", status: "completed", xpEarned: 60 },
    ],
    currentTask: "Reconciling revenue streams",
    efficiency: 96, missionsCompleted: 40, criticalFixes: 2,
    bio: "Numbers don't lie, and neither does Ledger. Keeps the treasury airtight.",
  },
  {
    id: "atlas", name: "Atlas", role: "Strategy & Intel", zone: "science",
    color: "#ff4040", symbol: "⬟", status: "error", xp: 2100, level: 6,
    skills: { strategy: 91, intelligence: 87, planning: 84, competitive: 80 },
    taskHistory: [
      { task: "Market intelligence report", status: "completed", xpEarned: 95 },
      { task: "Expansion feasibility study", status: "completed", xpEarned: 85 },
      { task: "Risk assessment: new platform", status: "error", xpEarned: 0 },
    ],
    currentTask: "⚠ ERROR: Data feed interrupted",
    efficiency: 82, missionsCompleted: 25, criticalFixes: 5,
    bio: "Strategic mastermind with eyes everywhere. Currently troubleshooting a data anomaly.",
  },
];

const ROOMS = [
  { id: "bridge", name: "The Bridge", zone: "command", level: 3, icon: "⌘", color: "#00ffff", desc: "Command center — all station operations monitored here" },
  { id: "media", name: "Media Bay", zone: "quarters", level: 2, icon: "◈", color: "#bf5fff", desc: "Content creation studio with rendering capabilities" },
  { id: "research", name: "Research Lab", zone: "science", level: 2, icon: "⚗", color: "#00ff41", desc: "Product research & analytics processing" },
  { id: "comms", name: "Comms Deck", zone: "comms", level: 1, icon: "◉", color: "#00ddff", desc: "External communications & marketing ops" },
  { id: "warroom", name: "War Room", zone: "science", level: 2, icon: "⚔", color: "#ff4040", desc: "Strategic planning & competitive intel" },
  { id: "factory", name: "The Forge", zone: "engineering", level: 2, icon: "⚙", color: "#ffb000", desc: "Design production & CI/CD pipeline hub" },
  { id: "treasury", name: "Treasury", zone: "command", level: 1, icon: "◆", color: "#41ff90", desc: "Financial operations & revenue tracking" },
  { id: "archives", name: "The Archives", zone: "engineering", level: 1, icon: "◫", color: "#8888ff", desc: "Data storage & system logs" },
];

const COMMS = [
  { agent: "Nova", color: "#ff6b9d", time: "02:45 PM", msg: "Models predict $2,000 total revenue by next week if velocity holds. Should we accelerate production?" },
  { agent: "Atlas", color: "#ff4040", time: "02:51 PM", msg: "⚠ My data feed just dropped. Running diagnostics. War Room systems at 60% capacity." },
  { agent: "Forge", color: "#ffb000", time: "02:57 PM", msg: "New hoodie designs rendering. ETA 12 minutes. Quality pass rate: 94%." },
  { agent: "Ledger", color: "#41ff90", time: "03:12 PM", msg: "Revenue update: $1,886.72 confirmed. Margins holding at 42%. Treasury is green." },
  { agent: "Ultron", color: "#00ff41", time: "03:18 PM", msg: "Dispatching: 3 design briefs → Forge, 2 trend reports → Nova, 1 audit → Cipher." },
  { agent: "Pixel", color: "#bf5fff", time: "03:24 PM", msg: "Product showcase video at 67% render. GPU temperature nominal." },
  { agent: "Cipher", color: "#00ddff", time: "03:31 PM", msg: "Spring email campaign open rate: 34%. Click-through up 12% from last month." },
  { agent: "Commander", color: "#00ffff", time: "03:40 PM", msg: "Good work crew. Atlas — get that data feed back online ASAP. All hands, stay sharp." },
];

const SALES = [
  { product: "Introvert's Social Battery Hoodie", price: "$85.44", buyer: "Lauren C.", time: "3m ago" },
  { product: "Caffeine & Code Vita Mug", price: "$27.65", buyer: "Marcus Q.", time: "7m ago" },
  { product: "Social Battery Running Low Tee", price: "$34.99", buyer: "Brittany K.", time: "14m ago" },
  { product: "Debugging My Life Hoodie", price: "$79.00", buyer: "Devon R.", time: "22m ago" },
  { product: "404 Sleep Not Found Tee", price: "$31.50", buyer: "Aisha M.", time: "38m ago" },
  { product: "Ctrl+Z My Monday Mug", price: "$24.99", buyer: "James L.", time: "45m ago" },
  { product: "git commit -m 'fix everything' Tee", price: "$32.00", buyer: "Chen W.", time: "1h ago" },
  { product: "Works On My Machine Hoodie", price: "$82.00", buyer: "Priya S.", time: "1h ago" },
];

// Server vitals for Life Support module
const INITIAL_VITALS = {
  cpu: 34, memory: 62, disk: 45, uptime: "47d 12h 33m",
  network: 12.4, requests: 847, errors: 2, latency: 42,
  o2Level: 98, powerDraw: 72, hullIntegrity: 100, shieldStatus: "STANDBY",
};

// CI/CD Pipeline data for Engineering module
const PIPELINES = [
  { id: "pl-1", name: "Product Deploy #247", status: "success", duration: "2m 14s", branch: "main", time: "12m ago" },
  { id: "pl-2", name: "Design Assets Build #89", status: "running", duration: "1m 30s", branch: "feature/new-mugs", time: "now" },
  { id: "pl-3", name: "Listing Sync #156", status: "success", duration: "45s", branch: "main", time: "1h ago" },
  { id: "pl-4", name: "Analytics Pipeline #78", status: "failed", duration: "3m 02s", branch: "hotfix/data-feed", time: "2h ago" },
  { id: "pl-5", name: "SEO Crawler #34", status: "success", duration: "1m 58s", branch: "main", time: "3h ago" },
];

// Research experiments for Science Labs
const EXPERIMENTS = [
  { id: "exp-1", name: "Niche Trend Predictor v3", progress: 78, status: "running", researcher: "Nova", eta: "2h 15m" },
  { id: "exp-2", name: "Pricing Elasticity Model", progress: 100, status: "complete", researcher: "Nova", eta: "Done" },
  { id: "exp-3", name: "Customer Segment Analysis", progress: 45, status: "running", researcher: "Atlas", eta: "4h 30m" },
  { id: "exp-4", name: "Competitor Product Scraper", progress: 12, status: "error", researcher: "Atlas", eta: "HALTED" },
];

// Milestones for unlock system
const MILESTONES = [
  { id: "m1", name: "First Sale", target: 1, current: 1, unlocked: true, reward: "Sales Ticker Module" },
  { id: "m2", name: "Revenue $1,000", target: 1000, current: 1886, unlocked: true, reward: "Treasury Room" },
  { id: "m3", name: "Revenue $5,000", target: 5000, current: 1886, unlocked: false, reward: "War Room Upgrade" },
  { id: "m4", name: "50 Products Live", target: 50, current: 18, unlocked: false, reward: "Factory Level 3" },
  { id: "m5", name: "Revenue $10,000", target: 10000, current: 1886, unlocked: false, reward: "Station Expansion" },
  { id: "m6", name: "100 Sales", target: 100, current: 47, unlocked: false, reward: "Leaderboard Hologram" },
];

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function getXpForLevel(level) { return level * level * 50; }
function getXpProgress(agent) {
  const currentLevelXp = getXpForLevel(agent.level);
  const nextLevelXp = getXpForLevel(agent.level + 1);
  return ((agent.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
}

function getDayNightPhase() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function getDayNightColors() {
  const phase = getDayNightPhase();
  switch (phase) {
    case "morning": return { bg: "#0a0c18", nebula1: "rgba(80,60,180,0.06)", nebula2: "rgba(255,180,50,0.03)", ambient: "rgba(255,200,100,0.02)" };
    case "afternoon": return { bg: "#08081a", nebula1: "rgba(100,0,180,0.06)", nebula2: "rgba(0,100,200,0.04)", ambient: "rgba(100,200,255,0.015)" };
    case "evening": return { bg: "#060612", nebula1: "rgba(180,50,80,0.07)", nebula2: "rgba(100,0,180,0.05)", ambient: "rgba(255,100,50,0.02)" };
    case "night": return { bg: "#030308", nebula1: "rgba(30,0,80,0.08)", nebula2: "rgba(0,30,80,0.04)", ambient: "rgba(50,50,100,0.015)" };
  }
}

const statusColor = (s) => s === "active" ? "#00ff41" : s === "processing" ? "#ffb000" : s === "error" ? "#ff4040" : "#555";
const statusLabel = (s) => s === "active" ? "ACTIVE" : s === "processing" ? "PROCESSING" : s === "error" ? "ERROR" : "IDLE";

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

// --- Starfield Background ---
function Starfield() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let w = window.innerWidth, h = window.innerHeight;
    c.width = w; c.height = h;
    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      s: Math.random() * 1.8 + 0.3, b: Math.random(), sp: Math.random() * 0.008 + 0.002,
    }));
    let raf;
    const draw = () => {
      const colors = getDayNightColors();
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const t = Date.now();
      for (const s of stars) {
        const a = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * s.sp + s.b * 6.28));
        ctx.fillStyle = `rgba(200,210,255,${a})`;
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.s > 1 ? 2 : 1, s.s > 1 ? 2 : 1);
      }
      // Nebula glows
      const grd = ctx.createRadialGradient(w * 0.75, h * 0.2, 0, w * 0.75, h * 0.2, 350);
      grd.addColorStop(0, colors.nebula1);
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
      const grd2 = ctx.createRadialGradient(w * 0.2, h * 0.7, 0, w * 0.2, h * 0.7, 250);
      grd2.addColorStop(0, colors.nebula2);
      grd2.addColorStop(1, "transparent");
      ctx.fillStyle = grd2;
      ctx.fillRect(0, 0, w, h);
      // Ambient overlay
      ctx.fillStyle = colors.ambient;
      ctx.fillRect(0, 0, w, h);
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { w = window.innerWidth; h = window.innerHeight; c.width = w; c.height = h; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0 }} />;
}

// --- Pixel Character SVG ---
function PixelChar({ color, size = 16, animate, status }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!animate) return;
    const iv = setInterval(() => setFrame(f => (f + 1) % 2), 600);
    return () => clearInterval(iv);
  }, [animate]);
  const offy = frame === 1 ? -1 : 0;
  const w = size, h = size * 1.25;
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg width={w} height={h} viewBox="0 0 8 10" style={{ imageRendering: "pixelated", transform: `translateY(${offy}px)` }}>
        <rect x="2" y="0" width="4" height="3" fill={color} />
        <rect x="3" y="1" width="1" height="1" fill="#0a0a14" />
        <rect x="5" y="1" width="1" height="1" fill="#0a0a14" />
        <rect x="1" y="3" width="6" height="4" fill={color} opacity="0.85" />
        <rect x="0" y="4" width="1" height="2" fill={color} opacity="0.6" />
        <rect x="7" y="4" width="1" height="2" fill={color} opacity="0.6" />
        <rect x="2" y="7" width="2" height="3" fill={color} opacity="0.7" />
        <rect x="4" y="7" width="2" height="3" fill={color} opacity="0.7" />
      </svg>
      {/* Status indicator dot */}
      <div style={{
        position: "absolute", bottom: -2, right: -2, width: 6, height: 6, borderRadius: "50%",
        background: statusColor(status), border: "1.5px solid #0a0a14",
        boxShadow: status === "error" ? "0 0 6px #ff4040" : status === "active" ? "0 0 4px #00ff41" : "none",
      }} />
    </div>
  );
}

// --- Status Indicator Circle ---
function StatusDot({ status, size = 8, label }) {
  const color = statusColor(status);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%", background: color,
        boxShadow: `0 0 ${size}px ${color}66`,
        animation: status === "error" ? "pulse-glow 1.5s infinite" : status === "active" ? "pulse-glow 3s infinite" : "none",
      }} />
      {label && <span style={{ fontSize: 9, color, fontFamily: "'VT323', monospace", letterSpacing: 1 }}>{label}</span>}
    </div>
  );
}

// --- Life Support Vitals Module ---
function LifeSupportModule({ vitals }) {
  const VitalBar = ({ label, value, max = 100, unit = "%", color, critical }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3 }}>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
        <span style={{ color: critical && value > 80 ? "#ff4040" : color }}>{value}{unit}</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          width: `${Math.min((value / max) * 100, 100)}%`, height: "100%", borderRadius: 2,
          background: critical && value > 80 ? `linear-gradient(90deg, ${color}, #ff4040)` : color,
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
  return (
    <div style={{
      background: "rgba(8,8,20,0.9)", border: "1px solid rgba(255,64,64,0.15)", borderRadius: 6,
      padding: 14, position: "relative", overflow: "hidden",
    }}>
      {vitals.cpu > 80 && <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none",
        animation: "alert-pulse 2s infinite", borderRadius: 6,
      }} />}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ color: "#ff4040", fontSize: 14 }}>♥</span>
        <span style={{ color: "#ff4040", fontSize: 12, fontFamily: "'Orbitron', sans-serif", fontWeight: 700, letterSpacing: 2 }}>LIFE SUPPORT</span>
        <div style={{ marginLeft: "auto" }}>
          <StatusDot status={vitals.cpu > 80 ? "error" : vitals.cpu > 60 ? "processing" : "active"} size={6} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <VitalBar label="CPU LOAD" value={vitals.cpu} color="#00ffff" critical />
        <VitalBar label="MEMORY" value={vitals.memory} color="#bf5fff" critical />
        <VitalBar label="DISK" value={vitals.disk} color="#ffb000" />
        <VitalBar label="POWER DRAW" value={vitals.powerDraw} color="#41ff90" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {[
          { label: "UPTIME", value: vitals.uptime, color: "#00ff41" },
          { label: "O₂ LEVEL", value: `${vitals.o2Level}%`, color: vitals.o2Level < 90 ? "#ff4040" : "#00ff41" },
          { label: "HULL", value: `${vitals.hullIntegrity}%`, color: "#00ffff" },
          { label: "SHIELDS", value: vitals.shieldStatus, color: "#ffb000" },
        ].map((v, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>{v.label}</div>
            <div style={{ fontSize: 12, color: v.color, fontFamily: "'VT323', monospace" }}>{v.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Engineering / CI/CD Pipeline Module ---
function EngineeringModule({ pipelines }) {
  const pipelineColor = (s) => s === "success" ? "#00ff41" : s === "running" ? "#00ddff" : "#ff4040";
  const pipelineIcon = (s) => s === "success" ? "✓" : s === "running" ? "⟳" : "✗";
  return (
    <div style={{
      background: "rgba(8,8,20,0.9)", border: "1px solid rgba(255,176,0,0.15)", borderRadius: 6,
      padding: 14, overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ color: "#ffb000", fontSize: 14 }}>⚙</span>
        <span style={{ color: "#ffb000", fontSize: 12, fontFamily: "'Orbitron', sans-serif", fontWeight: 700, letterSpacing: 2 }}>ENGINEERING</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>CI/CD PIPELINE</span>
      </div>
      {pipelines.map((p) => (
        <div key={p.id} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", marginBottom: 4,
          background: "rgba(255,255,255,0.02)", borderRadius: 3,
          borderLeft: `2px solid ${pipelineColor(p.status)}`,
        }}>
          <span style={{ color: pipelineColor(p.status), fontSize: 12, width: 16, textAlign: "center",
            animation: p.status === "running" ? "pulse-glow 1s infinite" : "none" }}>
            {pipelineIcon(p.status)}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>{p.branch} · {p.duration}</div>
          </div>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)" }}>{p.time}</span>
        </div>
      ))}
    </div>
  );
}

// --- Science Labs / Experiments Module ---
function ScienceLabModule({ experiments }) {
  const expColor = (s) => s === "complete" ? "#00ff41" : s === "running" ? "#00ddff" : "#ff4040";
  return (
    <div style={{
      background: "rgba(8,8,20,0.9)", border: "1px solid rgba(0,255,65,0.15)", borderRadius: 6,
      padding: 14, overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ color: "#00ff41", fontSize: 14 }}>⚗</span>
        <span style={{ color: "#00ff41", fontSize: 12, fontFamily: "'Orbitron', sans-serif", fontWeight: 700, letterSpacing: 2 }}>SCIENCE LABS</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>R&D OPS</span>
      </div>
      {experiments.map((exp) => (
        <div key={exp.id} style={{
          padding: "8px", marginBottom: 6, background: "rgba(255,255,255,0.02)", borderRadius: 4,
          borderLeft: `2px solid ${expColor(exp.status)}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{exp.name}</span>
            <StatusDot status={exp.status === "complete" ? "active" : exp.status === "running" ? "processing" : "error"} size={5} />
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
            <div style={{
              width: `${exp.progress}%`, height: "100%", borderRadius: 2,
              background: exp.status === "error" ? "#ff4040" : `linear-gradient(90deg, #00ff41, #00ddff)`,
              transition: "width 1s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "rgba(255,255,255,0.25)" }}>
            <span>Researcher: {exp.researcher}</span>
            <span>ETA: {exp.eta}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Worker Profile Modal ---
function WorkerModal({ agent, onClose }) {
  if (!agent) return null;
  const xpProgress = getXpProgress(agent);
  const nextLevel = getXpForLevel(agent.level + 1);
  return (
    <div onClick={onClose} style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "linear-gradient(135deg, #0c0c1a 0%, #0a0a18 100%)",
        border: `1px solid ${agent.color}44`,
        borderRadius: 8, padding: 0, width: 520, maxHeight: "85vh", overflow: "auto",
        boxShadow: `0 0 60px ${agent.color}22, 0 0 120px rgba(0,0,0,0.8)`,
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px", borderBottom: `1px solid ${agent.color}22`,
          background: `linear-gradient(135deg, ${agent.color}08, transparent)`,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <PixelChar color={agent.color} size={40} animate={agent.status === "active"} status={agent.status} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 22, color: agent.color, fontFamily: "'Orbitron', sans-serif", fontWeight: 700 }}>{agent.name}</span>
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 3,
                  background: `${statusColor(agent.status)}22`, color: statusColor(agent.status),
                  border: `1px solid ${statusColor(agent.status)}44`,
                }}>{statusLabel(agent.status)}</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{agent.role}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, fontStyle: "italic" }}>{agent.bio}</div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 4, color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer",
              width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: agent.color }}>LEVEL {agent.level}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{agent.xp} / {nextLevel} XP</span>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              width: `${Math.max(xpProgress, 2)}%`, height: "100%", borderRadius: 4,
              background: `linear-gradient(90deg, ${agent.color}88, ${agent.color})`,
              boxShadow: `0 0 10px ${agent.color}44`,
              animation: "xp-fill 1s ease-out",
            }} />
          </div>
        </div>

        {/* Skills */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 10 }}>SKILLS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
            {Object.entries(agent.skills).map(([skill, val]) => (
              <div key={skill}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", textTransform: "capitalize" }}>{skill.replace(/([A-Z])/g, ' $1')}</span>
                  <span style={{ color: val >= 90 ? "#00ff41" : val >= 70 ? "#ffb000" : "#ff6b9d" }}>{val}</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    width: `${val}%`, height: "100%", borderRadius: 2,
                    background: val >= 90 ? "#00ff41" : val >= 70 ? "#ffb000" : "#ff6b9d",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 10 }}>PERFORMANCE METRICS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "EFFICIENCY", value: `${agent.efficiency}%`, color: agent.efficiency >= 90 ? "#00ff41" : "#ffb000" },
              { label: "MISSIONS", value: agent.missionsCompleted, color: "#00ffff" },
              { label: "CRITICAL FIXES", value: agent.criticalFixes, color: agent.criticalFixes > 2 ? "#ff4040" : "#41ff90" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "10px 8px", background: "rgba(255,255,255,0.02)", borderRadius: 4 }}>
                <div style={{ fontSize: 18, color: s.color, fontFamily: "'Orbitron', sans-serif", fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 4, letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Task History */}
        <div style={{ padding: "14px 24px 20px" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 10 }}>RECENT TASK HISTORY</div>
          {agent.taskHistory.map((t, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", marginBottom: 4,
              background: "rgba(255,255,255,0.02)", borderRadius: 3,
              borderLeft: `2px solid ${t.status === "completed" ? "#00ff41" : t.status === "error" ? "#ff4040" : "#ffb000"}`,
            }}>
              <span style={{ fontSize: 10, color: t.status === "completed" ? "#00ff41" : t.status === "error" ? "#ff4040" : "#ffb000" }}>
                {t.status === "completed" ? "✓" : t.status === "error" ? "✗" : "⟳"}
              </span>
              <span style={{ flex: 1, fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{t.task}</span>
              {t.xpEarned > 0 && <span style={{ fontSize: 9, color: "#ffb000" }}>+{t.xpEarned} XP</span>}
            </div>
          ))}
          {/* Current Task */}
          <div style={{
            marginTop: 10, padding: "10px 12px", background: `${agent.color}08`,
            border: `1px dashed ${agent.color}33`, borderRadius: 4,
          }}>
            <div style={{ fontSize: 9, color: agent.color, letterSpacing: 1, marginBottom: 4 }}>CURRENT TASK</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{agent.currentTask}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Task Hover Tooltip ---
function TaskTooltip({ agent, x, y }) {
  if (!agent) return null;
  return (
    <div style={{
      position: "fixed", left: x + 12, top: y - 10, zIndex: 90,
      background: "rgba(10,10,25,0.95)", border: `1px solid ${agent.color}44`,
      borderRadius: 6, padding: "10px 14px", minWidth: 200, maxWidth: 280,
      boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 20px ${agent.color}11`,
      pointerEvents: "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ color: agent.color, fontSize: 12 }}>{agent.symbol}</span>
        <span style={{ color: agent.color, fontSize: 12, fontFamily: "'VT323', monospace" }}>{agent.name}</span>
        <StatusDot status={agent.status} size={5} />
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>{agent.currentTask}</div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
        <div style={{
          width: `${40 + Math.random() * 50}%`, height: "100%", borderRadius: 2,
          background: `linear-gradient(90deg, ${agent.color}88, ${agent.color})`,
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "rgba(255,255,255,0.3)" }}>
        <span>LV.{agent.level} · {agent.efficiency}% eff.</span>
        <span>{agent.xp} XP</span>
      </div>
    </div>
  );
}

// --- Leaderboard Module ---
function LeaderboardModule({ agents }) {
  const sorted = [...agents].sort((a, b) => b.xp - a.xp);
  return (
    <div style={{
      background: "rgba(8,8,20,0.9)", border: "1px solid rgba(0,255,255,0.12)", borderRadius: 6,
      padding: 14, overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 14 }}>🏆</span>
        <span style={{ color: "#ffb000", fontSize: 12, fontFamily: "'Orbitron', sans-serif", fontWeight: 700, letterSpacing: 2 }}>LEADERBOARD</span>
      </div>
      {sorted.map((agent, i) => (
        <div key={agent.id} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", marginBottom: 3,
          background: i === 0 ? "rgba(255,176,0,0.06)" : "rgba(255,255,255,0.015)", borderRadius: 3,
        }}>
          <span style={{
            width: 18, textAlign: "center", fontSize: 11, fontWeight: 700,
            color: i === 0 ? "#ffb000" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "rgba(255,255,255,0.25)",
            fontFamily: "'Orbitron', sans-serif",
          }}>{i + 1}</span>
          <span style={{ color: agent.color, fontSize: 10 }}>{agent.symbol}</span>
          <span style={{ flex: 1, fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{agent.name}</span>
          <span style={{ fontSize: 10, color: "#ffb000", fontFamily: "'VT323', monospace" }}>LV.{agent.level}</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", width: 50, textAlign: "right" }}>{agent.xp} XP</span>
        </div>
      ))}
    </div>
  );
}

// --- Milestones / Unlocks Module ---
function MilestonesModule({ milestones }) {
  return (
    <div style={{
      background: "rgba(8,8,20,0.9)", border: "1px solid rgba(191,95,255,0.12)", borderRadius: 6,
      padding: 14, overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 14 }}>⚡</span>
        <span style={{ color: "#bf5fff", fontSize: 12, fontFamily: "'Orbitron', sans-serif", fontWeight: 700, letterSpacing: 2 }}>MILESTONES</span>
      </div>
      {milestones.map((m) => (
        <div key={m.id} style={{
          padding: "8px 10px", marginBottom: 4, borderRadius: 4,
          background: m.unlocked ? "rgba(0,255,65,0.04)" : "rgba(255,255,255,0.015)",
          border: m.unlocked ? "1px solid rgba(0,255,65,0.12)" : "1px solid rgba(255,255,255,0.04)",
          opacity: m.unlocked ? 1 : 0.6,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: m.unlocked ? "#00ff41" : "rgba(255,255,255,0.5)" }}>
              {m.unlocked ? "✓ " : "○ "}{m.name}
            </span>
            {m.unlocked && <span style={{ fontSize: 8, color: "#00ff41", padding: "1px 6px", background: "rgba(0,255,65,0.1)", borderRadius: 2 }}>UNLOCKED</span>}
          </div>
          {!m.unlocked && (
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 3 }}>
              <div style={{
                width: `${Math.min((m.current / m.target) * 100, 100)}%`, height: "100%", borderRadius: 2,
                background: "linear-gradient(90deg, #bf5fff, #00ddff)",
              }} />
            </div>
          )}
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>
            {m.unlocked ? `Reward: ${m.reward}` : `${m.current} / ${m.target} · Unlock: ${m.reward}`}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Zone Filter Bar ---
function ZoneFilter({ activeZone, setActiveZone }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
      <button onClick={() => setActiveZone("all")} style={{
        padding: "4px 12px", borderRadius: 3, fontSize: 10, cursor: "pointer",
        fontFamily: "'VT323', monospace", letterSpacing: 1, border: "1px solid",
        background: activeZone === "all" ? "rgba(255,255,255,0.08)" : "transparent",
        color: activeZone === "all" ? "#fff" : "rgba(255,255,255,0.35)",
        borderColor: activeZone === "all" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)",
      }}>ALL ZONES</button>
      {Object.entries(ZONES).map(([key, zone]) => (
        <button key={key} onClick={() => setActiveZone(key)} style={{
          padding: "4px 12px", borderRadius: 3, fontSize: 10, cursor: "pointer",
          fontFamily: "'VT323', monospace", letterSpacing: 1, border: "1px solid",
          background: activeZone === key ? `${zone.color}15` : "transparent",
          color: activeZone === key ? zone.color : "rgba(255,255,255,0.3)",
          borderColor: activeZone === key ? `${zone.color}44` : "rgba(255,255,255,0.06)",
        }}>{zone.icon} {zone.name.toUpperCase()}</button>
      ))}
    </div>
  );
}

// --- Room Card (with zone-aware filtering & agent hover) ---
function RoomCard({ room, agents, onClick, selected, onAgentHover, onAgentClick }) {
  const roomAgents = agents.filter(a => {
    const r = ROOMS.find(rm => rm.id === room.id);
    return a.zone === r?.zone || agents.find(ag => ag.id === a.id && getRoomForAgent(ag) === room.id);
  });
  const activeCount = roomAgents.filter(a => a.status === "active").length;
  const zone = ZONES[room.zone];

  function getRoomForAgent(ag) {
    // Map agents to rooms based on their zone
    const zoneRooms = ROOMS.filter(r => r.zone === ag.zone);
    return zoneRooms.length > 0 ? zoneRooms[0].id : "bridge";
  }

  // Get actual agents assigned to this room
  const assignedAgents = agents.filter(a => {
    if (room.id === "bridge") return a.zone === "command";
    if (room.id === "media") return a.zone === "quarters";
    if (room.id === "research") return a.zone === "science" && a.id !== "atlas";
    if (room.id === "comms") return a.zone === "comms";
    if (room.id === "warroom") return a.id === "atlas";
    if (room.id === "factory") return a.zone === "engineering";
    if (room.id === "treasury") return a.id === "ledger";
    if (room.id === "archives") return false;
    return false;
  });

  return (
    <div onClick={() => onClick(room.id)} style={{
      background: "rgba(8,8,20,0.85)", borderRadius: 6, padding: "12px 14px",
      cursor: "pointer", position: "relative", overflow: "hidden",
      transition: "border-color 0.3s, box-shadow 0.3s, transform 0.2s",
      border: `1px solid ${selected ? room.color : "rgba(100,140,255,0.1)"}`,
      boxShadow: selected ? `0 0 25px ${room.color}22, inset 0 0 40px ${room.color}06` : "none",
      minHeight: 120,
    }}>
      {/* Zone tag */}
      {zone && (
        <div style={{
          position: "absolute", top: 6, right: 6, fontSize: 7, padding: "2px 6px",
          background: `${zone.color}15`, color: zone.color, borderRadius: 2,
          border: `1px solid ${zone.color}22`, letterSpacing: 1,
        }}>{zone.name.toUpperCase()}</div>
      )}
      {/* Room glow */}
      <div style={{
        position: "absolute", bottom: 0, left: "50%", width: 80, height: 40,
        background: `radial-gradient(ellipse, ${room.color}12 0%, transparent 70%)`,
        transform: "translateX(-50%)", pointerEvents: "none",
      }} />
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ color: room.color, fontSize: 12 }}>{room.icon}</span>
        <span style={{ color: room.color, fontSize: 11, fontFamily: "'VT323', monospace", letterSpacing: 1 }}>{room.name}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>{room.desc}</span>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>LV.{room.level}</span>
      </div>
      {/* Floor grid with characters */}
      <div style={{
        position: "relative", height: 48, background: "rgba(255,255,255,0.015)", borderRadius: 3,
        border: "1px solid rgba(255,255,255,0.03)", overflow: "hidden",
      }}>
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => (
          <div key={`h${i}`} style={{ position: "absolute", top: i * 12, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.015)" }} />
        ))}
        {[...Array(8)].map((_, i) => (
          <div key={`v${i}`} style={{ position: "absolute", left: i * 22, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.015)" }} />
        ))}
        {/* Characters */}
        {assignedAgents.map((agent, i) => (
          <div key={agent.id} style={{ position: "absolute", left: 10 + i * 30, top: 10, cursor: "pointer" }}
            onMouseEnter={(e) => onAgentHover(agent, e.clientX, e.clientY)}
            onMouseLeave={() => onAgentHover(null)}
            onClick={(e) => { e.stopPropagation(); onAgentClick(agent); }}
          >
            <PixelChar color={agent.color} size={16} animate={agent.status === "active"} status={agent.status} />
          </div>
        ))}
        {assignedAgents.length === 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 9, color: "rgba(255,255,255,0.12)" }}>
            EMPTY
          </div>
        )}
      </div>
      {/* Status bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
        {assignedAgents.map(a => (
          <StatusDot key={a.id} status={a.status} size={5} />
        ))}
        {assignedAgents.length > 0 && (
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", marginLeft: "auto" }}>
            {assignedAgents.filter(a => a.status === "active").length}/{assignedAgents.length} active
          </span>
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════

export default function UltronosDashboard() {
  const [agents, setAgents] = useState(AGENTS);
  const [selectedRoom, setSelectedRoom] = useState("bridge");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [activeZone, setActiveZone] = useState("all");
  const [revenue, setRevenue] = useState(1886.72);
  const [tickerOffset, setTickerOffset] = useState(0);
  const [time, setTime] = useState(new Date());
  const [vitals, setVitals] = useState(INITIAL_VITALS);
  const [pipelines, setPipelines] = useState(PIPELINES);
  const [experiments, setExperiments] = useState(EXPERIMENTS);
  const [activeView, setActiveView] = useState("station"); // station, modules
  const [commsMessages, setCommsMessages] = useState(COMMS);

  const { connected, wsEtsyStats, agentUpdates } = useRealtimeData();

  // Apply real agent updates from Hermes log watcher
  useEffect(() => {
    if (!agentUpdates || Object.keys(agentUpdates).length === 0) return;
    setAgents(prev => prev.map(a => {
      const u = agentUpdates[a.id];
      if (!u) return a;
      return {
        ...a,
        status: u.status || a.status,
        currentTask: u.task || a.currentTask,
      };
    }));
  }, [agentUpdates]);

  // Apply real Etsy stats when available
  useEffect(() => {
    if (wsEtsyStats?.revenue?.total) setRevenue(wsEtsyStats.revenue.total);
  }, [wsEtsyStats]);

  // Ticker animation
  useEffect(() => {
    const iv = setInterval(() => setTickerOffset(o => o - 0.5), 30);
    return () => clearInterval(iv);
  }, []);

  // Clock
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Simulate revenue ticks
  useEffect(() => {
    const iv = setInterval(() => {
      if (Math.random() > 0.8) setRevenue(r => Math.round((r + Math.random() * 3.5) * 100) / 100);
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  // Simulate vitals fluctuation
  useEffect(() => {
    const iv = setInterval(() => {
      setVitals(v => ({
        ...v,
        cpu: Math.max(15, Math.min(95, v.cpu + (Math.random() - 0.5) * 8)),
        memory: Math.max(30, Math.min(90, v.memory + (Math.random() - 0.5) * 4)),
        disk: Math.max(30, Math.min(80, v.disk + (Math.random() - 0.48) * 1)),
        powerDraw: Math.max(50, Math.min(95, v.powerDraw + (Math.random() - 0.5) * 5)),
        network: Math.max(2, Math.min(50, v.network + (Math.random() - 0.5) * 3)),
        requests: v.requests + Math.floor(Math.random() * 15),
        latency: Math.max(15, Math.min(120, v.latency + (Math.random() - 0.5) * 10)),
        o2Level: Math.max(88, Math.min(100, v.o2Level + (Math.random() - 0.48) * 1)),
      }));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  // Simulate experiment progress
  useEffect(() => {
    const iv = setInterval(() => {
      setExperiments(exps => exps.map(exp => {
        if (exp.status === "running" && exp.progress < 100) {
          const newProgress = Math.min(100, exp.progress + Math.random() * 2);
          return { ...exp, progress: Math.round(newProgress), status: newProgress >= 100 ? "complete" : "running", eta: newProgress >= 100 ? "Done" : exp.eta };
        }
        return exp;
      }));
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const handleAgentHover = useCallback((agent, x, y) => {
    setHoveredAgent(agent);
    if (x !== undefined) setHoverPos({ x, y });
  }, []);

  const handleAgentClick = useCallback((agent) => {
    setSelectedAgent(agent);
  }, []);

  const activeAgents = agents.filter(a => a.status === "active").length;
  const totalAgents = agents.length;
  const phase = getDayNightPhase();
  const dayStr = `Day ${Math.floor((Date.now() / 86400000) % 365)}`;
  const filteredRooms = activeZone === "all" ? ROOMS : ROOMS.filter(r => r.zone === activeZone);
  const errorCount = agents.filter(a => a.status === "error").length;

  return (
    <div style={{
      position: "relative", width: "100vw", minHeight: "100vh",
      fontFamily: "'Share Tech Mono', 'VT323', monospace", color: "#ccd", overflow: "hidden",
    }}>
      <Starfield />

      {/* Scanline overlay */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 3px)",
      }} />

      {/* ═══ TOP STATUS BAR ═══ */}
      <div style={{
        position: "relative", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 20px", background: "rgba(0,0,0,0.7)", borderBottom: "1px solid rgba(0,255,255,0.1)",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#00ffff", fontSize: 18, fontFamily: "'Orbitron', sans-serif", fontWeight: 900, letterSpacing: 3 }}>ULTRONOS</span>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
          <StatusDot status="active" size={6} label="STATION ONLINE" />
          <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
          <span style={{ fontSize: 10, color: connected ? "#00ff41" : "#ffb000" }}>
            {connected ? "⬤ LIVE" : "◌ SIM"}
          </span>
          {errorCount > 0 && (
            <>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
              <StatusDot status="error" size={6} label={`${errorCount} ALERT${errorCount > 1 ? "S" : ""}`} />
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 12 }}>
          <span><span style={{ color: "rgba(255,255,255,0.35)" }}>REVENUE</span> <span style={{ color: "#00ff41", fontFamily: "'Orbitron', sans-serif", fontWeight: 700 }}>${revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></span>
          <span><span style={{ color: "rgba(255,255,255,0.35)" }}>ORDERS</span> <span style={{ color: "#ffb000" }}>{wsEtsyStats?.orders?.total ?? 47}</span></span>
          <span><span style={{ color: "rgba(255,255,255,0.35)" }}>PRODUCTS</span> <span style={{ color: "#bf5fff" }}>{wsEtsyStats?.products?.active ?? 18} LIVE</span></span>
          <span><span style={{ color: "rgba(255,255,255,0.35)" }}>CREW</span> <span style={{ color: "#00ffff" }}>{activeAgents}/{totalAgents}</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11 }}>
          <span style={{ color: "rgba(255,255,255,0.2)", textTransform: "capitalize" }}>{phase}</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>{dayStr} — {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
        </div>
      </div>

      {/* ═══ VIEW TOGGLE ═══ */}
      <div style={{
        position: "relative", zIndex: 20, display: "flex", alignItems: "center", gap: 0,
        padding: "0 20px", background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        {["station", "modules"].map(view => (
          <button key={view} onClick={() => setActiveView(view)} style={{
            padding: "8px 20px", fontSize: 10, cursor: "pointer", letterSpacing: 2,
            fontFamily: "'VT323', monospace", border: "none", textTransform: "uppercase",
            background: activeView === view ? "rgba(0,255,255,0.06)" : "transparent",
            color: activeView === view ? "#00ffff" : "rgba(255,255,255,0.3)",
            borderBottom: activeView === view ? "2px solid #00ffff" : "2px solid transparent",
          }}>{view === "station" ? "⌘ STATION VIEW" : "◈ MODULE VIEW"}</button>
        ))}
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ position: "relative", zIndex: 15, display: "flex", height: "calc(100vh - 120px)" }}>

        {/* ═══ LEFT SIDEBAR — Crew Roster ═══ */}
        <div style={{
          width: 210, flexShrink: 0, background: "rgba(0,0,0,0.55)", borderRight: "1px solid rgba(0,255,255,0.06)",
          padding: "14px 12px", overflowY: "auto", backdropFilter: "blur(4px)",
        }}>
          <div style={{ fontSize: 11, color: "#00ffff", marginBottom: 4, letterSpacing: 2, display: "flex", alignItems: "center", gap: 6 }}>
            <span>◆</span> SHIP CREW
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginBottom: 12 }}>Click for full dossier</div>

          {agents.map(agent => (
            <div key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              onMouseEnter={(e) => handleAgentHover(agent, e.clientX, e.clientY)}
              onMouseLeave={() => handleAgentHover(null)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", marginBottom: 3,
                background: selectedAgent?.id === agent.id ? `${agent.color}10` : "rgba(255,255,255,0.015)",
                borderRadius: 4, cursor: "pointer", transition: "background 0.2s",
                borderLeft: `2px solid ${agent.status === "error" ? "#ff4040" : "transparent"}`,
              }}
            >
              <PixelChar color={agent.color} size={14} animate={agent.status === "active"} status={agent.status} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: agent.color, fontSize: 12 }}>{agent.name}</span>
                  {agent.id === "commander" && <span style={{ fontSize: 7, padding: "1px 4px", background: "#ffb000", color: "#000", borderRadius: 2, fontWeight: 700 }}>YOU</span>}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{agent.role}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 8, color: "#ffb000" }}>LV.{agent.level}</span>
                  <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, overflow: "hidden" }}>
                    <div style={{ width: `${getXpProgress(agent)}%`, height: "100%", background: agent.color, borderRadius: 1 }} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Ship Status Card */}
          <div style={{ marginTop: 16, padding: 10, background: "rgba(0,255,65,0.03)", borderRadius: 5, border: "1px solid rgba(0,255,65,0.08)" }}>
            <div style={{ fontSize: 9, color: "#00ff41", marginBottom: 6, letterSpacing: 1 }}>STATION VITALS</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 2 }}>
              CPU: <span style={{ color: vitals.cpu > 80 ? "#ff4040" : "#00ff41" }}>{Math.round(vitals.cpu)}%</span><br />
              MEM: <span style={{ color: vitals.memory > 80 ? "#ff4040" : "#00ff41" }}>{Math.round(vitals.memory)}%</span><br />
              O₂: <span style={{ color: vitals.o2Level < 90 ? "#ff4040" : "#00ff41" }}>{Math.round(vitals.o2Level)}%</span><br />
              Power: <span style={{ color: "#ffb000" }}>{Math.round(vitals.powerDraw)}%</span><br />
              Hull: <span style={{ color: "#00ffff" }}>{vitals.hullIntegrity}%</span>
            </div>
          </div>
        </div>

        {/* ═══ CENTER — Main Content Area ═══ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {activeView === "station" ? (
            /* ═══ STATION VIEW ═══ */
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "14px 18px", gap: 12, overflowY: "auto" }}>
              {/* Zone Filter */}
              <ZoneFilter activeZone={activeZone} setActiveZone={setActiveZone} />

              {/* Zone Progress Summary */}
              <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
                {Object.entries(ZONES).map(([key, zone]) => {
                  const zoneAgents = agents.filter(a => a.zone === key);
                  const activeInZone = zoneAgents.filter(a => a.status === "active").length;
                  return (
                    <div key={key} style={{
                      flex: 1, padding: "8px 10px", borderRadius: 4,
                      background: `${zone.color}06`, border: `1px solid ${zone.color}15`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                        <span style={{ color: zone.color, fontSize: 10 }}>{zone.icon}</span>
                        <span style={{ color: zone.color, fontSize: 9, letterSpacing: 1 }}>{zone.name.toUpperCase()}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{
                            width: zoneAgents.length > 0 ? `${(activeInZone / zoneAgents.length) * 100}%` : "0%",
                            height: "100%", background: zone.color, borderRadius: 2,
                          }} />
                        </div>
                        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{activeInZone}/{zoneAgents.length}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ship name */}
              <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.1)", letterSpacing: 6 }}>
                ═══ U L T R O N O S ═══
              </div>

              {/* Room Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: filteredRooms.length <= 4 ? "repeat(auto-fill, minmax(220px, 1fr))" : "repeat(4, 1fr)",
                gap: 10, flex: 1,
              }}>
                {filteredRooms.map(room => (
                  <RoomCard
                    key={room.id} room={room} agents={agents}
                    onClick={setSelectedRoom} selected={selectedRoom === room.id}
                    onAgentHover={handleAgentHover} onAgentClick={handleAgentClick}
                  />
                ))}
              </div>

              {/* SHIP COMMS */}
              <div style={{
                background: "rgba(0,0,0,0.6)", borderRadius: 6, border: "1px solid rgba(0,255,255,0.06)",
                padding: "12px 14px", maxHeight: 200, overflowY: "auto", backdropFilter: "blur(4px)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: "#00ffff", letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", fontWeight: 700 }}>◉ SHIP COMMS</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <StatusDot status="active" size={4} />
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{activeAgents} online</span>
                  </div>
                </div>
                {commsMessages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: 10, lineHeight: 1.5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: msg.color, fontSize: 11, fontWeight: 700 }}>{msg.agent}</span>
                      <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 9 }}>{msg.time}</span>
                    </div>
                    <div style={{
                      fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3, paddingLeft: 8,
                      borderLeft: `2px solid ${msg.color}33`,
                    }}>{msg.msg}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ═══ MODULE VIEW ═══ */
            <div style={{ flex: 1, padding: "14px 18px", overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <LifeSupportModule vitals={vitals} />
                <EngineeringModule pipelines={pipelines} />
                <ScienceLabModule experiments={experiments} />
                <LeaderboardModule agents={agents} />
                <div style={{ gridColumn: "1 / -1" }}>
                  <MilestonesModule milestones={MILESTONES} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══ RIGHT SIDEBAR — Room Detail ═══ */}
        <div style={{
          width: 210, flexShrink: 0, background: "rgba(0,0,0,0.55)", borderLeft: "1px solid rgba(0,255,255,0.06)",
          padding: "14px 12px", overflowY: "auto", backdropFilter: "blur(4px)",
        }}>
          {(() => {
            const room = ROOMS.find(r => r.id === selectedRoom);
            if (!room) return null;
            const zone = ZONES[room.zone];
            const roomAgents = agents.filter(a => {
              if (room.id === "bridge") return a.zone === "command";
              if (room.id === "media") return a.zone === "quarters";
              if (room.id === "research") return a.zone === "science" && a.id !== "atlas";
              if (room.id === "comms") return a.zone === "comms";
              if (room.id === "warroom") return a.id === "atlas";
              if (room.id === "factory") return a.zone === "engineering";
              if (room.id === "treasury") return a.id === "ledger";
              return false;
            });

            return (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ color: room.color, fontSize: 16 }}>{room.icon}</span>
                  <span style={{ color: room.color, fontSize: 14, fontFamily: "'Orbitron', sans-serif", fontWeight: 700 }}>{room.name}</span>
                </div>
                {zone && (
                  <div style={{
                    display: "inline-block", fontSize: 8, padding: "2px 8px", marginBottom: 6,
                    background: `${zone.color}12`, color: zone.color, borderRadius: 2,
                    border: `1px solid ${zone.color}22`,
                  }}>{zone.icon} {zone.name}</div>
                )}
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginBottom: 2 }}>LEVEL {room.level}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>{room.desc}</div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 12 }} />

                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 8, letterSpacing: 1 }}>STATIONED CREW</div>
                {roomAgents.length === 0 && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.12)", fontStyle: "italic" }}>No crew assigned</div>}
                {roomAgents.map(a => (
                  <div key={a.id} onClick={() => setSelectedAgent(a)} style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 6, padding: "6px 8px",
                    background: "rgba(255,255,255,0.02)", borderRadius: 4, cursor: "pointer",
                    transition: "background 0.2s",
                  }}>
                    <PixelChar color={a.color} size={12} animate={a.status === "active"} status={a.status} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: a.color }}>{a.name}</div>
                      <div style={{ fontSize: 9, color: statusColor(a.status) }}>
                        {statusLabel(a.status)}
                      </div>
                    </div>
                    <span style={{ fontSize: 8, color: "#ffb000" }}>LV.{a.level}</span>
                  </div>
                ))}

                <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "12px 0" }} />

                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 8, letterSpacing: 1 }}>ROOM CONTROLS</div>
                <button style={{
                  width: "100%", padding: "8px", background: "rgba(0,255,255,0.06)", border: "1px solid rgba(0,255,255,0.15)",
                  borderRadius: 4, color: "#00ffff", fontSize: 10, fontFamily: "'VT323', monospace",
                  cursor: "pointer", marginBottom: 5, letterSpacing: 1, transition: "background 0.2s",
                }}>⬆ UPGRADE ROOM</button>
                <button style={{
                  width: "100%", padding: "8px", background: "rgba(0,255,65,0.06)", border: "1px solid rgba(0,255,65,0.15)",
                  borderRadius: 4, color: "#00ff41", fontSize: 10, fontFamily: "'VT323', monospace",
                  cursor: "pointer", letterSpacing: 1, transition: "background 0.2s",
                }}>⚙ MANAGE CREW</button>

                {/* Revenue target for War Room */}
                {selectedRoom === "warroom" && (
                  <div style={{ marginTop: 14, padding: 10, background: "rgba(255,64,64,0.04)", borderRadius: 4, border: "1px solid rgba(255,64,64,0.1)" }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 4, letterSpacing: 1 }}>REVENUE TARGET</div>
                    <div style={{ fontSize: 18, color: "#00ff41", fontFamily: "'Orbitron', sans-serif", fontWeight: 700 }}>${revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>/ $10,000.00</div>
                    <div style={{ marginTop: 6, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min((revenue / 10000) * 100, 100)}%`, height: "100%", background: "linear-gradient(90deg, #00ff41, #00ffff)", borderRadius: 3, transition: "width 0.5s" }} />
                    </div>
                  </div>
                )}

                {/* Bridge stats */}
                {selectedRoom === "bridge" && (
                  <div style={{ marginTop: 14, padding: 10, background: "rgba(0,255,255,0.03)", borderRadius: 4, border: "1px solid rgba(0,255,255,0.08)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        { label: "AUTOMATIONS", value: "6 active", color: "#00ffff" },
                        { label: "PRODUCTIONS", value: "175 items", color: "#bf5fff" },
                        { label: "UPTIME", value: vitals.uptime, color: "#00ff41" },
                        { label: "LATENCY", value: `${Math.round(vitals.latency)}ms`, color: vitals.latency > 80 ? "#ff4040" : "#ffb000" },
                      ].map((s, i) => (
                        <div key={i}>
                          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>{s.label}</div>
                          <div style={{ fontSize: 13, color: s.color, fontFamily: "'VT323', monospace" }}>{s.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Vitals for any room */}
                <div style={{ marginTop: 14, padding: 10, background: "rgba(255,255,255,0.015)", borderRadius: 4 }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: 1, marginBottom: 6 }}>QUICK VITALS</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>Requests/min</span>
                    <span style={{ color: "#00ddff" }}>{vitals.requests}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 4 }}>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>Errors</span>
                    <span style={{ color: vitals.errors > 0 ? "#ff4040" : "#00ff41" }}>{vitals.errors}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 4 }}>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>Network</span>
                    <span style={{ color: "#ffb000" }}>{vitals.network.toFixed(1)} MB/s</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* ═══ BOTTOM SALES TICKER ═══ */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20, height: 32,
        background: "rgba(0,0,0,0.8)", borderTop: "1px solid rgba(0,255,255,0.08)",
        overflow: "hidden", display: "flex", alignItems: "center",
        backdropFilter: "blur(4px)",
      }}>
        <div style={{ padding: "0 12px", fontSize: 9, color: "#00ffff", letterSpacing: 1, flexShrink: 0, borderRight: "1px solid rgba(0,255,255,0.1)", marginRight: 12 }}>
          SALES FEED
        </div>
        <div style={{
          display: "flex", gap: 50, whiteSpace: "nowrap", fontSize: 11,
          transform: `translateX(${tickerOffset % (SALES.length * 420)}px)`,
        }}>
          {[...SALES, ...SALES, ...SALES].map((s, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#00ff41", fontSize: 8 }}>●</span>
              <span style={{ color: "#ffb000" }}>{s.product}</span>
              <span style={{ color: "#00ff41" }}>{s.price}</span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>— {s.buyer}</span>
              <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 9 }}>{s.time}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══ MODALS & TOOLTIPS ═══ */}
      {selectedAgent && <WorkerModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />}
      {hoveredAgent && !selectedAgent && <TaskTooltip agent={hoveredAgent} x={hoverPos.x} y={hoverPos.y} />}
    </div>
  );
}
