# CC-GUI

A Pokemon-themed GUI for managing multiple [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI sessions. Walk around a pixel-art world, spawn Claude sessions as Pokemon, and triage them from a command center.

## Demo

[Watch the screen recording](docs/media/cc-gui-demo.mov)

## What it does

- **Projects as tables** — each project points to a directory on your machine
- **Sessions as Pokemon** — each session runs `claude` (or any command) in that project's directory via a real PTY
- **Command Center** — orchestrator watches all terminals and ranks them by urgency (needs confirmation > waiting for input > errors > working > idle)
- **Project discovery** — scans your local git repos and GitHub account so you can add projects in one click
- **Terminal overlay** — full xterm.js terminal with mobile support, quick actions, and session switching

## Setup

### Prerequisites

| Dependency | Required | Purpose |
|-----------|----------|---------|
| [Node.js](https://nodejs.org/) 18+ | Yes | Runtime for the server and build tools |
| [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) | Yes | The `claude` command that sessions run |
| [GitHub CLI](https://cli.github.com/) (`gh`) | No | Enables GitHub repo discovery in the project picker |

**Verify your setup:**

```bash
node --version    # Should print v18.x or higher
claude --version  # Should print the Claude Code version
gh auth status    # Optional — should show "Logged in" if you want GitHub discovery
```

`node-pty` (a dependency) compiles native code, so you also need a C/C++ toolchain. On macOS this means Xcode Command Line Tools (`xcode-select --install`). On Linux, `build-essential` and `python3`.

### Installation

```bash
# Clone the repo
git clone https://github.com/Haroutkhac/CC-GUI.git
cd CC-GUI

# Install dependencies (includes native compilation of node-pty)
npm install

# Create your local data file from the template
cp data/store.example.json data/store.json
```

### Running in development

```bash
npm run dev
```

This starts two processes concurrently:
- **API server** on `http://localhost:3456` — Express + Socket.IO, manages terminals
- **Vite dev server** on `http://localhost:5173` — React frontend with hot reload

Open **http://localhost:5173** in your browser.

### Safe mode defaults

CC-GUI now starts in `OPENAI_SAFE_MODE=true` by default.

- Server host defaults to `127.0.0.1`
- CORS is restricted to explicit local origins
- Auto-respond starts disabled
- Sessions running protected agent commands such as `codex` or `openai` require manual approvals

Optional environment variables:

```bash
OPENAI_SAFE_MODE=true
HOST=127.0.0.1
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ALLOW_UNSAFE_REMOTE=false
PROTECTED_AGENT_COMMANDS=codex,openai
DEFAULT_SESSION_COMMAND=claude
```

If you set `HOST` to a non-local address while safe mode is on, startup will fail unless `ALLOW_UNSAFE_REMOTE=true` is also set.

To boot the GUI in Codex mode, set:

```bash
DEFAULT_SESSION_COMMAND=codex npm run dev
```

That changes the default command used by quick-create and the new-session dialog. You can still override the command per session.

### Running in production

```bash
npm run build    # Build the React frontend into dist/
npm start        # Start the server serving the built files
```

Then open `http://localhost:3456`. The server serves both the API and the static frontend.

## Usage

### 1. Add a project

Press `N` or click `+ TABLE` in the top-right corner. The project picker shows:

- **GITHUB** — repos from your GitHub account (requires `gh` CLI). Tagged `LOCAL` if already cloned, `REMOTE` if not.
- **LOCAL** — git repos found in your home directory (scans 3 levels deep)

Click any repo to add it, or choose **ENTER PATH MANUALLY** to type an absolute path.

### 2. Create a session

Click a table in the game world to see its sessions, then create one. Each session defaults to running `DEFAULT_SESSION_COMMAND` in the project's directory, which is `claude` unless you override it. You can change the command to anything (`codex`, `bash`, `npm run dev`, etc.).

### 3. Open a terminal

Click a Pokemon (session) to open its terminal. This spawns the command in a real PTY — it's identical to running it in your regular terminal. Type prompts, approve tool use, everything works.

### 4. Triage with the Command Center

Press `K` or click `CMD CTR` to open the orchestrator. It monitors all running sessions and shows what needs your attention:

| Priority | Meaning | Example |
|----------|---------|---------|
| CRITICAL | Needs confirmation | Claude asking `(Y/n)` to approve a tool |
| HIGH | Waiting for input or errored | Claude showing the `>` prompt, or a command that failed |
| MEDIUM | Task completed | Claude finished and output shows `Done` or `✓` |
| LOW | Actively working | Claude is thinking, reading files, writing code |

Click any item to jump straight into that terminal.

### 5. Keyboard shortcuts

| Key | Action |
|-----|--------|
| `K` | Toggle Command Center |
| `N` | New project |
| `S` | Spawn session |
| `T` | Team dashboard |
| `1-9` | Jump to session by priority rank |
| `ESC` | Close / back |
| `WASD` / Arrows | Move character |
| `Enter` / `Space` | Interact with nearby table or Pokemon |

Shortcuts are disabled when typing in input fields or inside a terminal.

### Seed test data

To populate the world with sample projects and sessions:

```bash
node scripts/seed.js
```

## Architecture

```
scripts/
  seed.js               Populates sample projects and sessions for testing

server/
  index.js              Express + Socket.IO server, REST API, status detection
  store.js              JSON file persistence (data/store.json)
  terminal-manager.js   node-pty wrapper for spawning and managing PTY processes
  orchestrator.js       Monitors terminal output and ranks sessions by priority

src/
  App.jsx               Root component, state management, keyboard shortcuts
  main.jsx              Entry point
  hooks/useSocket.js    Socket.IO React hook (manages all server communication)
  components/
    GameCanvas.jsx      Pixel-art 2D game world (canvas-based)
    TerminalOverlay.jsx xterm.js terminal emulator with mobile support
    OrchestratorPanel.jsx Command center — prioritized session queue
    SessionCarousel.jsx Swipeable session browser per project
    StatusDashboard.jsx Full team overview grouped by project
    DialogBox.jsx       Project picker (discovery) + session/project dialogs
    HUD.jsx             Top bar with stats, buttons, shortcut reference
    NotificationToast.jsx Toast notifications for session state changes
  game/
    engine.js           Tile-based 2D engine with camera, pathfinding, interaction
    sprites.js          Pixel art drawing functions for all Pokemon + environment
  styles/
    index.css           All styles (Pokemon retro theme)
```

**Data flow:** The React client communicates with the Express server over Socket.IO (WebSocket). When you open a terminal, the server spawns a PTY process via `node-pty` and streams its output to the client via Socket.IO rooms. The orchestrator listens to all terminal output server-side, strips ANSI codes, pattern-matches against Claude Code's prompt formats, and broadcasts priority rankings to all connected clients.

## Troubleshooting

**`npm install` fails on `node-pty`**
You need a C/C++ compiler. On macOS: `xcode-select --install`. On Ubuntu/Debian: `sudo apt install build-essential python3`.

**`claude` command not found when opening a session**
The server adds `~/.local/bin` to the PATH for spawned processes. If your `claude` binary is elsewhere, check `which claude` and either symlink it or set the session command to the full path.

**Blank screen on load**
Make sure both the API server (`:3456`) and Vite (`:5173`) are running. `npm run dev` starts both. Check the terminal output for errors.

**GitHub repos not showing in project picker**
Install and authenticate the GitHub CLI: `gh auth login`.

## Security notice

This tool spawns real terminal processes and provides full shell access through the browser. It is designed for **local use only**.

- Safe mode defaults to `127.0.0.1` and explicit local origins only
- Disabling safe mode or allowing remote access makes the app materially riskier
- Anyone who can reach the server can execute arbitrary commands
- The `/api/discover` endpoint lists git repos on your machine
- **Do not expose this to the public internet**
- For OpenAI/Codex sessions, keep approvals manual and do not share access to a logged-in session
- Terminal scrollback and transcript-derived state may contain prompts, repo paths, and secrets; clean `data/scrollback/` regularly if you use protected agent sessions

For remote access, use a VPN or [Tailscale](https://tailscale.com).

## License

MIT
