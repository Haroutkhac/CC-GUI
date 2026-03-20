import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import fs from 'fs';
import { TerminalManager } from './terminal-manager.js';
import { Store } from './store.js';
import { Orchestrator } from './orchestrator.js';
import { AIOrchestrator } from './ai-orchestrator.js';
import { WorktreeManager } from './worktree-manager.js';
import { stripAnsi, STATUS_BUFFER_LIMIT } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.argv.includes('--production');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 1e8,
});

app.use(cors());
app.use(express.json());

const store = new Store(path.join(__dirname, '..', 'data', 'store.json'));
const terminalManager = new TerminalManager();
const orchestrator = new Orchestrator();
const aiOrchestrator = new AIOrchestrator({ terminalManager });
const worktreeManager = new WorktreeManager();
const statusBuffers = {};
const sessionSummaries = {};

// On server startup, reset sessions that claim to be running but have no pty
// (happens after server crash/restart — ptys are in-memory only)
for (const session of store.getSessions()) {
  if (session.status === 'active' || session.status === 'working' || session.status === 'waiting') {
    store.updateSession(session.id, { status: 'idle' });
  }
}

// Broadcast orchestrator state whenever priorities change
orchestrator.onChange = () => {
  io.emit('orchestrator:update', orchestrator.getRanked());
};

// Broadcast AI summaries whenever they update
aiOrchestrator.onChange = () => {
  io.emit('ai:summaries', aiOrchestrator.getSummaries());
};

// Broadcast auto-responses as they happen
aiOrchestrator.onAutoRespond = (entry) => {
  const session = store.getSession(entry.sessionId);
  const starterName = session?.starter
    ? session.starter.charAt(0).toUpperCase() + session.starter.slice(1)
    : session?.name || 'Agent';
  io.emit('ai:auto-response', entry);
  io.emit('notification', {
    sessionId: entry.sessionId,
    type: 'auto_responded',
    message: `Auto-approved for ${starterName}: ${entry.prompt.slice(-80)}`,
    projectId: session?.projectId,
  });
  console.log(`[Auto-respond] ${starterName}: Y → ${entry.prompt.slice(-80)}`);
};

// Serve static files in production
if (isProduction) {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
}

// --- REST API ---

app.get('/api/projects', (req, res) => {
  res.json(store.getProjects());
});

app.post('/api/projects', (req, res) => {
  const { name, path: projectPath } = req.body;
  if (!name || !projectPath) {
    return res.status(400).json({ error: 'name and path required' });
  }
  const resolved = path.resolve(projectPath.replace(/^~/, os.homedir()));
  if (!fs.existsSync(resolved)) {
    return res.status(400).json({ error: `Path does not exist: ${resolved}` });
  }
  const project = store.createProject(name, resolved);
  io.emit('projects:updated', store.getProjects());
  res.json(project);
});

app.delete('/api/projects/:id', async (req, res) => {
  const project = store.getProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'not found' });

  const sessions = store.getSessionsByProject(req.params.id);
  for (const session of sessions) {
    terminalManager.kill(session.id);
    // Clean up git worktree and branch
    if (session.worktreePath) {
      await worktreeManager.remove(project.path, session.worktreePath);
      await worktreeManager.removeBranch(project.path, session.branch);
    }
    delete statusBuffers[session.id];
    delete sessionSummaries[session.id];
    orchestrator.remove(session.id);
    aiOrchestrator.remove(session.id);
    store.deleteSession(session.id);
  }

  store.deleteProject(req.params.id);
  io.emit('projects:updated', store.getProjects());
  io.emit('sessions:updated', store.getSessions());
  res.json({ ok: true });
});

app.get('/api/sessions', (req, res) => {
  res.json(store.getSessions());
});

app.post('/api/sessions', async (req, res) => {
  const { projectId, name, command } = req.body;
  const project = store.getProject(projectId);
  if (!project) return res.status(404).json({ error: 'project not found' });

  const session = store.createSession(projectId, name || 'New Session', command);

  // Create a git worktree for this session so it gets an isolated copy of the repo
  try {
    if (await worktreeManager.isGitRepo(project.path)) {
      const shortId = session.id.slice(0, 8);
      const branch = `cc-gui/${session.starter}-${shortId}`;
      const worktreePath = await worktreeManager.create(project.path, session.id, branch);
      store.updateSession(session.id, { worktreePath, branch });
      Object.assign(session, { worktreePath, branch });
    }
  } catch (err) {
    console.warn(`Worktree creation failed for session ${session.id}, using project path:`, err.message);
  }

  io.emit('sessions:updated', store.getSessions());
  io.emit('projects:updated', store.getProjects());
  res.json(session);
});

app.delete('/api/sessions/:id', async (req, res) => {
  const session = store.getSession(req.params.id);
  const project = session ? store.getProject(session.projectId) : null;

  terminalManager.kill(req.params.id);

  // Clean up git worktree and branch
  if (session?.worktreePath && project) {
    await worktreeManager.remove(project.path, session.worktreePath);
    await worktreeManager.removeBranch(project.path, session.branch);
  }

  store.deleteSession(req.params.id);
  delete statusBuffers[req.params.id];
  delete sessionSummaries[req.params.id];
  orchestrator.remove(req.params.id);
  aiOrchestrator.remove(req.params.id);
  io.emit('sessions:updated', store.getSessions());
  io.emit('projects:updated', store.getProjects());
  res.json({ ok: true });
});

app.patch('/api/sessions/:id', (req, res) => {
  const session = store.updateSession(req.params.id, req.body);
  if (!session) return res.status(404).json({ error: 'not found' });
  io.emit('sessions:updated', store.getSessions());
  res.json(session);
});

// --- Discovery API ---

// Cache discovery results for 30s
let discoveryCache = null;
let discoveryCacheTime = 0;
const CACHE_TTL = 30000;

function runCommand(cmd, args, timeout = 10000) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout, maxBuffer: 1024 * 1024, env: { ...process.env, PATH: `${os.homedir()}/.local/bin:${process.env.PATH}` } }, (err, stdout) => {
      // Return stdout even on error (find exits non-zero on permission-denied dirs but still has results)
      resolve(stdout || '');
    });
  });
}

app.get('/api/discover', async (req, res) => {
  const now = Date.now();
  if (discoveryCache && now - discoveryCacheTime < CACHE_TTL) {
    return res.json(discoveryCache);
  }

  const home = os.homedir();
  const existingPaths = new Set(store.getProjects().map(p => p.path));

  // Run local scan and GitHub list in parallel
  const [localOutput, ghOutput] = await Promise.all([
    runCommand('find', [
      home, '-maxdepth', '3', '-name', '.git', '-type', 'd',
      '-not', '-path', '*/node_modules/*',
      '-not', '-path', '*/.nvm/*',
      '-not', '-path', '*/.npm/*',
      '-not', '-path', '*/.cache/*',
      '-not', '-path', '*/.Trash/*',
    ], 8000),
    runCommand('gh', ['repo', 'list', '--json', 'name,nameWithOwner,url', '--limit', '50'], 10000),
  ]);

  // Parse local repos
  const local = localOutput
    .split('\n')
    .filter(Boolean)
    .map(gitDir => {
      const repoPath = path.dirname(gitDir);
      const name = path.basename(repoPath);
      return { name, path: repoPath, source: 'local' };
    })
    .filter(r => r.name !== '.' && !r.path.includes('/.'))
    .filter(r => !existingPaths.has(r.path));

  // Parse GitHub repos
  let github = [];
  try {
    const repos = JSON.parse(ghOutput || '[]');
    // Check which ones are already cloned locally
    const localPaths = new Map(local.map(l => [l.name.toLowerCase(), l.path]));
    github = repos.map(r => {
      const localPath = localPaths.get(r.name.toLowerCase());
      return {
        name: r.name,
        nameWithOwner: r.nameWithOwner,
        url: r.url,
        path: localPath || null,
        source: localPath ? 'both' : 'github',
      };
    }).filter(r => !existingPaths.has(r.path));
  } catch (e) {
    console.warn('GitHub discovery unavailable:', e.message);
  }

  // Merge: local repos that aren't in GitHub list + all GitHub repos
  const githubNames = new Set(github.map(g => g.name.toLowerCase()));
  const localOnly = local.filter(l => !githubNames.has(l.name.toLowerCase()));

  const result = { local: localOnly, github };
  discoveryCache = result;
  discoveryCacheTime = now;
  res.json(result);
});

// --- Socket.IO ---

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.emit('projects:updated', store.getProjects());
  socket.emit('sessions:updated', store.getSessions());
  socket.emit('sessions:summaries', sessionSummaries);
  socket.emit('orchestrator:update', orchestrator.getRanked());
  socket.emit('ai:summaries', aiOrchestrator.getSummaries());
  socket.emit('ai:status', aiOrchestrator.getStatus());

  socket.on('terminal:attach', (sessionId) => {
    const session = store.getSession(sessionId);
    if (!session) {
      socket.emit('terminal:error', { sessionId, error: 'Session not found' });
      return;
    }

    const project = store.getProject(session.projectId);
    if (!project) {
      socket.emit('terminal:error', { sessionId, error: 'Project not found' });
      return;
    }

    let term = terminalManager.get(sessionId);
    if (!term) {
      // Don't re-spawn a process that already exited — show previous output instead
      if (session.status === 'exited' || session.status === 'completed') {
        socket.join(`session:${sessionId}`);
        const scrollback = terminalManager.getScrollback(sessionId);
        if (scrollback) {
          socket.emit('terminal:data', { sessionId, data: scrollback });
        }
        socket.emit('terminal:exit', { sessionId, code: session.exitCode ?? 0 });
        socket.emit('terminal:attached', { sessionId });
        return;
      }

      const cmd = (session.command || 'claude').trim();
      if (!cmd) {
        socket.emit('terminal:error', { sessionId, error: 'No command specified' });
        return;
      }
      const parts = cmd.split(/\s+/);
      const command = parts[0];
      const commandArgs = parts.slice(1);

      try {
        const cwd = session.worktreePath || project.path;
        term = terminalManager.create(sessionId, command, commandArgs, {
          cwd,
          onData: (data) => {
            io.to(`session:${sessionId}`).emit('terminal:data', { sessionId, data });
            detectStatus(sessionId, data);
            const sess = store.getSession(sessionId);
            const proj = sess ? store.getProject(sess.projectId) : null;
            const meta = {
              sessionName: sess?.name,
              projectName: proj?.name,
              projectId: sess?.projectId,
            };
            orchestrator.ingest(sessionId, data, meta);
            aiOrchestrator.ingest(sessionId, data, meta);
          },
          onExit: (code) => {
            const sess = store.getSession(sessionId);
            // Session may have been deleted before exit fired — skip if gone
            if (!sess) return;
            const exitStatus = code === 0 ? 'completed' : 'exited';
            store.updateSession(sessionId, { status: exitStatus, exitCode: code });
            io.to(`session:${sessionId}`).emit('terminal:exit', { sessionId, code });
            io.emit('sessions:updated', store.getSessions());

            const meta = {
              exitCode: code,
              sessionName: sess.name,
              projectName: store.getProject(sess.projectId)?.name,
              projectId: sess.projectId,
            };
            orchestrator.onStatusChange(sessionId, exitStatus, meta);
            aiOrchestrator.onStatusChange(sessionId, exitStatus, meta);

            // Notify on completion
            if (exitStatus === 'completed') {
              const starterName = sess.starter
                ? sess.starter.charAt(0).toUpperCase() + sess.starter.slice(1)
                : sess.name;
              io.emit('notification', {
                sessionId,
                type: 'completed',
                message: `${starterName} finished the task!`,
                projectId: sess.projectId,
              });
            }
          },
        });
      } catch (err) {
        console.error(`Failed to spawn terminal for session ${sessionId}:`, err.message);
        socket.emit('terminal:error', { sessionId, error: `Failed to start terminal: ${err.message}` });
        return;
      }

      store.updateSession(sessionId, { status: 'active' });
      io.emit('sessions:updated', store.getSessions());
    }

    socket.join(`session:${sessionId}`);

    const scrollback = terminalManager.getScrollback(sessionId);
    if (scrollback) {
      socket.emit('terminal:data', { sessionId, data: scrollback });
    }

    socket.emit('terminal:attached', { sessionId });
  });

  socket.on('terminal:detach', (sessionId) => {
    socket.leave(`session:${sessionId}`);
  });

  socket.on('terminal:input', ({ sessionId, data }) => {
    if (typeof data !== 'string') return;
    try {
      terminalManager.write(sessionId, data);
    } catch (e) {
      socket.emit('terminal:error', { sessionId, error: 'Failed to write' });
    }
  });

  socket.on('terminal:resize', ({ sessionId, cols, rows }) => {
    if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols <= 0 || rows <= 0) return;
    terminalManager.resize(sessionId, cols, rows);
  });

  // AI Orchestrator controls
  socket.on('ai:toggle-auto-respond', () => {
    aiOrchestrator.autoRespondEnabled = !aiOrchestrator.autoRespondEnabled;
    io.emit('ai:status', aiOrchestrator.getStatus());
    console.log(`[AI Orchestrator] Auto-respond ${aiOrchestrator.autoRespondEnabled ? 'enabled' : 'disabled'}`);
  });

  socket.on('ai:refresh', () => {
    aiOrchestrator.refreshAll();
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Session summaries (last meaningful output line per session)

// Status detection
function detectStatus(sessionId, data) {
  if (!statusBuffers[sessionId]) statusBuffers[sessionId] = '';
  statusBuffers[sessionId] += data;

  if (statusBuffers[sessionId].length > STATUS_BUFFER_LIMIT) {
    statusBuffers[sessionId] = statusBuffers[sessionId].slice(-STATUS_BUFFER_LIMIT);
  }

  const buf = statusBuffers[sessionId];
  const clean = stripAnsi(buf);
  const session = store.getSession(sessionId);
  if (!session) {
    delete statusBuffers[sessionId]; // cleanup orphaned buffer
    return;
  }

  let newStatus = session.status;

  // Check the tail of the cleaned buffer for prompt patterns
  const tail = clean.slice(-200);

  // Claude Code waiting for input: ">" or "❯" prompt at end, or "?" for confirmations
  if (/(?:^|\n)\s*>\s*$/.test(tail) || /❯\s*$/.test(tail) || /\?\s*$/.test(tail) || /\(Y\/n\)\s*$/i.test(tail) || /\(y\/N\)\s*$/i.test(tail)) {
    // Check auto-respond for Y/n prompts BEFORE setting waiting status
    if (/\(Y\/n\)\s*$/i.test(tail)) {
      const autoResponded = aiOrchestrator.checkAutoRespond(sessionId, tail);
      if (autoResponded) {
        // Don't set waiting — we already responded
        return;
      }
    }
    newStatus = 'waiting';
  } else if (/(Thinking|Working|Running|Executing|Reading|Writing|Editing|Searching|Analyzing|Creating|Updating|Compiling|Building|Installing)/i.test(tail)) {
    newStatus = 'working';
  } else if (session.status === 'waiting' || session.status === 'working') {
    // Terminal output no longer matches waiting/working patterns — session has moved on
    newStatus = 'active';
  }

  if (newStatus !== session.status) {
    store.updateSession(sessionId, { status: newStatus });
    io.emit('sessions:updated', store.getSessions());

    // Notify AI orchestrator of status changes for summarization
    const proj = store.getProject(session.projectId);
    aiOrchestrator.onStatusChange(sessionId, newStatus, {
      sessionName: session.name,
      projectName: proj?.name,
      projectId: session.projectId,
    });

    // Only notify for waiting state (input needed)
    if (newStatus === 'waiting') {
      const starterName = session.starter
        ? session.starter.charAt(0).toUpperCase() + session.starter.slice(1)
        : session.name;
      io.emit('notification', {
        sessionId,
        type: 'input_needed',
        message: `${starterName} needs your input!`,
        projectId: session.projectId,
      });
    }
  }

  // Extract last meaningful line for summaries
  const lines = clean.split('\n').filter(l => l.trim().length > 0);
  const lastLine = lines.length > 0 ? lines[lines.length - 1].slice(0, 120) : '';
  if (lastLine && sessionSummaries[sessionId] !== lastLine) {
    sessionSummaries[sessionId] = lastLine;
    io.emit('sessions:summaries', sessionSummaries);
  }
}

// Get local IP
function getNetworkIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

// Graceful shutdown - kill all pty processes
function shutdown(signal) {
  console.log(`\n  ${signal} received. Cleaning up terminals...`);
  terminalManager.killAll();
  // Cancel any pending AI orchestrator work
  if (aiOrchestrator._timer) {
    clearTimeout(aiOrchestrator._timer);
    aiOrchestrator._timer = null;
  }
  // Clean up status buffers
  for (const key of Object.keys(statusBuffers)) {
    delete statusBuffers[key];
  }
  server.close(() => {
    console.log('  Server closed.');
    process.exit(0);
  });
  // Force exit after 5s
  setTimeout(() => process.exit(1), 5000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

const PORT = process.env.PORT || 3456;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  Claude Code Guild server running on http://localhost:${PORT}`);
  console.log(`  Network access: http://${getNetworkIP()}:${PORT}`);
  console.log(`  AI Orchestrator: auto-respond ${aiOrchestrator.autoRespondEnabled ? 'ON' : 'OFF'}\n`);
});
