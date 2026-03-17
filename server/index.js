import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { TerminalManager } from './terminal-manager.js';
import { Store } from './store.js';

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
const statusBuffers = {};
const sessionSummaries = {};

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
  const project = store.createProject(name, projectPath);
  io.emit('projects:updated', store.getProjects());
  res.json(project);
});

app.delete('/api/projects/:id', (req, res) => {
  const project = store.getProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'not found' });

  const sessions = store.getSessionsByProject(req.params.id);
  for (const session of sessions) {
    terminalManager.kill(session.id);
    delete statusBuffers[session.id];
    delete sessionSummaries[session.id];
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

app.post('/api/sessions', (req, res) => {
  const { projectId, name, command } = req.body;
  const project = store.getProject(projectId);
  if (!project) return res.status(404).json({ error: 'project not found' });

  const session = store.createSession(projectId, name || 'New Session', command);
  io.emit('sessions:updated', store.getSessions());
  io.emit('projects:updated', store.getProjects());
  res.json(session);
});

app.delete('/api/sessions/:id', (req, res) => {
  terminalManager.kill(req.params.id);
  store.deleteSession(req.params.id);
  delete statusBuffers[req.params.id];
  delete sessionSummaries[req.params.id];
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

// --- Socket.IO ---

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.emit('projects:updated', store.getProjects());
  socket.emit('sessions:updated', store.getSessions());
  socket.emit('sessions:summaries', sessionSummaries);

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
      const cmd = (session.command || 'claude').trim();
      if (!cmd) {
        socket.emit('terminal:error', { sessionId, error: 'No command specified' });
        return;
      }
      const parts = cmd.split(/\s+/);
      const command = parts[0];
      const commandArgs = parts.slice(1);

      term = terminalManager.create(sessionId, command, commandArgs, {
        cwd: project.path,
        onData: (data) => {
          io.to(`session:${sessionId}`).emit('terminal:data', { sessionId, data });
          detectStatus(sessionId, data);
        },
        onExit: (code) => {
          store.updateSession(sessionId, { status: 'exited', exitCode: code });
          io.to(`session:${sessionId}`).emit('terminal:exit', { sessionId, code });
          io.emit('sessions:updated', store.getSessions());
        },
      });

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

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Session summaries (last meaningful output line per session)
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').replace(/[\x00-\x1f]/g, ' ').trim();
}

// Status detection
function detectStatus(sessionId, data) {
  if (!statusBuffers[sessionId]) statusBuffers[sessionId] = '';
  statusBuffers[sessionId] += data;

  if (statusBuffers[sessionId].length > 2000) {
    statusBuffers[sessionId] = statusBuffers[sessionId].slice(-2000);
  }

  const buf = statusBuffers[sessionId];
  const session = store.getSession(sessionId);
  if (!session) {
    delete statusBuffers[sessionId]; // cleanup orphaned buffer
    return;
  }

  let newStatus = session.status;

  // Detect Claude Code waiting for input (match only at end of buffer)
  if (/\n>\s*$/.test(buf) || /\n\?\s*$/.test(buf) || /\n❯\s*$/.test(buf)) {
    newStatus = 'waiting';
  } else if (/(Thinking|Working|Running|Executing|Reading|Writing|Editing)/i.test(buf)) {
    newStatus = 'working';
  }

  if (newStatus !== session.status) {
    store.updateSession(sessionId, { status: newStatus });
    io.emit('sessions:updated', store.getSessions());
    io.emit('notification', {
      sessionId,
      type: newStatus === 'waiting' ? 'input_needed' : 'status_change',
      message: newStatus === 'waiting'
        ? `${session.name} needs your input!`
        : `${session.name} is ${newStatus}`,
      projectId: session.projectId,
    });
  }

  // Extract last meaningful line for summaries
  const lines = stripAnsi(buf).split('\n').filter(l => l.trim().length > 0);
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
  console.log(`  Network access: http://${getNetworkIP()}:${PORT}\n`);
});
