import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';
import { TerminalManager } from './terminal-manager.js';
import { Store } from './store.js';
import { Orchestrator } from './orchestrator.js';
import { AIOrchestrator } from './ai-orchestrator.js';
import { WorktreeManager } from './worktree-manager.js';
import { GitMonitor } from './git-monitor.js';
import { StateDetector } from './state-detector.js';
import { registerRoutes } from './routes.js';
import { registerSocketHandlers } from './socket-handlers.js';
import { wireNotifications } from './notification-wiring.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.argv.includes('--production');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 1e8,
});

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Image paste upload — saves base64 image to temp file, returns absolute path
app.post('/api/upload-image', async (req, res) => {
  try {
    const { data, mimeType } = req.body;
    if (!data || !mimeType) return res.status(400).json({ error: 'Missing data or mimeType' });
    const extMap = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/gif': '.gif', 'image/webp': '.webp', 'image/svg+xml': '.svg' };
    const ext = extMap[mimeType] || '.png';
    const dir = path.join(os.tmpdir(), 'cc-gui-images');
    await fs.promises.mkdir(dir, { recursive: true });
    const filename = `paste-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    const filePath = path.join(dir, filename);
    await fs.promises.writeFile(filePath, Buffer.from(data, 'base64'));
    res.json({ path: filePath });
  } catch (e) {
    console.error('[upload-image]', e);
    res.status(500).json({ error: 'Failed to save image' });
  }
});

// --- Dependency instantiation ---
const dataDir = path.join(__dirname, '..', 'data');
const store = new Store(path.join(dataDir, 'store.json'));
const terminalManager = new TerminalManager({ dataDir });
const stateDetector = new StateDetector();
const orchestrator = new Orchestrator({ stateDetector });
const gitMonitor = new GitMonitor();
const aiOrchestrator = new AIOrchestrator({ terminalManager, gitMonitor, store });
const worktreeManager = new WorktreeManager();
const sessionSummaries = {};
const waitingNotified = new Set();

// Clean up all per-session tracking state (used on delete and exit)
function cleanupSessionState(sessionId) {
  stateDetector.remove(sessionId);
  delete sessionSummaries[sessionId];
  waitingNotified.delete(sessionId);
  orchestrator.remove(sessionId);
  aiOrchestrator.remove(sessionId);
}

// Session summaries — extract last meaningful output line per session
function extractSummary(sessionId) {
  const clean = stateDetector.getCleanBuffer(sessionId);
  if (!clean) return;

  const lines = clean.split('\n').filter(l => l.trim().length > 0);
  const lastLine = lines.length > 0 ? lines[lines.length - 1].slice(0, 120) : '';
  if (lastLine && sessionSummaries[sessionId] !== lastLine) {
    sessionSummaries[sessionId] = lastLine;
    io.emit('sessions:summaries', sessionSummaries);
  }
}

// --- Wire notifications, routes, and socket handlers ---
wireNotifications(io, { store, stateDetector, orchestrator, aiOrchestrator, waitingNotified });
registerRoutes(app, { store, aiOrchestrator, worktreeManager, terminalManager, io, cleanupSessionState });
registerSocketHandlers(io, { store, terminalManager, stateDetector, orchestrator, aiOrchestrator, worktreeManager, sessionSummaries, waitingNotified, cleanupSessionState, extractSummary });

// On server startup, reset sessions that claim to be running but have no pty
for (const session of store.getSessions()) {
  if (session.status === 'active' || session.status === 'working' || session.status === 'waiting') {
    store.updateSession(session.id, { status: 'idle' });
  }
}

// Serve static files in production
if (isProduction) {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
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

// Graceful shutdown - kill all pty processes
function shutdown(signal) {
  console.log(`\n  ${signal} received. Cleaning up terminals...`);
  terminalManager.killAll();
  stateDetector.shutdown();
  aiOrchestrator.stopGitMonitor();
  if (aiOrchestrator._timer) {
    clearTimeout(aiOrchestrator._timer);
    aiOrchestrator._timer = null;
  }
  server.close(() => {
    console.log('  Server closed.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

const PORT = process.env.PORT || 3456;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  CC Gym server running on http://localhost:${PORT}`);
  console.log(`  Network access: http://${getNetworkIP()}:${PORT}`);
  console.log(`  AI Orchestrator: auto-respond ${aiOrchestrator.autoRespondEnabled ? 'ON' : 'OFF'}`);
  console.log(`  Git Monitor: active (polling every 15s)\n`);
  aiOrchestrator.startGitMonitor();
});
