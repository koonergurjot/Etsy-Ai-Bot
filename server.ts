import express from 'express';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // WebSocket connection for real-time agent updates
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');
    
    // Send initial state
    ws.send(JSON.stringify({
      type: 'INIT',
      payload: {
        message: 'Connected to Hermes Agent Backend'
      }
    }));

    // Simulate Hermes Agent logs/events coming in
    const interval = setInterval(() => {
      const events = [
        { type: 'AGENT_TASK_UPDATE', payload: { agentId: 'nova', task: 'Analyzing top 10 Etsy listings for "Cyberpunk"', room: 'research' } },
        { type: 'AGENT_TASK_UPDATE', payload: { agentId: 'forge', task: 'Rendering 3D mockup for Hoodie_v2', room: 'factory' } },
        { type: 'AGENT_TASK_UPDATE', payload: { agentId: 'pixel', task: 'Generating neon color palettes', room: 'media' } },
        { type: 'AGENT_TASK_UPDATE', payload: { agentId: 'atlas', task: 'Competitor pricing updated', room: 'strategy' } },
        { type: 'AGENT_TASK_UPDATE', payload: { agentId: 'ultron', task: 'Delegating tasks to Nova and Forge', room: 'bridge' } },
        { type: 'AGENT_TASK_UPDATE', payload: { agentId: 'cipher', task: 'Syncing logs to main database', room: 'comms' } },
        { type: 'COMM_MESSAGE', payload: { agent: 'Nova', text: 'Found a trending keyword: "Synthwave". Passing to Pixel.', time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }), color: 'text-green-400' } },
        { type: 'COMM_MESSAGE', payload: { agent: 'Pixel', text: 'On it. Generating new visual assets now.', time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }), color: 'text-pink-400' } },
        { type: 'COMM_MESSAGE', payload: { agent: 'Forge', text: 'Mockups ready for review.', time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }), color: 'text-orange-400' } },
        { type: 'COMM_MESSAGE', payload: { agent: 'Queen', text: 'Approving mockups. Quality looks good.', time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }), color: 'text-red-400' } },
        { type: 'TICKER_UPDATE', payload: { text: `Synthwave Desk Mat - $29.99 - User${Math.floor(Math.random() * 1000)}` } },
        { type: 'TICKER_UPDATE', payload: { text: `Retro Tech Hoodie - $55.00 - User${Math.floor(Math.random() * 1000)}` } },
        { type: 'METRICS_UPDATE', payload: { revenue: 1886.72 + Math.floor(Math.random() * 500), orders: 5 + Math.floor(Math.random() * 5) } }
      ];
      
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      ws.send(JSON.stringify(randomEvent));
    }, 3500);

    ws.on('close', () => {
      console.log('Client disconnected');
      clearInterval(interval);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
