# Etsy-Ai-Bot

Starter monorepo layout for an Etsy AI bot project.

## Project structure

```text
Etsy-Ai-Bot/
├── frontend/          # React + Vite app
├── backend/           # Node.js + Express API
├── hermes-skills/     # Custom Hermes skill JSON files
├── .env.example       # Template for API keys
├── README.md          # Setup instructions
├── package.json       # Dependencies + scripts
└── docker-compose.yml # Optional local orchestration
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start frontend in development mode:
   ```bash
   npm run dev
   ```
3. Start backend API:
   ```bash
   npm run backend
   ```
4. Build frontend for production:
   ```bash
   npm run build
   ```

## Environment variables

Copy `.env.example` to `.env` and fill in your keys.

## Hermes skills

Place your custom skill JSON definitions in `hermes-skills/`.
