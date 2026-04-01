// ConflictDetector: polls git state, tracks diffs/branches, and detects file overlaps + merge conflicts.

import './types.js';

const GIT_POLL_INTERVAL_MS = 15000;

export class ConflictDetector {
  constructor({ gitMonitor, store }) {
    this.gitMonitor = gitMonitor;
    this.store = store;

    this.diffs = {};               // sessionId -> { files, summary, rawDiff, changedFiles, lastCheckedAt }
    this.branchStatus = {};        // sessionId -> { commitCount, commits, base, lastCheckedAt }
    this.conflicts = {};           // projectId -> { overlaps, mergeConflicts, sessionFiles, lastCheckedAt }
    this.fileLocks = {};           // projectId -> { filePath -> sessionId }
    this._gitPollTimer = null;
    this._gitPollInFlight = false;
    this._gitPollQueued = false;

    this.onDiffsChange = null;
    this.onConflictsChange = null;

    // Called by facade when new conflicts are detected and coordination is enabled
    this.onNewConflicts = null;    // (projectId, projectSessions, overlaps, mergeConflicts) => void
  }

  startPolling() {
    if (!this.gitMonitor || !this.store) return;
    console.log('[AI Orchestrator] Git monitor started (polling every 15s)');
    this._gitPoll();
    this._gitPollTimer = setInterval(() => this._gitPoll(), GIT_POLL_INTERVAL_MS);
  }

  stopPolling() {
    if (this._gitPollTimer) {
      clearInterval(this._gitPollTimer);
      this._gitPollTimer = null;
    }
  }

  getDiffs() {
    const clean = {};
    for (const [id, diff] of Object.entries(this.diffs)) {
      clean[id] = {
        files: diff.files,
        changedFiles: diff.changedFiles,
        summary: diff.summary,
        lastCheckedAt: diff.lastCheckedAt,
      };
    }
    return clean;
  }

  /** Returns full diff detail including rawDiff for a single session. */
  getDiffDetail(sessionId) {
    return this.diffs[sessionId] || null;
  }

  getBranchStatus() {
    return { ...this.branchStatus };
  }

  getConflicts() {
    const clean = {};
    for (const [projectId, data] of Object.entries(this.conflicts)) {
      clean[projectId] = {
        overlaps: data.overlaps,
        mergeConflicts: data.mergeConflicts,
        lastCheckedAt: data.lastCheckedAt,
      };
    }
    return clean;
  }

  remove(sessionId) {
    delete this.diffs[sessionId];
    delete this.branchStatus[sessionId];

    // Clean file locks
    for (const projectId of Object.keys(this.fileLocks)) {
      for (const [file, lockedBy] of Object.entries(this.fileLocks[projectId])) {
        if (lockedBy === sessionId) delete this.fileLocks[projectId][file];
      }
    }
  }

  // --- Internal ---

  async _gitPoll() {
    if (!this.store || !this.gitMonitor) return;

    if (this._gitPollInFlight) {
      this._gitPollQueued = true;
      return;
    }
    this._gitPollInFlight = true;
    try {
      await this._gitPollInner();
    } finally {
      this._gitPollInFlight = false;
      if (this._gitPollQueued) {
        this._gitPollQueued = false;
        this._gitPoll();
      }
    }
  }

  async _gitPollInner() {
    if (!this.store || !this.gitMonitor) return;

    const sessions = this.store.getSessions().filter(s => s.worktreePath && s.branch);
    if (sessions.length === 0) return;

    // Update diffs and branch status for each session
    const diffPromises = sessions.map(async (session) => {
      try {
        const [diff, branch, changedFiles] = await Promise.all([
          this.gitMonitor.getDiff(session.worktreePath),
          this.gitMonitor.getBranchStatus(session.worktreePath),
          this.gitMonitor.getChangedFiles(session.worktreePath),
        ]);

        this.diffs[session.id] = {
          ...diff,
          changedFiles,
          lastCheckedAt: Date.now(),
        };
        this.branchStatus[session.id] = {
          ...branch,
          lastCheckedAt: Date.now(),
        };
      } catch (err) {
        // Worktree might be gone
      }
    });

    await Promise.all(diffPromises);
    this.onDiffsChange?.();

    // Check conflicts per project (only projects with 2+ worktree sessions)
    const projectGroups = {};
    for (const session of sessions) {
      if (!projectGroups[session.projectId]) projectGroups[session.projectId] = [];
      projectGroups[session.projectId].push(session);
    }

    let conflictsChanged = false;
    for (const [projectId, projectSessions] of Object.entries(projectGroups)) {
      if (projectSessions.length < 2) {
        if (this.conflicts[projectId]) {
          delete this.conflicts[projectId];
          conflictsChanged = true;
        }
        continue;
      }

      const project = this.store.getProject(projectId);
      if (!project) continue;

      try {
        const { overlaps, sessionFiles } = await this.gitMonitor.getFileOverlaps(
          project.path,
          projectSessions
        );

        // Check merge conflicts for overlapping pairs
        const mergeConflicts = [];
        const checkedPairs = new Set();

        for (const overlap of overlaps) {
          for (let i = 0; i < overlap.sessionIds.length; i++) {
            for (let j = i + 1; j < overlap.sessionIds.length; j++) {
              const pairKey = [overlap.sessionIds[i], overlap.sessionIds[j]].sort().join(':');
              if (checkedPairs.has(pairKey)) continue;
              checkedPairs.add(pairKey);

              const sA = projectSessions.find(s => s.id === overlap.sessionIds[i]);
              const sB = projectSessions.find(s => s.id === overlap.sessionIds[j]);
              if (!sA || !sB) continue;

              const result = await this.gitMonitor.checkMergeability(
                project.path, sA.branch, sB.branch
              );

              if (!result.mergeable) {
                mergeConflicts.push({
                  sessionA: sA.id,
                  sessionB: sB.id,
                  conflicts: result.conflicts,
                });
              }
            }
          }
        }

        // Update file locks (first writer wins)
        if (!this.fileLocks[projectId]) this.fileLocks[projectId] = {};
        for (const [sessionId, files] of Object.entries(sessionFiles)) {
          for (const file of files) {
            if (!this.fileLocks[projectId][file]) {
              this.fileLocks[projectId][file] = sessionId;
            }
          }
        }

        const prev = this.conflicts[projectId];
        const newConflicts = {
          overlaps,
          mergeConflicts,
          sessionFiles,
          lastCheckedAt: Date.now(),
        };

        // Detect new conflicts for notifications
        const prevConflictCount = prev?.mergeConflicts?.length || 0;
        if (mergeConflicts.length > prevConflictCount) {
          conflictsChanged = true;
          // Notify facade about new conflicts (for coordination)
          this.onNewConflicts?.(projectId, projectSessions, overlaps, mergeConflicts);
        }

        if (overlaps.length !== (prev?.overlaps?.length || 0) ||
            mergeConflicts.length !== prevConflictCount) {
          conflictsChanged = true;
        }

        this.conflicts[projectId] = newConflicts;
      } catch (err) {
        console.warn(`[AI Orchestrator] Conflict check failed for project ${projectId}:`, err.message);
      }
    }

    if (conflictsChanged) {
      this.onConflictsChange?.();
    }
  }
}
