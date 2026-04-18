// Notification wiring: connects state change callbacks to Socket.IO broadcasts.

import { capitalize } from './utils.js';

/**
 * Wire up all state-change callbacks that broadcast notifications via Socket.IO.
 * @param {import('socket.io').Server} io
 * @param {Object} deps
 */
export function wireNotifications(io, { store, stateDetector, orchestrator, aiOrchestrator, waitingNotified }) {

  // Wire up StateDetector status change callback
  stateDetector.onStatusChange = (sessionId, newStatus, granularState, detail) => {
    const session = store.getSession(sessionId);
    if (!session) return;

    // Check auto-respond for Y/n prompts before setting waiting status
    if (newStatus === 'waiting') {
      const tail = stateDetector.getCleanTail(sessionId);
      if (/\(Y\/n\)\s*$/i.test(tail)) {
        const autoResponded = aiOrchestrator.checkAutoRespond(sessionId, tail);
        if (autoResponded) return;
      }
    }

    // Clear the waiting-notified flag only after the session has done real
    // work — specifically a genuine transition from waiting → working that
    // sustains long enough to look like a new turn. A brief `working` blip
    // (e.g. a stray spinner-like character in output) must not clear the
    // flag, or we'll re-notify for the same idle prompt over and over.
    const prevStatus = session.status;
    if (newStatus === 'working' && prevStatus === 'waiting') {
      // Defer the clear; only commit if still working after a short grace
      // period. If we bounce back to waiting/active quickly it was noise.
      const pending = (waitingNotified._pendingClears ||= new Map());
      const existing = pending.get(sessionId);
      if (existing) clearTimeout(existing);
      pending.set(sessionId, setTimeout(() => {
        pending.delete(sessionId);
        const s = store.getSession(sessionId);
        if (s && s.status === 'working') {
          waitingNotified.delete(sessionId);
        }
      }, 1500));
    } else if (newStatus !== 'working') {
      // Cancel any pending clear if we left the working state early
      const pending = waitingNotified._pendingClears;
      const existing = pending?.get(sessionId);
      if (existing) {
        clearTimeout(existing);
        pending.delete(sessionId);
      }
    }

    const sessionUpdate = { status: newStatus, granularState };
    if (detail) {
      sessionUpdate.stateDetail = detail;
    }
    store.updateSession(sessionId, sessionUpdate);
    io.emit('sessions:updated', store.getSessions());

    // Notify AI orchestrator of status changes
    const proj = store.getProject(session.projectId);
    aiOrchestrator.onStatusChange(sessionId, newStatus, {
      sessionName: session.name,
      projectName: proj?.name,
      projectId: session.projectId,
    });

    // Notify for waiting state (input needed) — only once per turn
    if (newStatus === 'waiting' && !waitingNotified.has(sessionId)) {
      waitingNotified.add(sessionId);
      const starterName = session.starter
        ? capitalize(session.starter)
        : session.name;
      const summary = aiOrchestrator.getSummaries()[sessionId];
      io.emit('notification', {
        sessionId,
        type: 'input_needed',
        message: `${starterName} needs your input!`,
        projectId: session.projectId,
        branch: session.branch,
        summary: summary?.summary,
      });
    }

    // Notify for completed state
    if (newStatus === 'completed') {
      const starterName = session.starter
        ? capitalize(session.starter)
        : session.name;
      const summary = aiOrchestrator.getSummaries()[sessionId];
      io.emit('notification', {
        sessionId,
        type: 'completed',
        message: `${starterName} finished!${summary?.summary ? ' ' + summary.summary : ''}`,
        projectId: session.projectId,
        branch: session.branch,
        summary: summary?.summary,
      });
    }

    // Feed resolved state into Orchestrator for priority ranking.
    // This runs after auto-respond check (so auto-responded prompts
    // don't flash CRITICAL) and after session status updates.
    orchestrator.onStateChange(sessionId, granularState, detail);
  };

  // Broadcast orchestrator state whenever priorities change
  orchestrator.onChange = () => {
    io.emit('orchestrator:update', orchestrator.getRanked());
  };

  // Broadcast AI summaries whenever they update
  aiOrchestrator.onChange = () => {
    io.emit('ai:summaries', aiOrchestrator.getSummaries());
  };

  // Broadcast diffs/branch status whenever they update
  aiOrchestrator.onDiffsChange = () => {
    io.emit('ai:diffs', aiOrchestrator.getDiffs());
    io.emit('ai:branches', aiOrchestrator.getBranchStatus());
  };

  // Broadcast conflicts whenever they change
  aiOrchestrator.onConflictsChange = () => {
    const conflicts = aiOrchestrator.getConflicts();
    io.emit('ai:conflicts', conflicts);

    // Emit notifications for new merge conflicts
    for (const [projectId, data] of Object.entries(conflicts)) {
      for (const mc of (data.mergeConflicts || [])) {
        const sA = store.getSession(mc.sessionA);
        const sB = store.getSession(mc.sessionB);
        if (!sA || !sB) continue;
        const nameA = sA.starter ? capitalize(sA.starter) : sA.name;
        const nameB = sB.starter ? capitalize(sB.starter) : sB.name;
        const files = mc.conflicts.map(c => c.file).join(', ');
        io.emit('notification', {
          type: 'conflict',
          message: `Merge conflict: ${nameA} vs ${nameB} in ${files}`,
          projectId,
          sessionId: mc.sessionA,
        });
      }
    }
  };

  // Broadcast PR status updates
  aiOrchestrator.onPRStatus = (status) => {
    io.emit('ai:pr-status', status);
  };

  // Broadcast coordination messages
  aiOrchestrator.onCoordination = (entry) => {
    io.emit('ai:coordination', entry);
  };

  // Broadcast auto-responses as they happen
  aiOrchestrator.onAutoRespond = (entry) => {
    const session = store.getSession(entry.sessionId);
    const starterName = session?.starter
      ? capitalize(session.starter)
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
}
