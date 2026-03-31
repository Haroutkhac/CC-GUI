import fs from 'fs';
import path from 'path';
import os from 'os';

export class TranscriptWatcher {
  constructor(options = {}) {
    this.onStateChange = options.onStateChange || (() => {});
    this.watchers = new Map(); // sessionId -> entry
  }

  // Encode a path the way Claude Code does: replace / with -
  _encodePath(p) {
    return p.replace(/\//g, '-');
  }

  _resolveTranscriptPath(cwd, claudeSessionId) {
    const encoded = this._encodePath(cwd);
    return path.join(os.homedir(), '.claude', 'projects', encoded, `${claudeSessionId}.jsonl`);
  }

  watch(sessionId, cwd, claudeSessionId) {
    // Stop any existing watcher for this session
    this.stop(sessionId);

    const transcriptPath = this._resolveTranscriptPath(cwd, claudeSessionId);

    const entry = {
      path: transcriptPath,
      watcher: null,
      offset: 0,
      state: null,
      detail: null,
      // Session metadata extracted from init event
      model: null,
      claudeVersion: null,
      permissionMode: null,
      pollTimer: null,
      startupTimer: null,
      startupRetries: 0,
      readInFlight: false,
    };

    this.watchers.set(sessionId, entry);
    this._startWatching(sessionId, entry);
  }

  _startWatching(sessionId, entry) {
    const tryWatch = async () => {
      // Check if we've been stopped
      if (!this.watchers.has(sessionId)) return;

      try {
        await fs.promises.access(entry.path);
      } catch {
        // File doesn't exist yet — poll until it appears (up to 60s)
        if (++entry.startupRetries > 60) return; // give up
        entry.startupTimer = setTimeout(tryWatch, 1000);
        return;
      }

      try {
        // Use polling interval for macOS reliability (fs.watch can miss events)
        entry.watcher = fs.watch(entry.path, { persistent: false }, () => {
          this._readNewLines(sessionId, entry);
        });

        entry.watcher.on('error', () => {
          // Fall back to polling on error
          if (entry.watcher) {
            entry.watcher.close();
            entry.watcher = null;
          }
          // Clear existing poll timer before creating a new one
          if (entry.pollTimer) {
            clearInterval(entry.pollTimer);
          }
          entry.pollTimer = setInterval(() => {
            this._readNewLines(sessionId, entry);
          }, 1000);
        });
      } catch {
        // Fallback to polling
        entry.pollTimer = setInterval(() => {
          this._readNewLines(sessionId, entry);
        }, 1000);
      }

      // Also poll periodically as a safety net (macOS fs.watch can be unreliable)
      if (!entry.pollTimer) {
        entry.pollTimer = setInterval(() => {
          this._readNewLines(sessionId, entry);
        }, 2000);
      }

      // Read any existing content
      this._readNewLines(sessionId, entry);
    };

    tryWatch();
  }

  async _readNewLines(sessionId, entry) {
    if (entry.readInFlight) return;
    entry.readInFlight = true;

    try {
      let stat;
      try {
        stat = await fs.promises.stat(entry.path);
      } catch { return; }
      if (stat.size <= entry.offset) return;

      let fh;
      try {
        fh = await fs.promises.open(entry.path, 'r');
        const buf = Buffer.alloc(stat.size - entry.offset);
        await fh.read(buf, 0, buf.length, entry.offset);
        entry.offset = stat.size;

        const text = buf.toString('utf8');
        const lines = text.split('\n').filter(l => l.trim());
        for (const line of lines) {
          try {
            const event = JSON.parse(line);
            this._processEvent(sessionId, entry, event);
          } catch { /* skip malformed */ }
        }
      } catch {
        // ignore read errors
      } finally {
        if (fh) await fh.close();
      }
    } finally {
      entry.readInFlight = false;
    }
  }

  _processEvent(sessionId, entry, event) {
    let newState = null;
    let detail = {};

    // --- Assistant messages (with content blocks) ---
    if (event.type === 'assistant') {
      if (event.message?.content) {
        const content = event.message.content;
        if (Array.isArray(content)) {
          // Find the last tool_use block (most recent action)
          const toolUseBlock = content.findLast
            ? content.findLast(b => b.type === 'tool_use')
            : [...content].reverse().find(b => b.type === 'tool_use');
          const hasThinking = content.some(b => b.type === 'thinking');
          const hasText = content.some(b => b.type === 'text');

          if (toolUseBlock) {
            newState = 'tool_running';
            detail.toolName = toolUseBlock.name || null;
            detail.toolInput = this._summarizeToolInput(toolUseBlock.name, toolUseBlock.input);
          } else if (hasThinking) {
            newState = 'thinking';
          } else if (hasText) {
            newState = 'responding';
          }
        }
      }

      // Check for API errors on assistant messages
      // (error field from SDKAssistantMessage: 'authentication_failed' | 'billing_error' |
      //  'rate_limit' | 'invalid_request' | 'server_error' | 'unknown' | 'max_output_tokens')
      if (event.error) {
        newState = 'error';
        detail.errorType = event.error;
      }

      if (event.message?.stop_reason === 'end_turn') {
        newState = 'waiting';
      }
    }

    // --- Result messages (turn completed or errored) ---
    if (event.type === 'result') {
      if (event.subtype === 'success') {
        newState = 'waiting';
        detail.costUsd = event.total_cost_usd ?? null;
        detail.numTurns = event.num_turns ?? null;
      } else if (event.subtype && event.subtype.startsWith('error_')) {
        // error_during_execution, error_max_turns, error_max_budget_usd,
        // error_max_structured_output_retries
        newState = 'error';
        detail.errorType = event.subtype;
        detail.errors = event.errors || [];
      }
    }

    // --- System messages ---
    if (event.type === 'system') {
      // Init event: extract session metadata (model, tools, version, etc.)
      if (event.subtype === 'init') {
        entry.model = event.model || null;
        entry.claudeVersion = event.claude_code_version || null;
        entry.permissionMode = event.permissionMode || null;
        // Emit init metadata so state detector can store it
        detail.model = event.model;
        detail.claudeVersion = event.claude_code_version;
        detail.permissionMode = event.permissionMode;
        // Emit as a metadata-only update (state stays the same)
        this.onStateChange(sessionId, null, detail);
        return;
      }

      // Session state changed: authoritative signal from Claude Code
      // state: 'idle' | 'running' | 'requires_action'
      if (event.subtype === 'session_state_changed') {
        if (event.state === 'idle') {
          newState = 'waiting';
        } else if (event.state === 'running') {
          // Don't override more specific states (thinking/tool_running/responding)
          if (!entry.state || entry.state === 'waiting' || entry.state === 'idle') {
            newState = 'working';
          }
        } else if (event.state === 'requires_action') {
          newState = 'waiting';
          detail.requiresAction = true;
        }
      }

      // Compaction status
      if (event.subtype === 'status') {
        if (event.status === 'compacting') {
          newState = 'compacting';
        }
      }

      // API retry event
      if (event.subtype === 'api_retry') {
        newState = 'api_retry';
        detail.retryAttempt = event.attempt ?? null;
        detail.retryMax = event.max_retries ?? null;
        detail.retryDelayMs = event.retry_delay_ms ?? null;
        detail.errorStatus = event.error_status ?? null;
      }
    }

    // --- Tool progress events ---
    if (event.type === 'tool_progress') {
      newState = 'tool_running';
      detail.toolName = event.tool_name || null;
      detail.toolElapsed = event.elapsed_time_seconds ?? null;
    }

    // Only emit if state or detail has changed
    if (newState !== null) {
      const detailChanged = this._detailChanged(entry.detail, detail);
      if (newState !== entry.state || detailChanged) {
        entry.state = newState;
        entry.detail = Object.keys(detail).length > 0 ? detail : null;
        this.onStateChange(sessionId, newState, entry.detail);
      }
    }
  }

  // Extract the most relevant piece of tool input for display context
  _summarizeToolInput(toolName, input) {
    if (!input) return null;
    switch (toolName) {
      case 'Read': return input.file_path || null;
      case 'Write': return input.file_path || null;
      case 'Edit': return input.file_path || null;
      case 'Bash': return (input.command || '').slice(0, 80) || null;
      case 'Glob': return input.pattern || null;
      case 'Grep': return input.pattern || null;
      case 'Agent': return input.description || null;
      case 'WebSearch': return input.query || null;
      case 'WebFetch': return input.url || null;
      default: return null;
    }
  }

  _detailChanged(prev, next) {
    if (!prev && (!next || Object.keys(next).length === 0)) return false;
    if (!prev || !next) return true;
    return JSON.stringify(prev) !== JSON.stringify(next);
  }

  getState(sessionId) {
    return this.watchers.get(sessionId)?.state || null;
  }

  getDetail(sessionId) {
    return this.watchers.get(sessionId)?.detail || null;
  }

  getSessionMeta(sessionId) {
    const entry = this.watchers.get(sessionId);
    if (!entry) return null;
    return {
      model: entry.model,
      claudeVersion: entry.claudeVersion,
      permissionMode: entry.permissionMode,
    };
  }

  stop(sessionId) {
    const entry = this.watchers.get(sessionId);
    if (!entry) return;
    if (entry.watcher) {
      try { entry.watcher.close(); } catch { /* ignore */ }
    }
    if (entry.pollTimer) {
      clearTimeout(entry.pollTimer);
      clearInterval(entry.pollTimer);
    }
    if (entry.startupTimer) {
      clearTimeout(entry.startupTimer);
    }
    this.watchers.delete(sessionId);
  }

  stopAll() {
    for (const id of [...this.watchers.keys()]) {
      this.stop(id);
    }
  }
}
