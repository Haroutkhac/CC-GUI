// AI Orchestrator: always-on manager that summarizes sessions, auto-responds,
// monitors git diffs, detects conflicts, coordinates agents, and creates PRs.

import './types.js';
import { execFile } from 'child_process';
import { stripAnsi, capitalize } from './utils.js';

const SUMMARY_DEBOUNCE_MS = 2000;
const SUMMARY_COOLDOWN_MS = 20000;
const MAX_OUTPUT_CHARS = 3000;
const CALL_TIMEOUT_MS = 60000;
const RETRY_DELAY_MS = 3000;
const AUTO_RESPOND_COOLDOWN_MS = 3000;
const GIT_POLL_INTERVAL_MS = 15000;  // Poll git state every 15s

export class AIOrchestrator {
  constructor({ terminalManager, gitMonitor, store, safeModeConfig = {} }) {
    this.terminalManager = terminalManager;
    this.gitMonitor = gitMonitor;
    this.store = store;
    this.safeModeConfig = safeModeConfig;

    // --- Summaries ---
    this.summaries = {};           // sessionId -> { summary, action, updatedAt }
    this.buffers = {};             // sessionId -> cleaned output tail
    this.sessionMeta = {};         // sessionId -> { sessionName, projectName, status }
    this.lastSummarizedAt = {};
    this.lastAutoRespondAt = {};
    this.pendingSessions = new Set();
    this._timer = null;
    this._processing = false;
    this.onChange = null;

    // --- Auto-respond ---
    this.autoRespondEnabled = false;
    this.autoResponses = [];
    this.onAutoRespond = null;

    // --- Git monitoring ---
    this.diffs = {};               // sessionId -> { files, summary, rawDiff, lastCheckedAt }
    this.branchStatus = {};        // sessionId -> { commitCount, commits, base, lastCheckedAt }
    this.conflicts = {};           // projectId -> { overlaps, mergeConflicts, lastCheckedAt }
    this.fileLocks = {};           // projectId -> { filePath -> sessionId } (first writer wins)
    this._gitPollTimer = null;
    this.onConflictsChange = null;
    this.onDiffsChange = null;

    // --- Coordination ---
    this.coordinationEnabled = false;  // opt-in: send instructions to agents
    this.pendingMessages = {};     // sessionId -> string[] (queued messages for next idle prompt)
    this.onCoordination = null;    // callback({ sessionId, message, type })

    // --- PR creation ---
    this.prStatus = {};            // sessionId -> { status, prUrl, error, updatedAt }
    this.onPRStatus = null;

    // --- Git poll dedup ---
    this._gitPollInFlight = false;
    this._gitPollQueued = false;
  }

  // Start the git polling loop
  startGitMonitor() {
    if (!this.gitMonitor || !this.store) return;
    console.log('[AI Orchestrator] Git monitor started (polling every 15s)');
    this._gitPoll(); // run immediately
    this._gitPollTimer = setInterval(() => this._gitPoll(), GIT_POLL_INTERVAL_MS);
  }

  stopGitMonitor() {
    if (this._gitPollTimer) {
      clearInterval(this._gitPollTimer);
      this._gitPollTimer = null;
    }
  }

  // ========== TERMINAL INGESTION ==========

  /**
   * @param {string} sessionId
   * @param {string} rawData
   * @param {SessionMeta} meta
   */
  ingest(sessionId, rawData, meta) {
    const clean = stripAnsi(rawData);
    this.buffers[sessionId] = ((this.buffers[sessionId] || '') + clean).slice(-MAX_OUTPUT_CHARS * 2);
    if (meta) {
      this.sessionMeta[sessionId] = { ...this.sessionMeta[sessionId], ...meta };
    }
  }

  /**
   * @param {string} sessionId
   * @param {string} newStatus
   * @param {SessionMeta} meta
   */
  onStatusChange(sessionId, newStatus, meta) {
    if (meta) {
      this.sessionMeta[sessionId] = { ...this.sessionMeta[sessionId], ...meta };
    }
    if (this.sessionMeta[sessionId]) {
      this.sessionMeta[sessionId].status = newStatus;
    }

    // Summarize on meaningful state transitions — bypass cooldown for these
    // (these are the moments the user cares about: agent finished or needs input)
    if (['waiting', 'exited'].includes(newStatus)) {
      this.pendingSessions.add(sessionId);
      this._scheduleBatch();

      // Trigger immediate git poll so diffs are fresh when summary arrives
      if (this.gitMonitor && this.store) {
        this._gitPoll();
      }
    }

    // Deliver queued coordination messages when session reaches idle prompt
    if (newStatus === 'waiting' && this.coordinationEnabled) {
      this._deliverPendingMessages(sessionId);
    }
  }

  // ========== AUTO-RESPOND ==========

  /**
   * @param {string} sessionId
   * @param {string} cleanTail
   * @returns {boolean}
   */
  checkAutoRespond(sessionId, cleanTail) {
    if (!this.autoRespondEnabled) return false;

    const now = Date.now();
    if (this.lastAutoRespondAt[sessionId] && now - this.lastAutoRespondAt[sessionId] < AUTO_RESPOND_COOLDOWN_MS) {
      return false;
    }

    const ynMatch = cleanTail.match(/(.{0,300})\(Y\/n\)\s*$/i);
    if (!ynMatch) return false;

    const blockedReason = this.getAutoRespondBlockReason(sessionId);
    if (blockedReason) {
      console.log(`[AI Orchestrator] Auto-respond blocked for ${sessionId}: ${blockedReason}`);
      return false;
    }

    const promptText = ynMatch[1].trim();

    const dangerous = /push\s*--force|--force-push|delete\s+branch|drop\s+table|rm\s+-rf|reset\s+--hard|git\s+clean|--no-verify|force.*delete/i;
    if (dangerous.test(promptText)) return false;

    try {
      this.terminalManager.write(sessionId, 'Y\n');
    } catch (e) {
      return false;
    }

    this.lastAutoRespondAt[sessionId] = now;

    const entry = {
      sessionId,
      prompt: promptText.slice(-150),
      response: 'Y',
      timestamp: now,
    };
    this.autoResponses.push(entry);
    if (this.autoResponses.length > 200) {
      this.autoResponses = this.autoResponses.slice(-100);
    }

    this.onAutoRespond?.(entry);
    return true;
  }

  // ========== GIT MONITORING ==========

  async _gitPoll() {
    if (!this.store || !this.gitMonitor) return;

    // Dedup: if a poll is already in flight, queue one follow-up at most
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
          // Queue coordination messages for sessions with new conflicts
          if (this.coordinationEnabled) {
            this._handleNewConflicts(projectId, projectSessions, overlaps, mergeConflicts);
          }
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

  // ========== COORDINATION ==========

  _handleNewConflicts(projectId, projectSessions, overlaps, mergeConflicts) {
    for (const conflict of mergeConflicts) {
      const sessionA = projectSessions.find(s => s.id === conflict.sessionA);
      const sessionB = projectSessions.find(s => s.id === conflict.sessionB);
      if (!sessionA || !sessionB) continue;

      const conflictFiles = conflict.conflicts.map(c => c.file).join(', ');
      const nameA = sessionA.starter || sessionA.name;
      const nameB = sessionB.starter || sessionB.name;

      // Warn both sessions about the conflict
      this._queueCoordinationMessage(conflict.sessionB,
        `[COORDINATOR] Warning: Your changes conflict with ${nameA}'s branch in: ${conflictFiles}. Please avoid further edits to these files or coordinate to resolve the conflict.`
      );
      this._queueCoordinationMessage(conflict.sessionA,
        `[COORDINATOR] Warning: Your changes conflict with ${nameB}'s branch in: ${conflictFiles}. Please avoid further edits to these files or coordinate to resolve the conflict.`
      );
    }
  }

  _queueCoordinationMessage(sessionId, message) {
    if (!this.pendingMessages[sessionId]) {
      this.pendingMessages[sessionId] = [];
    }
    // Don't duplicate
    if (this.pendingMessages[sessionId].includes(message)) return;
    this.pendingMessages[sessionId].push(message);
  }

  _deliverPendingMessages(sessionId) {
    const messages = this.pendingMessages[sessionId];
    if (!messages || messages.length === 0) return;

    const blockedReason = this.getCoordinationBlockReason(sessionId);
    if (blockedReason) {
      console.log(`[AI Orchestrator] Coordination delivery blocked for ${sessionId}: ${blockedReason}`);
      return;
    }

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

  // Send an immediate coordination message (from user/API)
  sendCoordinationMessage(sessionId, message) {
    const session = this.store?.getSession(sessionId);
    if (!session) return false;

    const blockedReason = this.getCoordinationBlockReason(sessionId);
    if (blockedReason) {
      console.log(`[AI Orchestrator] Coordination blocked for ${sessionId}: ${blockedReason}`);
      return false;
    }

    if (session.status === 'waiting') {
      try {
        this.terminalManager.write(sessionId, message + '\n');
        this.onCoordination?.({ sessionId, message, type: 'user_instruction', timestamp: Date.now() });
        return true;
      } catch {
        return false;
      }
    } else {
      // Queue for delivery when session next reaches waiting
      this._queueCoordinationMessage(sessionId, message);
      return true;
    }
  }

  // ========== PR CREATION ==========

  /**
   * @param {string} sessionId
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async createPR(sessionId) {
    const session = this.store?.getSession(sessionId);
    if (!session || !session.worktreePath || !session.branch) {
      return { success: false, error: 'Session has no git worktree' };
    }

    const project = this.store.getProject(session.projectId);
    if (!project) {
      return { success: false, error: 'Project not found' };
    }

    this._updatePRStatus(sessionId, 'checking', null, null);

    // 1. Check for uncommitted changes
    const working = await this.gitMonitor.getWorkingChanges(session.worktreePath);
    if (working.length > 0) {
      this._updatePRStatus(sessionId, 'error', null, `${working.length} uncommitted changes — commit or stash first`);
      return { success: false, error: `${working.length} uncommitted changes` };
    }

    // 2. Check there are actually commits to PR
    const branchInfo = await this.gitMonitor.getBranchStatus(session.worktreePath);
    if (branchInfo.commitCount === 0) {
      this._updatePRStatus(sessionId, 'error', null, 'No commits on this branch');
      return { success: false, error: 'No commits on this branch' };
    }

    // 3. Rebase onto latest base
    this._updatePRStatus(sessionId, 'rebasing', null, null);
    const rebase = await this.gitMonitor.rebase(session.worktreePath, project.path);
    if (!rebase.success) {
      this._updatePRStatus(sessionId, 'error', null, `Rebase failed: ${rebase.error}`);
      return { success: false, error: `Rebase failed: ${rebase.error}` };
    }

    // 4. Generate PR title/body from diff
    this._updatePRStatus(sessionId, 'generating', null, null);
    const diff = await this.gitMonitor.getDiff(session.worktreePath);
    const { title, body } = await this._generatePRContent(session, project, diff, branchInfo);

    // 5. Push
    this._updatePRStatus(sessionId, 'pushing', null, null);
    const push = await this.gitMonitor.push(session.worktreePath, session.branch);
    if (!push.success) {
      this._updatePRStatus(sessionId, 'error', null, `Push failed: ${push.error}`);
      return { success: false, error: `Push failed: ${push.error}` };
    }

    // 6. Create PR
    this._updatePRStatus(sessionId, 'creating', null, null);
    const pr = await this.gitMonitor.createPR(
      session.worktreePath,
      session.branch,
      branchInfo.base,
      title,
      body,
    );

    if (pr.success) {
      this._updatePRStatus(sessionId, 'created', pr.url, null);
      this.store.updateSession(sessionId, { prUrl: pr.url });
      return { success: true, url: pr.url };
    } else {
      this._updatePRStatus(sessionId, 'error', null, pr.error);
      return { success: false, error: pr.error };
    }
  }

  // Create PRs for all sessions in a project, in conflict-free order
  async createAllPRs(projectId) {
    const project = this.store?.getProject(projectId);
    if (!project) return { success: false, error: 'Project not found' };

    const sessions = this.store.getSessionsByProject(projectId)
      .filter(s => s.worktreePath && s.branch);

    if (sessions.length === 0) {
      return { success: false, error: 'No sessions with git worktrees' };
    }

    // Sort: sessions with fewer file changes first (less likely to conflict)
    const sorted = [...sessions].sort((a, b) => {
      const filesA = this.diffs[a.id]?.changedFiles?.length || 0;
      const filesB = this.diffs[b.id]?.changedFiles?.length || 0;
      return filesA - filesB;
    });

    const results = [];
    for (const session of sorted) {
      const result = await this.createPR(session.id);
      results.push({ sessionId: session.id, ...result });
    }

    return { success: true, results };
  }

  async _generatePRContent(session, project, diff, branchInfo) {
    const starterName = session.starter
      ? capitalize(session.starter)
      : session.name;

    // Use AI summary if available, otherwise generate from diff
    const existingSummary = this.summaries[session.id]?.summary;
    const diffSummary = diff.summary || 'No changes';
    const commitMessages = branchInfo.commits.map(c => c.message).join('\n');

    try {
      const prompt = `Generate a GitHub PR title and body for these changes.

Agent: ${starterName} (session in project "${project.name}")
${existingSummary ? `Agent summary: ${existingSummary}` : ''}

Commits:
${commitMessages}

Diff stats:
${diffSummary}

Diff (truncated):
${(diff.rawDiff || '').slice(0, 8000)}

Return JSON: {"title":"<under 70 chars, descriptive>","body":"<markdown with ## Summary (2-3 bullets) and ## Changes sections>"}
Respond ONLY with JSON:`;

      const raw = await this._callClaude(prompt);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title || `${starterName}: ${existingSummary || 'Changes'}`,
          body: (parsed.body || '') + '\n\n---\n🤖 Generated by CC Gym AI Orchestrator',
        };
      }
    } catch (err) {
      console.warn('[AI Orchestrator] PR content generation failed:', err.message);
    }

    // Fallback
    return {
      title: `${starterName}: ${existingSummary || branchInfo.commits[0]?.message || 'Changes'}`.slice(0, 70),
      body: `## Summary\n\n${existingSummary || 'Automated PR'}\n\n## Changes\n\n${diffSummary}\n\n---\n🤖 Generated by CC Gym AI Orchestrator`,
    };
  }

  _updatePRStatus(sessionId, status, prUrl, error) {
    this.prStatus[sessionId] = { status, prUrl, error, updatedAt: Date.now() };
    this.onPRStatus?.({ sessionId, ...this.prStatus[sessionId] });
  }

  // ========== SUMMARY SCHEDULING ==========

  refreshAll() {
    for (const sessionId of Object.keys(this.buffers)) {
      if (this.buffers[sessionId].length > 100) {
        this.pendingSessions.add(sessionId);
      }
    }
    if (this.pendingSessions.size > 0) {
      for (const id of this.pendingSessions) {
        delete this.lastSummarizedAt[id];
      }
      this._scheduleBatch();
    }
  }

  _scheduleBatch() {
    if (this._timer) clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this._timer = null;
      this._processBatch();
    }, SUMMARY_DEBOUNCE_MS);
  }

  async _processBatch() {
    if (this._processing || this.pendingSessions.size === 0) return;
    this._processing = true;

    const sessionIds = [...this.pendingSessions];
    this.pendingSessions.clear();

    const digests = sessionIds
      .filter(id => this.buffers[id] && this.buffers[id].length > 50)
      .map(id => {
        const meta = this.sessionMeta[id] || {};
        const output = (this.buffers[id] || '').slice(-MAX_OUTPUT_CHARS);

        // Include diff info if available
        const diffInfo = this.diffs[id];
        let diffContext = '';
        if (diffInfo?.changedFiles?.length > 0) {
          diffContext = `\nFiles modified on branch: ${diffInfo.changedFiles.join(', ')}`;
          if (diffInfo.files?.length > 0) {
            diffContext += '\nDiff stats:\n' + diffInfo.files.map(f =>
              `  ${f.path} (+${f.insertions} -${f.deletions})`
            ).join('\n');
          }
        }

        return {
          id,
          name: meta.sessionName || 'Unknown',
          project: meta.projectName || 'Unknown',
          status: meta.status || 'unknown',
          output,
          diffContext,
        };
      });

    if (digests.length === 0) {
      this._processing = false;
      return;
    }

    const prompt = this._buildPrompt(digests);
    let results = [];
    let attempts = 0;

    while (attempts < 2) {
      attempts++;
      try {
        const raw = await this._callClaude(prompt);
        results = this._parseResponse(raw, sessionIds);
        break;
      } catch (err) {
        console.warn(`[AI Orchestrator] Summary attempt ${attempts} failed:`, err.message);
        if (attempts < 2) {
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        }
      }
    }

    for (const result of results) {
      this.summaries[result.sessionId] = {
        summary: result.summary,
        action: result.action,
        updatedAt: Date.now(),
      };
      this.lastSummarizedAt[result.sessionId] = Date.now();
    }

    if (results.length > 0) {
      this.onChange?.();
    }

    this._processing = false;
    if (this.pendingSessions.size > 0) {
      this._scheduleBatch();
    }
  }

  _buildPrompt(digests) {
    const parts = digests.map(d => {
      let section = `### "${d.name}" (project: ${d.project}) [status: ${d.status}] [id:${d.id}]`;
      if (d.diffContext) section += '\n' + d.diffContext;
      section += `\n\`\`\`\n${d.output.slice(-2000)}\n\`\`\``;
      return section;
    });

    return `You monitor Claude Code agent sessions for a developer. Analyze each session's recent terminal output and summarize what the agent worked on.

For each session return JSON:
[{"sessionId":"<id>","summary":"<what the agent did — mention specific files edited, functions added/changed, bugs fixed, features built>","action":"<what user should do next, or 'None' if nothing needed>"}]

Rules:
- Be specific and descriptive: name the files modified, functions created or changed, components built
- Describe the actual work: "Added pagination to UserList component in src/components/UserList.tsx" not "Made changes to files"
- If multiple things were done, list the key changes
- If waiting for Y/n, say exactly what permission is being requested
- If completed, describe what was accomplished
- If errored, say what went wrong and where
- Keep summary under 50 words
- Keep action under 15 words
- "action" should be a clear instruction like "Approve file edit to server.js" or "Review test results in auth.test.ts" or "None"

${parts.join('\n\n')}

Respond ONLY with the JSON array, nothing else:`;
  }

  _callClaude(prompt) {
    return new Promise((resolve, reject) => {
      execFile('claude', ['-p', prompt, '--output-format', 'text'], {
        timeout: CALL_TIMEOUT_MS,
        maxBuffer: 1024 * 512,
        env: { ...process.env },
      }, (err, stdout) => {
        if (err) reject(err);
        else resolve(stdout?.trim() || '');
      });
    });
  }

  _parseResponse(raw, sessionIds) {
    const jsonMatch = raw.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.warn('[AI Orchestrator] No JSON found in response');
      return [];
    }
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.filter(item =>
        item.sessionId && sessionIds.includes(item.sessionId) && item.summary
      );
    } catch (e) {
      console.warn('[AI Orchestrator] JSON parse failed:', e.message);
      return [];
    }
  }

  // ========== PUBLIC GETTERS ==========

  /** @returns {Object<string, SummaryResult>} */
  getSummaries() {
    return { ...this.summaries };
  }

  getDiffs() {
    // Return a clean version without rawDiff (too big for socket)
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

  getDiffDetail(sessionId) {
    return this.diffs[sessionId] || null;
  }

  getBranchStatus() {
    return { ...this.branchStatus };
  }

  getConflicts() {
    // Return without sessionFiles (too verbose)
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

  getPRStatus() {
    return { ...this.prStatus };
  }

  getAutoResponses(limit = 20) {
    return this.autoResponses.slice(-limit);
  }

  getStatus() {
    return {
      autoRespondEnabled: this.autoRespondEnabled,
      coordinationEnabled: this.coordinationEnabled,
      safeMode: !!this.safeModeConfig.safeMode,
      protectedAgentCommands: this.safeModeConfig.protectedAgentCommands || [],
      defaultSessionCommand: this.safeModeConfig.defaultSessionCommand || 'claude',
      summaryCount: Object.keys(this.summaries).length,
      pendingCount: this.pendingSessions.size,
      processing: this._processing,
      trackedSessions: Object.keys(this.diffs).length,
      conflictProjects: Object.keys(this.conflicts).length,
    };
  }

  getAutoRespondBlockReason(sessionId) {
    const session = this.store?.getSession(sessionId);
    if (!session) return null;
    if (session.sessionType === 'protected_agent') {
      return `manual approval required for protected agent command "${session.baseCommand || session.command || 'unknown'}"`;
    }
    return null;
  }

  getCoordinationBlockReason(sessionId) {
    const session = this.store?.getSession(sessionId);
    if (!session) return null;
    if (session.sessionType === 'protected_agent') {
      return `automatic coordination disabled for protected agent command "${session.baseCommand || session.command || 'unknown'}"`;
    }
    return null;
  }

  remove(sessionId) {
    delete this.summaries[sessionId];
    delete this.buffers[sessionId];
    delete this.sessionMeta[sessionId];
    delete this.lastSummarizedAt[sessionId];
    delete this.lastAutoRespondAt[sessionId];
    delete this.diffs[sessionId];
    delete this.branchStatus[sessionId];
    delete this.prStatus[sessionId];
    delete this.pendingMessages[sessionId];
    this.pendingSessions.delete(sessionId);
    this.autoResponses = this.autoResponses.filter(r => r.sessionId !== sessionId);

    // Clean file locks
    for (const projectId of Object.keys(this.fileLocks)) {
      for (const [file, lockedBy] of Object.entries(this.fileLocks[projectId])) {
        if (lockedBy === sessionId) delete this.fileLocks[projectId][file];
      }
    }

    if (this.pendingSessions.size === 0 && this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
}
