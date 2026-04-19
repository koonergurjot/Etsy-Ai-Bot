import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { HermesWatcher } from './hermesWatcher.js';
import { EtsyClient } from './etsyClient.js';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Manual CORS — no extra dependency needed
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(ws => ws.readyState === 1 && ws.send(msg));
}

// Hermes Agent log watcher
const hermes = new HermesWatcher(process.env.HERMES_LOG_PATH || './hermes-agent.log');
hermes.on('agentUpdate', data => broadcast({ type: 'agentUpdate', ...data }));
hermes.on('taskComplete', data => broadcast({ type: 'taskComplete', ...data }));
hermes.start();

// Etsy client with 30-second cache
const etsy = new EtsyClient({
  apiKey: process.env.ETSY_API_KEY,
  shopId: process.env.ETSY_SHOP_ID,
});

// Broadcast Etsy stats every 60 seconds
setInterval(async () => {
  try {
    broadcast({ type: 'etsyStats', ...await etsy.getStats() });
  } catch { /* Etsy API unavailable */ }
}, 60_000);

// WebSocket: send full initial state on connect
wss.on('connection', ws => {
  console.log('[WS] Client connected');

  Promise.all([
    etsy.getStats().catch(() => etsy.getMockStats()),
    hermes.getAgentState(),
  ]).then(([etsyStats, agentState]) => {
    ws.send(JSON.stringify({ type: 'init', etsyStats, agentState }));
  });

  ws.on('message', raw => {
    try {
      const { type } = JSON.parse(raw.toString());
      if (type === 'ping') ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
    } catch { /* ignore malformed messages */ }
  });

  ws.on('close', () => console.log('[WS] Client disconnected'));
  ws.on('error', err => console.error('[WS]', err.message));
});

// REST endpoints
app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  service: 'ultronos',
  ts: Date.now(),
  wsClients: wss.clients.size,
  hermesActive: hermes.isActive(),
}));

app.get('/api/etsy/stats', async (_req, res) => {
  try { res.json(await etsy.getStats()); }
  catch { res.json(etsy.getMockStats()); }
});

app.get('/api/agents', (_req, res) => res.json(hermes.getAgentState()));

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`ULTRONOS backend  \u25b6  http://localhost:${PORT}`);
  console.log(`WebSocket server  \u25b6  ws://localhost:${PORT}`);
});
