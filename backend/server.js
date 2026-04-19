import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'etsy-ai-bot-backend' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API listening on http://localhost:${PORT}`);
});
