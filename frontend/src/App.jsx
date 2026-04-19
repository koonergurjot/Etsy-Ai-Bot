import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const ZONES = {
  engineering: { name: "Engineering", color: "#ffb000", icon: "⚙", desc: "CI/CD & production workflows" },
  science: { name: "Science Labs", color: "#00ff9d", icon: "⚗", desc: "Research, trends, and intelligence" },
  lifeSupport: { name: "Life Support", color: "#ff5f7a", icon: "♥", desc: "Infrastructure and system vitals" },
  command: { name: "Command", color: "#66f0ff", icon: "⌘", desc: "Strategic oversight and dispatch" },
  comms: { name: "Comms", color: "#4bc9ff", icon: "◉", desc: "Marketing and customer channels" },
  quarters: { name: "Media Bay", color: "#bf8cff", icon: "◈", desc: "Content studio and render queue" },
};

const AGENTS = [
  { id: "commander", name: "Commander", role: "Founder & Captain", zone: "command", color: "#66f0ff", symbol: "★", status: "active", level: 12, efficiency: 94, xp: 4850, bio: "Station founder. Oversees all operations." },
  { id: "ultron", name: "Ultron", role: "Task Dispatcher", zone: "command", color: "#00ff9d", symbol: "◆", status: "active", level: 10, efficiency: 97, xp: 3920, bio: "Neural backbone for command routing." },
  { id: "nova", name: "Nova", role: "Product Research", zone: "science", color: "#ff7eb6", symbol: "●", status: "active", level: 9, efficiency: 89, xp: 3400, bio: "Predictive niche intelligence specialist." },
  { id: "forge", name: "Forge", role: "Design & Copy", zone: "engineering", color: "#ffb000", symbol: "▲", status: "active", level: 8, efficiency: 91, xp: 3100, bio: "Design fabricator and copy crafter." },
  { id: "pixel", name: "Pixel", role: "Media & Content", zone: "quarters", color: "#bf8cff", symbol: "■", status: "processing", level: 7, efficiency: 85, xp: 2650, bio: "Visual storytelling and media ops." },
  { id: "cipher", name: "Cipher", role: "Comms Officer", zone: "comms", color: "#4bc9ff", symbol: "◇", status: "active", level: 6, efficiency: 87, xp: 2200, bio: "Outbound growth and customer messaging." },
  { id: "ledger", name: "Ledger", role: "Financial Officer", zone: "command", color: "#6dff9b", symbol: "▼", status: "active", level: 8, efficiency: 96, xp: 2900, bio: "Treasury and profitability watchdog." },
  { id: "atlas", name: "Atlas", role: "Strategy & Intel", zone: "science", color: "#ff5f7a", symbol: "⬟", status: "error", level: 6, efficiency: 82, xp: 2100, bio: "Strategic planner recovering from feed outage." },
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

const INITIAL_VITALS = { cpu: 34, memory: 62, o2: 98, power: 72, latency: 42, requests: 847 };

const statusLabel = { active: "ACTIVE", processing: "PROCESSING", error: "ERROR", idle: "IDLE" };
const statusClass = { active: "st-active", processing: "st-processing", error: "st-error", idle: "st-idle" };

const roomAgents = (roomId) => {
  if (roomId === "bridge") return AGENTS.filter((a) => a.zone === "command");
  if (roomId === "factory") return AGENTS.filter((a) => a.zone === "engineering");
  if (roomId === "research") return AGENTS.filter((a) => a.zone === "science" && a.id !== "atlas");
  if (roomId === "warroom") return AGENTS.filter((a) => a.id === "atlas");
  if (roomId === "comms") return AGENTS.filter((a) => a.zone === "comms");
  if (roomId === "media") return AGENTS.filter((a) => a.zone === "quarters");
  if (roomId === "treasury") return AGENTS.filter((a) => a.id === "ledger");
  return [];
};

function Starfield() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let w = window.innerWidth;
    let h = window.innerHeight;
    c.width = w;
    c.height = h;
    const stars = Array.from({ length: 240 }, () => ({ x: Math.random() * w, y: Math.random() * h, s: Math.random() * 1.5 + 0.5, p: Math.random() * 0.015 + 0.003 }));
    let raf;
    const draw = () => {
      const t = Date.now();
      ctx.fillStyle = "#060913";
      ctx.fillRect(0, 0, w, h);
      stars.forEach((s) => {
        const a = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.p + s.x));
        ctx.fillStyle = `rgba(186,208,255,${a})`;
        ctx.fillRect(s.x, s.y, s.s, s.s);
      });
      const nebula = ctx.createRadialGradient(w * 0.75, h * 0.2, 0, w * 0.75, h * 0.2, 320);
      nebula.addColorStop(0, "rgba(98,74,245,0.18)");
      nebula.addColorStop(1, "transparent");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, w, h);
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = w;
      c.height = h;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return <canvas ref={ref} className="starfield" aria-hidden />;
}

function AgentBadge({ agent, onClick, onHover }) {
  return (
    <button className={`agent-badge ${statusClass[agent.status]}`} onMouseEnter={(e) => onHover(agent, e)} onMouseLeave={() => onHover(null)} onClick={() => onClick(agent)}>
      <span className="agent-avatar" style={{ borderColor: `${agent.color}99`, color: agent.color }}>{agent.symbol}</span>
      <span className="agent-meta">
        <strong style={{ color: agent.color }}>{agent.name}</strong>
        <small>{agent.role}</small>
      </span>
      <span className="agent-level">LV {agent.level}</span>
    </button>
  );
}

function RoomTile({ room, selected, onSelect, onAgentClick }) {
  const assigned = roomAgents(room.id);
  return (
    <article className={`room-tile ${selected ? "selected" : ""}`} style={{ "--room-color": room.color }} onClick={() => onSelect(room.id)}>
      <header>
        <span>{room.icon}</span>
        <h4>{room.name}</h4>
        <em>LV.{room.level}</em>
      </header>
      <p>{room.desc}</p>
      <div className="occupants-strip">
        {assigned.length ? assigned.map((a) => (
          <button key={a.id} className={`occupant ${statusClass[a.status]}`} onClick={(e) => { e.stopPropagation(); onAgentClick(a); }}>
            {a.symbol} {a.name}
          </button>
        )) : <span className="empty-room">No crew assigned</span>}
      </div>
    </article>
  );
}

export default function UltronosDashboard() {
  const [selectedRoom, setSelectedRoom] = useState("bridge");
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const [feed, setFeed] = useState(FEED);
  const [vitals, setVitals] = useState(INITIAL_VITALS);
  const [revenue, setRevenue] = useState(1886.72);
  const [zoneFilter, setZoneFilter] = useState("all");
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setRevenue((r) => Math.round((r + Math.random() * 8.2) * 100) / 100);
      setVitals((v) => ({
        ...v,
        cpu: Math.max(20, Math.min(95, v.cpu + (Math.random() - 0.5) * 7)),
        memory: Math.max(35, Math.min(90, v.memory + (Math.random() - 0.5) * 5)),
        latency: Math.max(16, Math.min(110, v.latency + (Math.random() - 0.5) * 9)),
        requests: v.requests + Math.floor(Math.random() * 8),
      }));
    }, 2400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setFeed((prev) => {
        const rotated = [...prev];
        rotated.push(rotated.shift());
        return rotated;
      });
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const activeAgents = AGENTS.filter((a) => a.status === "active").length;
  const filteredRooms = useMemo(() => (zoneFilter === "all" ? ROOMS : ROOMS.filter((r) => r.zone === zoneFilter)), [zoneFilter]);
  const selectedRoomData = ROOMS.find((r) => r.id === selectedRoom);
  const selectedRoomCrew = selectedRoomData ? roomAgents(selectedRoomData.id) : [];

  const onHover = useCallback((agent, e) => {
    if (!agent || !e) return setHoveredAgent(null);
    setHoveredAgent({ ...agent, x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div className="ultronos">
      <Starfield />
      <div className="scanline" />

      <header className="command-bar">
        <div>
          <h1>ULTRONOS // COMMAND DECK</h1>
          <p>AI Etsy Print-on-Demand Station · Local Systems Online</p>
        </div>
        <div className="headline-metrics">
          <span><label>Revenue</label><strong>${revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></span>
          <span><label>Crew</label><strong>{activeAgents}/{AGENTS.length}</strong></span>
          <span><label>Latency</label><strong>{Math.round(vitals.latency)}ms</strong></span>
          <span><label>Time</label><strong>{clock.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</strong></span>
        </div>
      </header>

      <main className="command-grid">
        <aside className="panel crew-panel">
          <div className="panel-title"><h3>Crew Agents</h3><small>click for detail</small></div>
          <div className="agent-list">
            {AGENTS.map((agent) => <AgentBadge key={agent.id} agent={agent} onClick={setSelectedAgent} onHover={onHover} />)}
          </div>

          <section className="mini-vitals">
            <h4>Ship Status</h4>
            {[
              ["CPU", `${Math.round(vitals.cpu)}%`],
              ["Memory", `${Math.round(vitals.memory)}%`],
              ["O₂", `${vitals.o2}%`],
              ["Power", `${vitals.power}%`],
            ].map(([k, v]) => <div key={k}><span>{k}</span><strong>{v}</strong></div>)}
          </section>
        </aside>

        <section className="panel station-panel">
          <div className="panel-title">
            <h3>Station Map</h3>
            <div className="zone-tabs">
              <button onClick={() => setZoneFilter("all")} className={zoneFilter === "all" ? "on" : ""}>All</button>
              {Object.entries(ZONES).map(([key, zone]) => (
                <button key={key} onClick={() => setZoneFilter(key)} className={zoneFilter === key ? "on" : ""} style={{ "--z": zone.color }}>{zone.icon}</button>
              ))}
            </div>
          </div>

          <div className="rooms-grid">
            {filteredRooms.map((room) => (
              <RoomTile key={room.id} room={room} selected={room.id === selectedRoom} onSelect={setSelectedRoom} onAgentClick={setSelectedAgent} />
            ))}
          </div>

          <section className="telemetry-grid">
            <article>
              <h4>Revenue Telemetry</h4>
              <div className="big-stat">${revenue.toFixed(2)}</div>
              <div className="sparkline">{Array.from({ length: 18 }).map((_, i) => <span key={i} style={{ height: `${30 + ((i * 17) % 60)}%` }} />)}</div>
            </article>
            <article>
              <h4>Live Activity Feed</h4>
              <div className="feed-list">
                {feed.map((item, idx) => <p key={`${item.agent}-${idx}`} className={item.tone}><b style={{ color: item.color }}>{item.agent}</b> {item.msg}</p>)}
              </div>
            </article>
          </section>
        </section>

        <aside className="panel detail-panel">
          <div className="panel-title"><h3>Selected Room</h3><small>{selectedRoomData?.name}</small></div>
          {selectedRoomData && (
            <>
              <article className="room-focus" style={{ "--room-color": selectedRoomData.color }}>
                <h4>{selectedRoomData.icon} {selectedRoomData.name}</h4>
                <p>{selectedRoomData.desc}</p>
                <div className="room-stats">
                  <span>Level <strong>{selectedRoomData.level}</strong></span>
                  <span>Crew <strong>{selectedRoomCrew.length}</strong></span>
                  <span>Status <strong>{selectedRoomCrew.some((a) => a.status === "error") ? "Alert" : "Stable"}</strong></span>
                </div>
              </article>

              <div className="crew-mini-list">
                {selectedRoomCrew.length ? selectedRoomCrew.map((a) => (
                  <button key={a.id} onClick={() => setSelectedAgent(a)} className={`mini-crew ${statusClass[a.status]}`}>
                    <span style={{ color: a.color }}>{a.symbol}</span>
                    <span>{a.name}</span>
                    <small>{statusLabel[a.status]}</small>
                  </button>
                )) : <p className="empty-room">No one stationed here.</p>}
              </div>
            </>
          )}

          <article className="agent-dossier">
            <h4>Agent Dossier</h4>
            {selectedAgent && (
              <>
                <header>
                  <span style={{ color: selectedAgent.color }}>{selectedAgent.symbol}</span>
                  <div><strong style={{ color: selectedAgent.color }}>{selectedAgent.name}</strong><small>{selectedAgent.role}</small></div>
                  <em className={statusClass[selectedAgent.status]}>{statusLabel[selectedAgent.status]}</em>
                </header>
                <p>{selectedAgent.bio}</p>
                <div className="agent-bars">
                  <div><label>Efficiency</label><progress max="100" value={selectedAgent.efficiency} /></div>
                  <div><label>Experience</label><progress max="6000" value={selectedAgent.xp} /></div>
                </div>
              </>
            )}
          </article>
        </aside>
      </main>

      <footer className="sales-ticker">
        <strong>Live Sales</strong>
        <div className="ticker-track">{[...SALES, ...SALES].map((item, i) => <span key={`${item}-${i}`}>{item}</span>)}</div>
      </footer>

      {hoveredAgent && (
        <div className="hover-card" style={{ left: hoveredAgent.x + 14, top: hoveredAgent.y - 12 }}>
          <strong style={{ color: hoveredAgent.color }}>{hoveredAgent.name}</strong>
          <p>{hoveredAgent.role}</p>
          <small>{hoveredAgent.efficiency}% efficiency · LV {hoveredAgent.level}</small>
        </div>
      )}
    </div>
  );
}
