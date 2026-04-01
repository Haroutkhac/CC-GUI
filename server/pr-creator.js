// PRCreator: rebase, push, and create GitHub PRs for session branches.

import './types.js';
import { execFile } from 'child_process';
import { capitalize } from './utils.js';

const CALL_TIMEOUT_MS = 60000;

export class PRCreator {
  constructor({ gitMonitor, store, summarizer }) {
    this.gitMonitor = gitMonitor;
    this.store = store;
    this.summarizer = summarizer;

    this.prStatus = {};            // sessionId -> { status, prUrl, error, updatedAt }
    this.onPRStatus = null;

    // Diffs are injected by the facade after ConflictDetector is created
    this._getDiffs = () => ({});
  }

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

  async createAllPRs(projectId) {
    const project = this.store?.getProject(projectId);
    if (!project) return { success: false, error: 'Project not found' };

    const sessions = this.store.getSessionsByProject(projectId)
      .filter(s => s.worktreePath && s.branch);

    if (sessions.length === 0) {
      return { success: false, error: 'No sessions with git worktrees' };
    }

    const diffs = this._getDiffs();

    // Sort: sessions with fewer file changes first (less likely to conflict)
    const sorted = [...sessions].sort((a, b) => {
      const filesA = diffs[a.id]?.changedFiles?.length || 0;
      const filesB = diffs[b.id]?.changedFiles?.length || 0;
      return filesA - filesB;
    });

    const results = [];
    for (const session of sorted) {
      const result = await this.createPR(session.id);
      results.push({ sessionId: session.id, ...result });
    }

    return { success: true, results };
  }

  getPRStatus() {
    return { ...this.prStatus };
  }

  remove(sessionId) {
    delete this.prStatus[sessionId];
  }

  // --- Internal ---

  _updatePRStatus(sessionId, status, prUrl, error) {
    this.prStatus[sessionId] = { status, prUrl, error, updatedAt: Date.now() };
    this.onPRStatus?.({ sessionId, ...this.prStatus[sessionId] });
  }

  async _generatePRContent(session, project, diff, branchInfo) {
    const starterName = session.starter
      ? capitalize(session.starter)
      : session.name;

    const summaries = this.summarizer.getSummaries();
    const existingSummary = summaries[session.id]?.summary;
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
}
