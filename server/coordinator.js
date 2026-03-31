// Coordinator: queues and delivers coordination messages between agents.

import './types.js';

export class Coordinator {
  constructor({ terminalManager, store }) {
    this.terminalManager = terminalManager;
    this.store = store;
    this.coordinationEnabled = false;
    this.pendingMessages = {};     // sessionId -> string[]
    this.onCoordination = null;    // callback({ sessionId, message, type, timestamp })
  }

  /**
   * Called when a session's status changes — delivers pending messages when idle.
   * @param {string} sessionId
   * @param {string} newStatus
   */
  onStatusChange(sessionId, newStatus) {
    if (newStatus === 'waiting' && this.coordinationEnabled) {
      this._deliverPendingMessages(sessionId);
    }
  }

  /**
   * Handle newly detected merge conflicts by queueing warnings.
   * @param {string} projectId
   * @param {Session[]} projectSessions
   * @param {Array} overlaps
   * @param {Array} mergeConflicts
   */
  handleNewConflicts(projectId, projectSessions, overlaps, mergeConflicts) {
    for (const conflict of mergeConflicts) {
      const sessionA = projectSessions.find(s => s.id === conflict.sessionA);
      const sessionB = projectSessions.find(s => s.id === conflict.sessionB);
      if (!sessionA || !sessionB) continue;

      const conflictFiles = conflict.conflicts.map(c => c.file).join(', ');
      const nameA = sessionA.starter || sessionA.name;
      const nameB = sessionB.starter || sessionB.name;

      this._queueCoordinationMessage(conflict.sessionB,
        `[COORDINATOR] Warning: Your changes conflict with ${nameA}'s branch in: ${conflictFiles}. Please avoid further edits to these files or coordinate to resolve the conflict.`
      );
      this._queueCoordinationMessage(conflict.sessionA,
        `[COORDINATOR] Warning: Your changes conflict with ${nameB}'s branch in: ${conflictFiles}. Please avoid further edits to these files or coordinate to resolve the conflict.`
      );
    }
  }

  /**
   * Send an immediate coordination message (from user/API).
   * @param {string} sessionId
   * @param {string} message
   * @returns {boolean}
   */
  sendCoordinationMessage(sessionId, message) {
    const session = this.store?.getSession(sessionId);
    if (!session) return false;

    if (session.status === 'waiting') {
      try {
        this.terminalManager.write(sessionId, message + '\n');
        this.onCoordination?.({ sessionId, message, type: 'user_instruction', timestamp: Date.now() });
        return true;
      } catch {
        return false;
      }
    } else {
      this._queueCoordinationMessage(sessionId, message);
      return true;
    }
  }

  remove(sessionId) {
    delete this.pendingMessages[sessionId];
  }

  // --- Internal ---

  _queueCoordinationMessage(sessionId, message) {
    if (!this.pendingMessages[sessionId]) {
      this.pendingMessages[sessionId] = [];
    }
    if (this.pendingMessages[sessionId].includes(message)) return;
    this.pendingMessages[sessionId].push(message);
  }

  _deliverPendingMessages(sessionId) {
    const messages = this.pendingMessages[sessionId];
    if (!messages || messages.length === 0) return;

    for (const message of messages) {
      try {
        this.terminalManager.write(sessionId, message + '\n');
        this.onCoordination?.({
          sessionId,
          message,
          type: 'conflict_warning',
          timestamp: Date.now(),
        });
      } catch {
        // Session might be gone
      }
    }
    delete this.pendingMessages[sessionId];
  }
}
