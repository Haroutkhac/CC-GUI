# CC-GUI

A Pokemon-themed GUI for managing multiple [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI sessions. Walk around a pixel-art world, spawn Claude sessions as Pokemon, and triage them from a command center.

## What it does

- **Projects as tables** — each project points to a directory on your machine
- **Sessions as Pokemon** — each session runs `claude` (or any command) in that project's directory via a real PTY
- **Command Center** — orchestrator watches all terminals and ranks them by urgency (needs confirmation > waiting for input > errors > working > idle)
- **Project discovery** — scans your local git repos and GitHub account so you can add projects in one click
- **Terminal overlay** — full xterm.js terminal with mobile support, quick actions, and session switching

## Quick start

```bash
git clone https://github.com/Haroutkhac/CC-GUI.git
cd CC-GUI
npm install
cp data/store.example.json data/store.json
npm run dev
```

Open http://localhost:5173

## Requirements

- Node.js 18+
- `claude` CLI installed ([install guide](https://docs.anthropic.com/en/docs/claude-code))
- `gh` CLI (optional, for GitHub repo discovery)

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `K` | Toggle Command Center |
| `N` | New project |
| `S` | Spawn session |
| `T` | Team dashboard |
| `1-9` | Jump to session by priority |
| `ESC` | Close / back |
| `WASD` / Arrows | Move character |
| `Enter` / `Space` | Interact |

Shortcuts are disabled when typing in input fields or inside a terminal.

## Architecture

```
server/
  index.js              Express + Socket.IO server, REST API, status detection
  store.js              JSON file persistence
  terminal-manager.js   node-pty wrapper
  orchestrator.js       Priority ranking engine

src/
  App.jsx               Root component
  hooks/useSocket.js    Socket.IO React hook
  components/
    GameCanvas.jsx      Pixel-art game world
    TerminalOverlay.jsx xterm.js terminal
    OrchestratorPanel.jsx Command center UI
    SessionCarousel.jsx Session browser
    StatusDashboard.jsx Team overview
    DialogBox.jsx       Project picker + dialogs
    HUD.jsx             Top bar
  game/
    engine.js           2D tile-based game engine
    sprites.js          Pixel art drawing
```

## Security notice

This tool spawns real terminal processes and provides full shell access through the browser. It is designed for **local use only**.

- The server binds to `0.0.0.0` and accepts connections from any origin
- Anyone who can reach the server can execute arbitrary commands
- The `/api/discover` endpoint lists git repos on your machine
- **Do not expose this to the public internet**

For remote access, use a VPN or [Tailscale](https://tailscale.com) (see [SETUP.md](SETUP.md)).

## License

MIT
