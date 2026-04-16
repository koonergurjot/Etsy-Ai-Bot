<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ULTRONOS Dashboard

A space-station style operations dashboard with:

- Worker status indicators (green/yellow/red)
- Clickable personal status modals (full config + history + performance)
- Dynamic zone progress meters
- Contextual modules (Engineering, Science, Life Support)
- Hover task visualization with real-time progress
- Gamified XP leaderboard + unlocks
- Day/night cycle + live environment map panel

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Build production bundle:
   ```bash
   npm run build
   ```

## Auto-sync local edits to GitHub

Use the included watcher script to auto-commit and auto-push every local change:

```bash
python auto_push.py .
```

Then keep that terminal window running while you edit files.

For full Windows setup and authentication details, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).
