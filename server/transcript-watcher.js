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
          this._readNewLines(sessionId, entry).catch(() => {});
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
            this._readNewLines(sessionId, entry).catch(() => {});
          }, 1000);
        });
      } catch {
        // Fallback to polling
        entry.pollTimer = setInterval(() => {
          this._readNewLines(sessionId, entry).catch(() => {});
        }, 1000);
      }

      // Also poll periodically as a safety net (macOS fs.watch can be unreliable)
      if (!entry.pollTimer) {
        entry.pollTimer = setInterval(() => {
          this._readNewLines(sessionId, entry).catch(() => {});
        }, 2000);
      }

      // Read any existing content
      this._readNewLines(sessionId, entry).catch(() => {});
    };

    tryWatch().catch(() => {});
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

    if (event.type === 'assistant') {
      if (event.message?.content) {
        const content = event.message.content;
        const hasToolUse = Array.isArray(content)
          ? content.some(b => b.type === 'tool_use')
          : false;
        const hasThinking = Array.isArray(content)
          ? content.some(b => b.type === 'thinking')
          : false;

        if (hasToolUse) {
          newState = 'tool_running';
        } else if (hasThinking) {
          newState = 'thinking';
        }
      }
      if (event.message?.stop_reason === 'end_turn') {
        newState = 'waiting';
      }
    }

    if (newState && newState !== entry.state) {
      entry.state = newState;
      this.onStateChange(sessionId, newState);
    }
  }

  getState(sessionId) {
    return this.watchers.get(sessionId)?.state || null;
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
