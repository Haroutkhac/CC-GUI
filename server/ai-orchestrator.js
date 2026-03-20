// AI Orchestrator: uses Claude CLI to generate smart summaries of agent sessions
// and auto-responds to obvious Y/n prompts

import { execFile } from 'child_process';
import { stripAnsi } from './utils.js';

const SUMMARY_DEBOUNCE_MS = 5000;    // Wait 5s after last trigger before calling Claude
const SUMMARY_COOLDOWN_MS = 45000;   // Don't re-summarize same session within 45s
const MAX_OUTPUT_CHARS = 3000;        // Max chars of output to send for summarization
const CALL_TIMEOUT_MS = 60000;        // 60s timeout for claude CLI call
const AUTO_RESPOND_COOLDOWN_MS = 3000; // Don't auto-respond same session within 3s

export class AIOrchestrator {
  constructor({ terminalManager }) {
    this.terminalManager = terminalManager;
    this.summaries = {};           // sessionId -> { summary, action, updatedAt }
    this.buffers = {};             // sessionId -> cleaned output tail
    this.sessionMeta = {};         // sessionId -> { sessionName, projectName, status }
    this.lastSummarizedAt = {};    // sessionId -> timestamp
    this.lastAutoRespondAt = {};   // sessionId -> timestamp (to prevent double-fires)
    this.pendingSessions = new Set();
    this._timer = null;
    this._processing = false;
    this.onChange = null;           // callback when summaries update

    // Auto-respond
    this.autoRespondEnabled = true;
    this.autoResponses = [];       // { sessionId, prompt, response, timestamp }
    this.onAutoRespond = null;     // callback(entry) when auto-response happens
  }

  // Feed terminal output into the AI orchestrator
  ingest(sessionId, rawData, meta) {
    const clean = stripAnsi(rawData);
    this.buffers[sessionId] = ((this.buffers[sessionId] || '') + clean).slice(-MAX_OUTPUT_CHARS * 2);
    if (meta) {
      this.sessionMeta[sessionId] = { ...this.sessionMeta[sessionId], ...meta };
    }
  }

  // Called when session status changes — triggers summarization on meaningful transitions
  onStatusChange(sessionId, newStatus, meta) {
    if (meta) {
      this.sessionMeta[sessionId] = { ...this.sessionMeta[sessionId], ...meta };
    }
    if (this.sessionMeta[sessionId]) {
      this.sessionMeta[sessionId].status = newStatus;
    }

    // Summarize on meaningful state transitions
    if (['waiting', 'exited'].includes(newStatus)) {
      const lastTime = this.lastSummarizedAt[sessionId] || 0;
      if (Date.now() - lastTime >= SUMMARY_COOLDOWN_MS) {
        this.pendingSessions.add(sessionId);
        this._scheduleBatch();
      }
    }
  }

  // Force refresh summaries for all tracked sessions
  refreshAll() {
    for (const sessionId of Object.keys(this.buffers)) {
      if (this.buffers[sessionId].length > 100) {
        this.pendingSessions.add(sessionId);
      }
    }
    if (this.pendingSessions.size > 0) {
      // Reset cooldowns for forced refresh
      for (const id of this.pendingSessions) {
        delete this.lastSummarizedAt[id];
      }
      this._scheduleBatch();
    }
  }

  // Check if we should auto-respond to a Y/n prompt
  // Returns true if auto-responded, false otherwise
  checkAutoRespond(sessionId, cleanTail) {
    if (!this.autoRespondEnabled) return false;

    // Cooldown — prevent double-fires on rapid output
    const now = Date.now();
    if (this.lastAutoRespondAt[sessionId] && now - this.lastAutoRespondAt[sessionId] < AUTO_RESPOND_COOLDOWN_MS) {
      return false;
    }

    // Look for Y/n prompt at end of output
    const ynMatch = cleanTail.match(/(.{0,300})\(Y\/n\)\s*$/i);
    if (!ynMatch) return false;

    const promptText = ynMatch[1].trim();

    // Don't auto-approve dangerous operations
    const dangerous = /push\s*--force|--force-push|delete\s+branch|drop\s+table|rm\s+-rf|reset\s+--hard|git\s+clean|--no-verify|force.*delete/i;
    if (dangerous.test(promptText)) return false;

    // Auto-respond Y
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
    // Keep log bounded
    if (this.autoResponses.length > 200) {
      this.autoResponses = this.autoResponses.slice(-100);
    }

    this.onAutoRespond?.(entry);
    return true;
  }

  // --- Internal scheduling ---

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
        return {
          id,
          name: meta.sessionName || 'Unknown',
          project: meta.projectName || 'Unknown',
          status: meta.status || 'unknown',
          output,
        };
      });

    if (digests.length === 0) {
      this._processing = false;
      return;
    }

    try {
      const prompt = this._buildPrompt(digests);
      const raw = await this._callClaude(prompt);
      const results = this._parseResponse(raw, sessionIds);

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
    } catch (err) {
      console.warn('[AI Orchestrator] Summary failed:', err.message);
    }

    this._processing = false;
    if (this.pendingSessions.size > 0) {
      this._scheduleBatch();
    }
  }

  _buildPrompt(digests) {
    const parts = digests.map(d =>
      `### "${d.name}" (project: ${d.project}) [status: ${d.status}] [id:${d.id}]\n\`\`\`\n${d.output.slice(-2000)}\n\`\`\``
    );

    return `You monitor Claude Code agent sessions for a developer. Analyze each session's recent terminal output and summarize.

For each session return JSON:
[{"sessionId":"<id>","summary":"<what the agent did/is doing — be specific about files, functions, changes>","action":"<what user should do next, or 'None' if nothing needed>"}]

Rules:
- Be specific: mention file names, function names, what was changed
- If waiting for Y/n, say what permission is being requested
- If completed, say what was accomplished
- If errored, say what went wrong
- Keep summary under 25 words
- Keep action under 12 words
- "action" should be a clear instruction like "Approve file write" or "Review test results" or "None"

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
    // Try to find a JSON array in the response
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

  // --- Public getters ---

  getSummaries() {
    return { ...this.summaries };
  }

  getAutoResponses(limit = 20) {
    return this.autoResponses.slice(-limit);
  }

  getStatus() {
    return {
      autoRespondEnabled: this.autoRespondEnabled,
      summaryCount: Object.keys(this.summaries).length,
      pendingCount: this.pendingSessions.size,
      processing: this._processing,
    };
  }

  remove(sessionId) {
    delete this.summaries[sessionId];
    delete this.buffers[sessionId];
    delete this.sessionMeta[sessionId];
    delete this.lastSummarizedAt[sessionId];
    delete this.lastAutoRespondAt[sessionId];
    this.pendingSessions.delete(sessionId);
    this.autoResponses = this.autoResponses.filter(r => r.sessionId !== sessionId);
    // Cancel pending batch if no sessions remain
    if (this.pendingSessions.size === 0 && this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
}
