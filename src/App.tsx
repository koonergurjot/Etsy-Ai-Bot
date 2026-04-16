import React, { useEffect, useMemo, useState } from 'react';

type WorkerStatus = 'active' | 'processing' | 'error';

type Worker = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  room: string;
  zone: string;
  status: WorkerStatus;
  ticket: string;
  progress: number;
  xp: number;
  level: number;
  efficiency: number;
  recentHistory: string[];
  config: {
    model: string;
    temperature: number;
    retries: number;
    stream: boolean;
  };
};

type Room = {
  id: string;
  name: string;
  type: string;
  zone: string;
};

const STATUS_STYLES: Record<WorkerStatus, { dot: string; label: string }> = {
  active: { dot: 'bg-green-400', label: 'Active' },
  processing: { dot: 'bg-yellow-400', label: 'Processing' },
  error: { dot: 'bg-red-500', label: 'Error' },
};

const INITIAL_WORKERS: Worker[] = [
  {
    id: 'andrew',
    name: 'Andrew',
    avatar: '🧑‍🚀',
    role: 'Commander / Founder',
    room: 'bridge',
    zone: 'command',
    status: 'active',
    ticket: 'Sprint planning + launch checklist',
    progress: 82,
    xp: 3100,
    level: 15,
    efficiency: 94,
    recentHistory: ['Closed launch blocker #888', 'Approved release candidate', 'Synced product roadmap'],
    config: { model: 'gpt-5.3-mini', temperature: 0.2, retries: 2, stream: true },
  },
  {
    id: 'ultron',
    name: 'Ultron',
    avatar: '🤖',
    role: 'Task Orchestrator',
    room: 'engineering',
    zone: 'engineering',
    status: 'processing',
    ticket: 'Balance work queue from 7 incoming jobs',
    progress: 63,
    xp: 2800,
    level: 13,
    efficiency: 89,
    recentHistory: ['Routed 24 jobs in last hour', 'Rebalanced queue weights', 'Triggered health-check hooks'],
    config: { model: 'gpt-5.3-codex', temperature: 0.1, retries: 4, stream: true },
  },
  {
    id: 'nova',
    name: 'Nova',
    avatar: '👩‍🔬',
    role: 'R&D Scientist',
    room: 'science',
    zone: 'science',
    status: 'active',
    ticket: 'Analyze trend shifts for Q2 category expansion',
    progress: 48,
    xp: 2250,
    level: 11,
    efficiency: 86,
    recentHistory: ['Generated 3 hypothesis reports', 'Compared 5 cohort segments', 'Flagged rising keywords'],
    config: { model: 'gpt-5.3', temperature: 0.5, retries: 2, stream: false },
  },
  {
    id: 'forge',
    name: 'Forge',
    avatar: '⚒️',
    role: 'CI/CD Engineer',
    room: 'engineering',
    zone: 'engineering',
    status: 'processing',
    ticket: 'Fix failing deployment in canary environment',
    progress: 71,
    xp: 2420,
    level: 12,
    efficiency: 91,
    recentHistory: ['Patched flaky test suite', 'Queued canary deploy', 'Welded image pipeline updates'],
    config: { model: 'gpt-5.3-codex', temperature: 0.15, retries: 3, stream: true },
  },
  {
    id: 'cipher',
    name: 'Cipher',
    avatar: '📡',
    role: 'Telemetry Comms',
    room: 'life_support',
    zone: 'life_support',
    status: 'error',
    ticket: 'Investigate elevated packet loss from eu-west node',
    progress: 29,
    xp: 1900,
    level: 10,
    efficiency: 75,
    recentHistory: ['Alerted on latency > 300ms', 'Restarted gateway connector', 'Opened incident INC-402'],
    config: { model: 'gpt-5.3-mini', temperature: 0.3, retries: 5, stream: true },
  },
  {
    id: 'pixel',
    name: 'Pixel',
    avatar: '🎨',
    role: 'UX Pilot',
    room: 'science',
    zone: 'science',
    status: 'active',
    ticket: 'Prototype worker dossier + hover cards',
    progress: 89,
    xp: 2680,
    level: 12,
    efficiency: 97,
    recentHistory: ['Improved dashboard readability', 'Built status chip patterns', 'Updated interaction map'],
    config: { model: 'gpt-5.3', temperature: 0.35, retries: 2, stream: false },
  },
];

const ROOMS: Room[] = [
  { id: 'bridge', name: 'The Bridge', type: 'Command', zone: 'command' },
  { id: 'engineering', name: 'Engineering / Refinery', type: 'Module', zone: 'engineering' },
  { id: 'science', name: 'Science Labs', type: 'Module', zone: 'science' },
  { id: 'life_support', name: 'Life Support', type: 'Critical', zone: 'life_support' },
  { id: 'hangar', name: 'Hangar', type: 'Aux', zone: 'operations' },
  { id: 'archives', name: 'Archives', type: 'Aux', zone: 'operations' },
];

const ZONES = [
  { id: 'command', label: 'Command Zone', target: 1 },
  { id: 'engineering', label: 'Engineering Zone', target: 2 },
  { id: 'science', label: 'Science Zone', target: 2 },
  { id: 'life_support', label: 'Life Support Zone', target: 1 },
  { id: 'operations', label: 'Operations Zone', target: 1 },
];

function statusFromProgress(progress: number): WorkerStatus {
  if (progress < 35) return 'error';
  if (progress < 75) return 'processing';
  return 'active';
}

function getCycleLabel(hour: number) {
  if (hour >= 6 && hour < 18) return 'DAY CYCLE';
  return 'NIGHT CYCLE';
}

export default function App() {
  const [workers, setWorkers] = useState(INITIAL_WORKERS);
  const [selectedRoom, setSelectedRoom] = useState('engineering');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [hoveredWorkerId, setHoveredWorkerId] = useState<string | null>(null);
  const [clock, setClock] = useState(new Date());
  const [serverVitals, setServerVitals] = useState({ cpu: 34, memory: 61, uptime: '13d 04h', o2Scrubber: 'Stable' });
  const [mapPulse, setMapPulse] = useState(0);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setClock(new Date());
      setMapPulse((prev) => (prev + 1) % 1000);

      setWorkers((prev) =>
        prev.map((worker) => {
          const delta = Math.floor(Math.random() * 11) - 4;
          const nextProgress = Math.max(5, Math.min(100, worker.progress + delta));
          const nextXp = worker.xp + Math.max(0, Math.floor((Math.random() * 22) - 4));
          const nextLevel = Math.max(worker.level, Math.floor(nextXp / 220));
          return {
            ...worker,
            progress: nextProgress,
            status: statusFromProgress(nextProgress),
            xp: nextXp,
            level: nextLevel,
            efficiency: Math.max(58, Math.min(99, worker.efficiency + (Math.random() > 0.5 ? 1 : -1))),
          };
        }),
      );

      setServerVitals((prev) => ({
        ...prev,
        cpu: Math.max(10, Math.min(97, prev.cpu + (Math.random() > 0.5 ? 3 : -3))),
        memory: Math.max(20, Math.min(96, prev.memory + (Math.random() > 0.5 ? 2 : -2))),
        o2Scrubber: prev.cpu > 85 ? 'Warning' : 'Stable',
      }));
    }, 2500);

    return () => window.clearInterval(tick);
  }, []);

  const selectedWorker = useMemo(
    () => workers.find((worker) => worker.id === selectedWorkerId) ?? null,
    [workers, selectedWorkerId],
  );

  const roomWorkers = workers.filter((worker) => worker.room === selectedRoom);

  const zoneMetrics = ZONES.map((zone) => {
    const activeCount = workers.filter((worker) => worker.zone === zone.id && worker.status !== 'error').length;
    const fill = Math.min(100, Math.round((activeCount / zone.target) * 100));
    return { ...zone, activeCount, fill };
  });

  const leaderboard = [...workers]
    .sort((a, b) => b.xp - a.xp)
    .map((worker, idx) => ({ rank: idx + 1, name: worker.name, xp: worker.xp }));

  const unlocks = [
    { name: 'Autonomous Map Sweep', unlocked: workers.reduce((sum, worker) => sum + worker.level, 0) >= 70 },
    { name: 'Quantum Build Relay', unlocked: workers.filter((worker) => worker.status === 'active').length >= 4 },
    { name: 'Hyper Care Incident Bot', unlocked: serverVitals.cpu < 80 && serverVitals.memory < 80 },
  ];

  const isDay = getCycleLabel(clock.getHours()) === 'DAY CYCLE';

  return (
    <div className={`dashboard ${isDay ? 'day' : 'night'}`}>
      <div className="topbar">
        <div>
          <h1>ULTRONOS SPACE STATION</h1>
          <p>
            {getCycleLabel(clock.getHours())} · {clock.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </p>
        </div>
        <div className="topbar-metrics">
          <div><span>CPU</span><strong>{serverVitals.cpu}%</strong></div>
          <div><span>MEM</span><strong>{serverVitals.memory}%</strong></div>
          <div><span>UPTIME</span><strong>{serverVitals.uptime}</strong></div>
          <div><span>O2</span><strong className={serverVitals.o2Scrubber === 'Warning' ? 'text-danger' : 'text-good'}>{serverVitals.o2Scrubber}</strong></div>
        </div>
      </div>

      <div className="layout">
        <aside className="panel">
          <h2>Workers</h2>
          <p className="muted">Click for Personal Status · Hover for task tooltip</p>
          <div className="worker-list">
            {workers.map((worker) => (
              <button
                key={worker.id}
                className={`worker-card ${worker.room === selectedRoom ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedRoom(worker.room);
                  setSelectedWorkerId(worker.id);
                }}
                onMouseEnter={() => setHoveredWorkerId(worker.id)}
                onMouseLeave={() => setHoveredWorkerId(null)}
              >
                <div className="worker-header">
                  <span>{worker.avatar} {worker.name}</span>
                  <span className={`status-dot ${STATUS_STYLES[worker.status].dot}`} title={STATUS_STYLES[worker.status].label} />
                </div>
                <small>{worker.role}</small>
                <small>{worker.ticket}</small>
                {hoveredWorkerId === worker.id && (
                  <div className="hover-pop">
                    <div>{worker.ticket}</div>
                    <div className="progress-track"><div style={{ width: `${worker.progress}%` }} /></div>
                    <small>{worker.progress}% complete</small>
                  </div>
                )}
              </button>
            ))}
          </div>
        </aside>

        <main className="panel station-grid">
          <h2>Dynamic Zoning + Station Modules</h2>
          <div className="zones">
            {zoneMetrics.map((zone) => (
              <div key={zone.id} className="zone-meter">
                <div className="zone-row">
                  <span>{zone.label}</span>
                  <span>{zone.activeCount}/{zone.target} active</span>
                </div>
                <div className="progress-track"><div style={{ width: `${zone.fill}%` }} /></div>
              </div>
            ))}
          </div>

          <div className="rooms-grid">
            {ROOMS.map((room) => {
              const occupants = workers.filter((worker) => worker.room === room.id);
              return (
                <button key={room.id} className={`room ${selectedRoom === room.id ? 'room-selected' : ''}`} onClick={() => setSelectedRoom(room.id)}>
                  <div className="room-title">{room.name}</div>
                  <div className="room-meta">{room.type} · {occupants.length} workers</div>
                  <div className="occupants">
                    {occupants.map((worker) => (
                      <span key={worker.id} className="occupant-pill">
                        {worker.avatar}
                        <span className={`status-dot ${STATUS_STYLES[worker.status].dot}`} />
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="module-grid">
            <article>
              <h3>Engineering / Refinery</h3>
              <p>CI/CD conveyor and DB health.</p>
              <ul>
                <li>Build success: 93%</li>
                <li>Deploy latency: 4.8m</li>
                <li>Queue depth: {workers.filter((worker) => worker.zone === 'engineering').length * 3}</li>
              </ul>
            </article>
            <article>
              <h3>Science Labs</h3>
              <p>R&D experiments and analytics snapshots.</p>
              <ul>
                <li>Active experiments: 4</li>
                <li>Trend confidence: 87%</li>
                <li>Last insight: 3m ago</li>
              </ul>
            </article>
            <article>
              <h3>Life Support</h3>
              <p>Critical server vitals + incident state.</p>
              <ul>
                <li>CPU: {serverVitals.cpu}%</li>
                <li>Memory: {serverVitals.memory}%</li>
                <li>Scrubber: {serverVitals.o2Scrubber}</li>
              </ul>
            </article>
          </div>
        </main>

        <aside className="panel">
          <h2>Drill-down + Gamification</h2>
          <div className="subpanel">
            <h3>Current Room Crew</h3>
            {roomWorkers.length === 0 ? <p className="muted">No workers assigned.</p> : roomWorkers.map((worker) => (
              <div key={worker.id} className="line-item" onClick={() => setSelectedWorkerId(worker.id)}>
                <span>{worker.name}</span>
                <span>Lv {worker.level}</span>
              </div>
            ))}
          </div>

          <div className="subpanel">
            <h3>Leaderboard</h3>
            {leaderboard.map((entry) => (
              <div key={entry.name} className="line-item">
                <span>#{entry.rank} {entry.name}</span>
                <span>{entry.xp} XP</span>
              </div>
            ))}
          </div>

          <div className="subpanel">
            <h3>Unlocks</h3>
            {unlocks.map((unlock) => (
              <div key={unlock.name} className="line-item">
                <span>{unlock.name}</span>
                <span className={unlock.unlocked ? 'text-good' : 'text-warning'}>{unlock.unlocked ? 'UNLOCKED' : 'LOCKED'}</span>
              </div>
            ))}
          </div>

          <div className="subpanel">
            <h3>Live Environment Map</h3>
            <div className="map">
              <div className="orbit" style={{ transform: `rotate(${mapPulse * 0.35}deg)` }} />
              <div className="node" style={{ left: '20%', top: '55%' }} />
              <div className="node" style={{ left: '52%', top: '35%' }} />
              <div className="node" style={{ left: '77%', top: '62%' }} />
            </div>
            <small className="muted">US-East · EU-West · AP-South data centers streaming updates</small>
          </div>
        </aside>
      </div>

      {selectedWorker && (
        <div className="modal-backdrop" onClick={() => setSelectedWorkerId(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedWorker.avatar} {selectedWorker.name} — Personal Status</h3>
              <button onClick={() => setSelectedWorkerId(null)}>Close</button>
            </div>
            <p>{selectedWorker.role} · {STATUS_STYLES[selectedWorker.status].label}</p>

            <div className="modal-grid">
              <section>
                <h4>Configuration</h4>
                <ul>
                  <li>Model: {selectedWorker.config.model}</li>
                  <li>Temperature: {selectedWorker.config.temperature}</li>
                  <li>Retries: {selectedWorker.config.retries}</li>
                  <li>Stream: {selectedWorker.config.stream ? 'enabled' : 'disabled'}</li>
                </ul>
              </section>
              <section>
                <h4>Performance Metrics</h4>
                <ul>
                  <li>XP: {selectedWorker.xp}</li>
                  <li>Level: {selectedWorker.level}</li>
                  <li>Efficiency: {selectedWorker.efficiency}%</li>
                  <li>Task completion: {selectedWorker.progress}%</li>
                </ul>
              </section>
              <section>
                <h4>Recent History</h4>
                <ul>
                  {selectedWorker.recentHistory.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
