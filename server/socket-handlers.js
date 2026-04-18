// Socket.IO event handlers for terminal management and AI orchestrator controls.

import fs from 'fs';
import { capitalize } from './utils.js';
import { classifyCommand } from './utils.js';

/**
 * Register all Socket.IO event handlers.
 * @param {import('socket.io').Server} io
 * @param {Object} deps
 */
export function registerSocketHandlers(io, { store, terminalManager, stateDetector, orchestrator, aiOrchestrator, worktreeManager, sessionSummaries, waitingNotified, cleanupSessionState, extractSummary }) {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.emit('projects:updated', store.getProjects());
    socket.emit('sessions:updated', store.getSessions());
    socket.emit('sessions:summaries', sessionSummaries);
    socket.emit('orchestrator:update', orchestrator.getRanked());
    socket.emit('ai:summaries', aiOrchestrator.getSummaries());
    socket.emit('ai:status', aiOrchestrator.getStatus());
    socket.emit('ai:diffs', aiOrchestrator.getDiffs());
    socket.emit('ai:branches', aiOrchestrator.getBranchStatus());
    socket.emit('ai:conflicts', aiOrchestrator.getConflicts());
    socket.emit('ai:pr-statuses', aiOrchestrator.getPRStatus());

    socket.on('terminal:attach', async (sessionId) => {
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
          const scrollback = await terminalManager.getScrollback(sessionId);
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
        let command = parts[0];
        let commandArgs = parts.slice(1);
        const commandMeta = classifyCommand(cmd);
        const isClaudeCmd = command === 'claude';

        store.updateSession(sessionId, {
          sessionType: commandMeta.sessionType,
          baseCommand: commandMeta.baseCommand,
          unsafeCommand: commandMeta.unsafeCommand,
        });

        if (isClaudeCmd && session.claudeSessionId) {
          commandArgs = ['--resume', session.claudeSessionId];
        } else if (isClaudeCmd && !session.claudeSessionId) {
          commandArgs.push('--session-id', sessionId);
          store.updateSession(sessionId, { claudeSessionId: sessionId });
        }

        try {
          const cwd = session.worktreePath || project.path;
          if (!fs.existsSync(cwd)) {
            socket.emit('terminal:error', {
              sessionId,
              error: `Project path does not exist: ${cwd}`,
            });
            return;
          }
          term = terminalManager.create(sessionId, command, commandArgs, {
            cwd,
            onData: (data) => {
              io.to(`session:${sessionId}`).emit('terminal:data', { sessionId, data });
              stateDetector.ingest(sessionId, data);
              extractSummary(sessionId);
              const sess = store.getSession(sessionId);
              const proj = sess ? store.getProject(sess.projectId) : null;
              const meta = {
                sessionName: sess?.name,
                projectName: proj?.name,
                projectId: sess?.projectId,
              };
              aiOrchestrator.ingest(sessionId, data, meta);
            },
            onExit: (code) => {
              const sess = store.getSession(sessionId);
              if (!sess) return;
              const exitStatus = code === 0 ? 'completed' : 'exited';
              store.updateSession(sessionId, { status: exitStatus, exitCode: code });
              io.to(`session:${sessionId}`).emit('terminal:exit', { sessionId, code });
              io.emit('sessions:updated', store.getSessions());

              cleanupSessionState(sessionId);

              const meta = {
                exitCode: code,
                sessionName: sess.name,
                projectName: store.getProject(sess.projectId)?.name,
                projectId: sess.projectId,
              };
              orchestrator.onExitStatus(sessionId, exitStatus, meta);
              aiOrchestrator.onStatusChange(sessionId, exitStatus, meta);

              if (exitStatus === 'completed') {
                const starterName = sess.starter
                  ? capitalize(sess.starter)
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

          const storedClaudeId = store.getSession(sessionId)?.claudeSessionId;
          if (storedClaudeId) {
            stateDetector.watchTranscript(sessionId, cwd, storedClaudeId);
          }
        } catch (err) {
          console.error(`Failed to spawn terminal for session ${sessionId}:`, err.message);
          socket.emit('terminal:error', { sessionId, error: `Failed to start terminal: ${err.message}` });
          return;
        }

        store.updateSession(sessionId, { status: 'active' });
        io.emit('sessions:updated', store.getSessions());
      }

      socket.join(`session:${sessionId}`);

      const scrollback = await terminalManager.getScrollback(sessionId);
      if (scrollback) {
        socket.emit('terminal:data', { sessionId, data: scrollback });
      }

      socket.emit('terminal:attached', { sessionId });
    });

    socket.on('terminal:detach', (sessionId) => {
      socket.leave(`session:${sessionId}`);
    });

    socket.on('terminal:restart', async (sessionId) => {
      const session = store.getSession(sessionId);
      if (!session) {
        socket.emit('terminal:error', { sessionId, error: 'Session not found' });
        return;
      }

      // Kill existing PTY if running
      const existing = terminalManager.get(sessionId);
      if (existing) {
        try { existing.pty.kill(); } catch (_) {}
        terminalManager.terminals.delete(sessionId);
      }

      // Clear cached scrollback so the terminal starts fresh
      terminalManager.deadScrollback.delete(sessionId);
      await terminalManager._deleteScrollbackFromDisk(sessionId);

      // Reset session status so terminal:attach will spawn a new process
      store.updateSession(sessionId, { status: 'idle', exitCode: undefined });
      io.emit('sessions:updated', store.getSessions());

      // Notify all clients in this session room to clear their terminals
      io.to(`session:${sessionId}`).emit('terminal:restarted', { sessionId });
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

    socket.on('ai:toggle-coordination', () => {
      aiOrchestrator.coordinationEnabled = !aiOrchestrator.coordinationEnabled;
      io.emit('ai:status', aiOrchestrator.getStatus());
      console.log(`[AI Orchestrator] Coordination ${aiOrchestrator.coordinationEnabled ? 'enabled' : 'disabled'}`);
    });

    socket.on('ai:create-pr', async ({ sessionId }) => {
      if (!sessionId) return;
      const result = await aiOrchestrator.createPR(sessionId);
      if (result.success) {
        io.emit('sessions:updated', store.getSessions());
      }
    });

    socket.on('ai:create-all-prs', async ({ projectId }) => {
      if (!projectId) return;
      const result = await aiOrchestrator.createAllPRs(projectId);
      if (result.success) {
        io.emit('sessions:updated', store.getSessions());
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
