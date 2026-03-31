// Summarizer: batches terminal output and calls Claude CLI to generate session summaries.

import './types.js';
import { execFile } from 'child_process';
import { stripAnsi } from './utils.js';

const SUMMARY_DEBOUNCE_MS = 2000;
const MAX_OUTPUT_CHARS = 3000;
const CALL_TIMEOUT_MS = 60000;
const RETRY_DELAY_MS = 3000;

export class Summarizer {
  constructor() {
    this.summaries = {};           // sessionId -> { summary, action, updatedAt }
    this.buffers = {};             // sessionId -> cleaned output tail
    this.sessionMeta = {};         // sessionId -> { sessionName, projectName, status }
    this.lastSummarizedAt = {};
    this.pendingSessions = new Set();
    this._timer = null;
    this._processing = false;
    this.onChange = null;

    // Diffs are injected by the facade after ConflictDetector is created
    this._getDiffs = () => ({});
  }

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
    if (['waiting', 'exited'].includes(newStatus)) {
      this.pendingSessions.add(sessionId);
      this._scheduleBatch();
    }
  }

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

  /** @returns {Object<string, SummaryResult>} */
  getSummaries() {
    return { ...this.summaries };
  }

  remove(sessionId) {
    delete this.summaries[sessionId];
    delete this.buffers[sessionId];
    delete this.sessionMeta[sessionId];
    delete this.lastSummarizedAt[sessionId];
    this.pendingSessions.delete(sessionId);

    if (this.pendingSessions.size === 0 && this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  // --- Internal ---

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

    const diffs = this._getDiffs();

    const digests = sessionIds
      .filter(id => this.buffers[id] && this.buffers[id].length > 50)
      .map(id => {
        const meta = this.sessionMeta[id] || {};
        const output = (this.buffers[id] || '').slice(-MAX_OUTPUT_CHARS);

        // Include diff info if available
        const diffInfo = diffs[id];
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
}
