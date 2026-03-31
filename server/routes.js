// Express route handlers for the CC Gym API.

import path from 'path';
import os from 'os';
import fs from 'fs';
import { execFile } from 'child_process';

// Discovery cache state
let discoveryCache = null;
let discoveryCacheTime = 0;
const CACHE_TTL = 30000;

function runCommand(cmd, args, timeout = 10000) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout, maxBuffer: 1024 * 1024, env: { ...process.env, PATH: `${os.homedir()}/.local/bin:${process.env.PATH}` } }, (err, stdout) => {
      resolve(stdout || '');
    });
  });
}

/**
 * Register all REST API routes on the Express app.
 * @param {import('express').Express} app
 * @param {Object} deps
 */
export function registerRoutes(app, { store, aiOrchestrator, worktreeManager, terminalManager, io, cleanupSessionState }) {

  // --- Projects ---

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
      if (session.worktreePath) {
        await worktreeManager.remove(project.path, session.worktreePath);
        await worktreeManager.removeBranch(project.path, session.branch);
      }
      cleanupSessionState(session.id);
      store.deleteSession(session.id);
    }

    store.deleteProject(req.params.id);
    io.emit('projects:updated', store.getProjects());
    io.emit('sessions:updated', store.getSessions());
    res.json({ ok: true });
  });

  // --- Sessions ---

  app.get('/api/sessions', (req, res) => {
    res.json(store.getSessions());
  });

  app.post('/api/sessions', async (req, res) => {
    const { projectId, name, command } = req.body;
    const project = store.getProject(projectId);
    if (!project) return res.status(404).json({ error: 'project not found' });

    const session = store.createSession(projectId, name || 'New Session', command);

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

    if (session?.worktreePath && project) {
      await worktreeManager.remove(project.path, session.worktreePath);
      await worktreeManager.removeBranch(project.path, session.branch);
    }

    store.deleteSession(req.params.id);
    cleanupSessionState(req.params.id);
    io.emit('sessions:updated', store.getSessions());
    io.emit('projects:updated', store.getProjects());
    res.json({ ok: true });
  });

  app.patch('/api/sessions/:id', (req, res) => {
    const allowedFields = ['name', 'command'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    const session = store.updateSession(req.params.id, updates);
    if (!session) return res.status(404).json({ error: 'not found' });
    io.emit('sessions:updated', store.getSessions());
    res.json(session);
  });

  // --- Git & Orchestrator API ---

  app.get('/api/sessions/:id/diff', async (req, res) => {
    const detail = aiOrchestrator.getDiffDetail(req.params.id);
    if (!detail) return res.json({ files: [], rawDiff: '', summary: 'No data yet' });
    res.json(detail);
  });

  app.get('/api/sessions/:id/branch', (req, res) => {
    const status = aiOrchestrator.getBranchStatus();
    res.json(status[req.params.id] || { commitCount: 0, commits: [], base: 'main' });
  });

  app.get('/api/projects/:id/conflicts', (req, res) => {
    const conflicts = aiOrchestrator.getConflicts();
    res.json(conflicts[req.params.id] || { overlaps: [], mergeConflicts: [] });
  });

  app.post('/api/sessions/:id/create-pr', async (req, res) => {
    const result = await aiOrchestrator.createPR(req.params.id);
    if (result.success) {
      io.emit('sessions:updated', store.getSessions());
    }
    res.json(result);
  });

  app.post('/api/projects/:id/create-prs', async (req, res) => {
    const result = await aiOrchestrator.createAllPRs(req.params.id);
    if (result.success) {
      io.emit('sessions:updated', store.getSessions());
    }
    res.json(result);
  });

  app.post('/api/sessions/:id/coordinate', (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });
    const sent = aiOrchestrator.sendCoordinationMessage(req.params.id, message);
    res.json({ sent });
  });

  app.get('/api/orchestrator/status', (req, res) => {
    res.json({
      ...aiOrchestrator.getStatus(),
      conflicts: aiOrchestrator.getConflicts(),
      prStatus: aiOrchestrator.getPRStatus(),
    });
  });

  // --- Discovery API ---

  app.get('/api/discover', async (req, res) => {
    const now = Date.now();
    if (discoveryCache && now - discoveryCacheTime < CACHE_TTL) {
      return res.json(discoveryCache);
    }

    const home = os.homedir();
    const existingPaths = new Set(store.getProjects().map(p => p.path));

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

    let github = [];
    try {
      const repos = JSON.parse(ghOutput || '[]');
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

    const githubNames = new Set(github.map(g => g.name.toLowerCase()));
    const localOnly = local.filter(l => !githubNames.has(l.name.toLowerCase()));

    const result = { local: localOnly, github };
    discoveryCache = result;
    discoveryCacheTime = now;
    res.json(result);
  });
}
