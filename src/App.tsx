import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Users, MessageSquare, ArrowUpRight } from 'lucide-react';

const CREW = [
  { id: 'andrew', name: 'Andrew', role: 'Commander / Founder', task: 'Roaming', room: 'bridge', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', avatar: '👨‍🚀' },
  { id: 'ultron', name: 'Ultron', role: 'Task Assignment', task: 'Processing core task assignments', room: 'bridge', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30', avatar: '🤖' },
  { id: 'nova', name: 'Nova', role: 'Research', task: 'Monitoring emerging product cats...', room: 'research', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30', avatar: '👩‍🔬' },
  { id: 'forge', name: 'Forge', role: 'Factory', task: 'Refining mockup renders', room: 'factory', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', avatar: '⚒️' },
  { id: 'pixel', name: 'Pixel', role: 'Media', task: 'Iterating on brand visual templates', room: 'media', color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/30', avatar: '🎨' },
  { id: 'cipher', name: 'Cipher', role: 'Comms', task: 'Routing inter-agent dispatches', room: 'comms', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30', avatar: '📡' },
  { id: 'atlas', name: 'Atlas', role: 'Strategy', task: 'Compiling competitive intelligence', room: 'war_room', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', avatar: '🗺️' },
  { id: 'queen', name: 'Queen', role: 'Archives', task: 'Checking image quality standards', room: 'archives', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', avatar: '👑' },
  { id: 'ledger', name: 'Ledger', role: 'Treasury', task: 'Signal analysis', room: 'treasury', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', avatar: '📊' },
];

const ROOMS = [
  { id: 'bridge', name: 'THE BRIDGE', type: 'command', color: 'border-cyan-500/50', bg: 'bg-cyan-950/20', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]' },
  { id: 'research', name: 'RESEARCH LAB', type: 'science', color: 'border-green-500/50', bg: 'bg-green-950/20', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.2)]' },
  { id: 'media', name: 'MEDIA BAY', type: 'creative', color: 'border-pink-500/50', bg: 'bg-pink-950/20', glow: 'shadow-[0_0_15px_rgba(236,72,153,0.2)]' },
  { id: 'war_room', name: 'WAR ROOM', type: 'tactical', color: 'border-red-500/50', bg: 'bg-red-950/20', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]' },
  { id: 'comms', name: 'COMMS DECK', type: 'communications', color: 'border-purple-500/50', bg: 'bg-purple-950/20', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]' },
  { id: 'factory', name: 'FACTORY', type: 'production', color: 'border-orange-500/50', bg: 'bg-orange-950/20', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]' },
  { id: 'treasury', name: 'THE TREASURY', type: 'finance', color: 'border-emerald-500/50', bg: 'bg-emerald-950/20', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]' },
  { id: 'armory', name: 'ARMORY', type: 'defense', color: 'border-yellow-500/50', bg: 'bg-yellow-950/20', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]' },
  { id: 'quarters', name: 'QUARTERS', type: 'residential', color: 'border-blue-500/50', bg: 'bg-blue-950/20', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]' },
  { id: 'archives', name: 'THE ARCHIVES', type: 'storage', color: 'border-indigo-500/50', bg: 'bg-indigo-950/20', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.2)]' },
  { id: 'engine', name: 'ENGINE ROOM', type: 'power', color: 'border-rose-500/50', bg: 'bg-rose-950/20', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.2)]' },
  { id: 'observatory', name: 'OBSERVATORY', type: 'recon', color: 'border-teal-500/50', bg: 'bg-teal-950/20', glow: 'shadow-[0_0_15px_rgba(20,184,166,0.2)]' },
];

const COMMS = [
  { agent: 'Nova', text: 'My models predict we\'ll hit $2,000 total revenue by next week if we maintain this velocity. Should we accelerate production?', time: '03:42 PM', color: 'text-green-400' },
  { agent: 'Queen', text: 'Not yet. Quality over quantity. Let\'s keep the QA pass rate above 80% and grow organically. Sustainable > fast.', time: '03:44 PM', color: 'text-red-400' },
  { agent: 'Forge', text: 'Agreed. No cutting corners. The Commander\'s standards are clear on this one.', time: '03:45 PM', color: 'text-orange-400' },
];

const TICKER = [
  "Introvert's Social Battery Hoodie - $83.43 - Michael M.",
  "Coffee & Code Ceramic Mug - $24.99 - Sarah T.",
  "Debug Mode ON T-Shirt - $35.00 - Alex J.",
  "404 Sleep Not Found Poster - $18.50 - Chris P.",
  "Git Push Force Hoodie - $75.00 - Emma W."
];

// Starfield Background Component
const Starfield = () => {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#020205]">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.1, 0.8, 0.1],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#05050a]/80 to-[#05050a] z-10 pointer-events-none" />
    </div>
  );
};

export default function App() {
  const [selectedRoom, setSelectedRoom] = useState<string>('bridge');
  const [time, setTime] = useState<string>('');
  
  // Real-time states
  const [crew, setCrew] = useState(CREW);
  const [comms, setComms] = useState(COMMS);
  const [ticker, setTicker] = useState(TICKER);
  const [metrics, setMetrics] = useState({ revenue: 1886.72, orders: 5, products: 18, activeAgents: 3 });
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    // Connect to WebSocket server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setWsStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'AGENT_TASK_UPDATE':
            setCrew(prev => prev.map(agent => 
              agent.id === data.payload.agentId 
                ? { ...agent, task: data.payload.task, room: data.payload.room }
                : agent
            ));
            break;
          case 'COMM_MESSAGE':
            setComms(prev => [data.payload, ...prev].slice(0, 50)); // Keep last 50 messages
            break;
          case 'TICKER_UPDATE':
            setTicker(prev => [data.payload.text, ...prev].slice(0, 10)); // Keep last 10
            break;
          case 'METRICS_UPDATE':
            setMetrics(prev => ({ ...prev, ...data.payload }));
            break;
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message', e);
      }
    };

    ws.onclose = () => {
      setWsStatus('disconnected');
    };

    ws.onerror = () => {
      setWsStatus('disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(`Day 3 - ${now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#05050a] text-gray-300 font-mono overflow-hidden flex flex-col crt-flicker">
      <Starfield />
      <div className="scanline" />

      {/* Top Status Bar */}
      <header className="relative z-20 flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#0a0a1a]/80 backdrop-blur-md">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${wsStatus === 'connected' ? 'bg-cyan-400 animate-pulse' : wsStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-cyan-400 font-bold tracking-wider">ULTRONOS</span>
            <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded border border-gray-700">
              {wsStatus === 'connected' ? 'STATION ONLINE' : wsStatus === 'connecting' ? 'CONNECTING...' : 'OFFLINE'}
            </span>
          </div>
          <div className="text-xs text-gray-400 font-pixel text-lg tracking-widest">{time}</div>
        </div>
        
        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">REVENUE:</span>
            <span className="text-green-400 font-bold">${metrics.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">ORDERS:</span>
            <span className="text-white font-bold">{metrics.orders}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">PRODUCTS:</span>
            <span className="text-cyan-400 font-bold">{metrics.products} LIVE</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">AGENTS:</span>
            <span className="text-purple-400 font-bold">{metrics.activeAgents}/6 ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-20 flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Ship Crew */}
        <aside className="w-72 border-r border-gray-800 bg-[#0a0a1a]/60 backdrop-blur-sm flex flex-col">
          <div className="p-3 border-b border-gray-800">
            <h2 className="text-xs font-bold text-gray-400 tracking-widest flex items-center">
              <Users className="w-3 h-3 mr-2" />
              SHIP CREW
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {crew.map((agent) => (
              <div 
                key={agent.id}
                onClick={() => setSelectedRoom(agent.room)}
                className={`p-2 rounded cursor-pointer border transition-all duration-200 ${
                  selectedRoom === agent.room 
                    ? `${agent.bg} ${agent.border}` 
                    : 'border-transparent hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded bg-gray-900 border ${agent.border} flex items-center justify-center text-lg`}>
                    {agent.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${agent.color}`}>{agent.name}</span>
                      {selectedRoom === agent.room && <div className={`w-1.5 h-1.5 rounded-full ${agent.color.replace('text', 'bg')} animate-pulse`} />}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">{agent.role}</div>
                    <div className="text-[10px] text-gray-400 mt-1 truncate">{agent.task}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center - Spaceship Grid */}
        <section className="flex-1 p-6 overflow-y-auto relative">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {ROOMS.map((room) => {
                const isSelected = selectedRoom === room.id;
                const occupants = crew.filter(c => c.room === room.id);
                
                return (
                  <motion.div
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`relative aspect-square rounded-lg border-2 cursor-pointer overflow-hidden transition-all duration-300 ${
                      isSelected ? `${room.color} ${room.glow} z-10 scale-105` : 'border-gray-800 hover:border-gray-600'
                    } ${room.bg}`}
                    whileHover={!isSelected ? { scale: 1.02 } : {}}
                  >
                    {/* Room Header */}
                    <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-center bg-black/40 backdrop-blur-sm border-b border-white/5">
                      <span className="text-[10px] font-bold tracking-widest text-gray-300">{room.name}</span>
                      <span className="text-[8px] text-gray-500 uppercase">{room.type}</span>
                    </div>

                    {/* Room Content (Pixel Art Placeholder) */}
                    <div className="absolute inset-0 mt-8 p-4 flex flex-col items-center justify-center">
                      {/* Abstract tech pattern representing the room */}
                      <div className="w-full h-full border border-white/5 rounded flex items-center justify-center relative overflow-hidden">
                         {/* Grid lines */}
                         <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                         
                         {/* Central Console / Feature */}
                         <div className={`absolute w-16 h-16 border rounded-full opacity-20 ${room.color} flex items-center justify-center`}>
                           <div className={`w-8 h-8 border rounded-full ${room.color}`} />
                         </div>
                         <div className={`absolute w-full h-[1px] opacity-10 ${room.color.replace('border', 'bg')}`} />
                         <div className={`absolute h-full w-[1px] opacity-10 ${room.color.replace('border', 'bg')}`} />

                         {/* Occupants */}
                         <div className="flex space-x-2 z-10">
                           {occupants.map((agent, i) => (
                             <motion.div 
                               key={agent.id}
                               className={`w-8 h-8 rounded border ${agent.border} bg-black/80 flex items-center justify-center text-lg relative`}
                               animate={{ y: [0, -4, 0] }}
                               transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                             >
                               {agent.avatar}
                               <div className={`absolute -bottom-1 w-4 h-1 rounded-full ${agent.color.replace('text', 'bg')} blur-[2px] opacity-50`} />
                             </motion.div>
                           ))}
                         </div>
                      </div>
                    </div>

                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/20" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/20" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/20" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/20" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Sidebar - Details & Comms */}
        <aside className="w-80 border-l border-gray-800 bg-[#0a0a1a]/60 backdrop-blur-sm flex flex-col">
          
          {/* Room/Agent Details */}
          <div className="flex-1 p-4 border-b border-gray-800 overflow-y-auto">
            {(() => {
              const room = ROOMS.find(r => r.id === selectedRoom);
              const occupants = crew.filter(c => c.room === selectedRoom);
              
              if (!room) return null;

              return (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-bold text-white tracking-wider">{room.name}</h2>
                      <span className="text-[10px] px-2 py-1 rounded bg-gray-800 text-gray-400 border border-gray-700 uppercase">{room.type}</span>
                    </div>
                    
                    {occupants.length > 0 ? (
                      <div className="space-y-4 mt-4">
                        {occupants.map(agent => (
                          <div key={agent.id} className={`p-3 rounded border ${agent.border} ${agent.bg}`}>
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="text-2xl">{agent.avatar}</div>
                              <div>
                                <div className={`font-bold ${agent.color}`}>{agent.name}</div>
                                <div className="text-[10px] text-gray-400">{agent.role}</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div className="bg-black/40 p-2 rounded border border-white/5">
                                <div className="text-gray-500 mb-1">STATUS</div>
                                <div className="text-white flex items-center">
                                  <div className={`w-1.5 h-1.5 rounded-full ${agent.color.replace('text', 'bg')} mr-1.5`} />
                                  ACTIVE
                                </div>
                              </div>
                              <div className="bg-black/40 p-2 rounded border border-white/5">
                                <div className="text-gray-500 mb-1">TASKS</div>
                                <div className="text-white">12 PENDING</div>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex space-x-2">
                              <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-[10px] py-1.5 rounded transition-colors">
                                MANAGE
                              </button>
                              <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-[10px] py-1.5 rounded transition-colors">
                                UPGRADE
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic mt-4">No agents currently stationed here.</div>
                    )}
                  </div>

                  {/* Contextual Data based on room */}
                  {selectedRoom === 'war_room' && (
                    <div className="p-3 bg-red-950/20 border border-red-500/30 rounded">
                      <div className="text-xs text-red-400 font-bold mb-2">REVENUE TARGET</div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-white">${metrics.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-gray-500">$10,000.00</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${Math.min((metrics.revenue / 10000) * 100, 100)}%` }} />
                      </div>
                    </div>
                  )}
                  
                  {selectedRoom === 'bridge' && (
                    <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded">
                      <div className="text-xs text-cyan-400 font-bold mb-2">SYSTEM DIAGNOSTICS</div>
                      <div className="space-y-2 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-gray-400">CPU LOAD</span>
                          <span className="text-white">24%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">MEMORY</span>
                          <span className="text-white">4.2 GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">NETWORK</span>
                          <span className="text-green-400">STABLE</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRoom === 'factory' && (
                    <div className="p-3 bg-orange-950/20 border border-orange-500/30 rounded">
                      <div className="text-xs text-orange-400 font-bold mb-2">PRODUCTION QUEUE</div>
                      <div className="space-y-2 text-[10px]">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Mug Designs</span>
                          <span className="text-orange-400">PROCESSING</span>
                        </div>
                        <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 w-[65%]" />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-400">Hoodie Mockups</span>
                          <span className="text-gray-500">QUEUED</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRoom === 'research' && (
                    <div className="p-3 bg-green-950/20 border border-green-500/30 rounded">
                      <div className="text-xs text-green-400 font-bold mb-2">TREND ANALYSIS</div>
                      <div className="space-y-2 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-gray-400">KEYWORD: "Retro Tech"</span>
                          <span className="text-green-400 flex items-center"><ArrowUpRight className="w-3 h-3 mr-1" /> +24%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">KEYWORD: "Cyberpunk"</span>
                          <span className="text-green-400 flex items-center"><ArrowUpRight className="w-3 h-3 mr-1" /> +12%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Ship Comms */}
          <div className="h-64 flex flex-col bg-[#05050a]">
            <div className="p-2 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-gray-400 flex items-center">
                <MessageSquare className="w-3 h-3 mr-1.5" />
                SHIP COMMS
              </h3>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {comms.map((msg) => (
                <div key={`${msg.agent}-${msg.time}`} className="text-[10px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold ${msg.color}`}>{msg.agent}</span>
                    <span className="text-gray-600">{msg.time}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Bottom Ticker */}
      <footer className="relative z-20 h-8 border-t border-gray-800 bg-[#0a0a1a] flex items-center overflow-hidden">
        <div className="px-3 h-full flex items-center border-r border-gray-800 bg-gray-900 z-10">
          <Activity className="w-3 h-3 text-green-400 mr-2" />
          <span className="text-[10px] font-bold text-green-400">LIVE</span>
        </div>
        <div className="flex-1 overflow-hidden relative flex items-center">
          <motion.div 
            className="flex whitespace-nowrap text-[10px] text-gray-400"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {/* Duplicate ticker items for seamless loop */}
            {[...ticker, ...ticker].map((item, i) => (
              <span key={i} className="mx-8 flex items-center">
                <span className="w-1 h-1 rounded-full bg-gray-600 mr-2" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
