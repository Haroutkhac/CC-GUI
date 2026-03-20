import { PtyLogger } from './pty-logger.js';
import { TranscriptWatcher } from './transcript-watcher.js';
import { stripAnsi, extractOSC, STATUS_BUFFER_LIMIT } from './utils.js';

// Braille spinner chars used by Claude Code
const SPINNER_PATTERN = /[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/;
const SPINNER_COOLDOWN_MS = 2000;

// Map granular states to backward-compatible status values
const STATE_TO_STATUS = {
  thinking: 'working',
  tool_running: 'working',
  working: 'working',
  waiting: 'waiting',
  idle: 'active',
  active: 'active',
  completed: 'completed',
  exited: 'exited',
};

export class StateDetector {
  constructor(options = {}) {
    this.onStatusChange = options.onStatusChange || (() => {});
    this.ptyLogger = new PtyLogger();
    this.transcriptWatcher = new TranscriptWatcher({
      onStateChange: (sessionId, state) => this._onTranscriptState(sessionId, state),
    });
    this.sessions = new Map(); // sessionId -> session detection state
    this.statusBuffers = {};
  }

  _getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        ptyState: null,
        transcriptState: null,
        resolvedStatus: 'active',
        granularState: 'idle',
        lastSpinnerTime: 0,
        cooldownTimer: null,
      });
    }
    return this.sessions.get(sessionId);
  }

  // Start watching a session's transcript file
  watchTranscript(sessionId, cwd, claudeSessionId) {
    this.transcriptWatcher.watch(sessionId, cwd, claudeSessionId);
  }

  // Main entry point: called on each raw PTY data chunk
  ingest(sessionId, rawData) {
    this.ptyLogger.log(sessionId, rawData);

    // Update buffer and invalidate clean cache
    if (!this.statusBuffers[sessionId]) this.statusBuffers[sessionId] = '';
    this.statusBuffers[sessionId] += rawData;
    if (this.statusBuffers[sessionId].length > STATUS_BUFFER_LIMIT) {
      this.statusBuffers[sessionId] = this.statusBuffers[sessionId].slice(-STATUS_BUFFER_LIMIT);
    }
    const state = this._getSession(sessionId);
    state._cleanCache = null;

    this._detectFromPty(sessionId, rawData);
  }

  _detectFromPty(sessionId, rawData) {
    const state = this._getSession(sessionId);
    const buf = this.statusBuffers[sessionId];

    // 1. Spinner detection (highest priority for "working")
    if (SPINNER_PATTERN.test(rawData)) {
      state.lastSpinnerTime = Date.now();
      this._setPtyState(sessionId, 'working');

      // Reset cooldown timer — maintain "working" for 2s after last spinner
      clearTimeout(state.cooldownTimer);
      state.cooldownTimer = setTimeout(() => {
        if (state.ptyState === 'working' && Date.now() - state.lastSpinnerTime >= SPINNER_COOLDOWN_MS) {
          this._setPtyState(sessionId, 'active');
        }
      }, SPINNER_COOLDOWN_MS);
      return;
    }

    // 2. OSC title extraction — check for status info in terminal title
    const oscTitles = extractOSC(buf);
    if (oscTitles.length > 0) {
      const lastTitle = oscTitles[oscTitles.length - 1];
      if (/thinking|working/i.test(lastTitle)) {
        this._setPtyState(sessionId, 'working');
        return;
      }
    }

    // 3. Prompt detection on cleaned buffer (increased to 400 chars)
    const clean = stripAnsi(buf);
    state._cleanCache = clean; // cache for getCleanBuffer/getCleanTail reuse
    const tail = clean.slice(-400);

    // Waiting patterns — prompt at end of output
    if (/(?:^|\n)\s*>\s*$/.test(tail) || /❯\s*$/.test(tail) || /\(Y\/n\)\s*$/i.test(tail) || /\(y\/N\)\s*$/i.test(tail) || /(?:^|\n)\s*\?\s*$/.test(tail)) {
      this._setPtyState(sessionId, 'waiting');
      return;
    }

    // If spinner cooldown is active, maintain working state
    if (state.lastSpinnerTime && Date.now() - state.lastSpinnerTime < SPINNER_COOLDOWN_MS) {
      return;
    }

    // If we were working/waiting but no longer match, drop to active
    if (state.ptyState === 'working' || state.ptyState === 'waiting') {
      this._setPtyState(sessionId, 'active');
    }
  }

  _setPtyState(sessionId, ptyState) {
    const state = this._getSession(sessionId);
    if (state.ptyState === ptyState) return;
    state.ptyState = ptyState;
    this._resolveAndEmit(sessionId);
  }

  _onTranscriptState(sessionId, transcriptState) {
    const state = this._getSession(sessionId);
    state.transcriptState = transcriptState;
    this._resolveAndEmit(sessionId);
  }

  _resolveAndEmit(sessionId) {
    const state = this._getSession(sessionId);

    // Transcript is authoritative when available
    let granularState;
    if (state.transcriptState) {
      granularState = state.transcriptState;
    } else {
      granularState = state.ptyState || 'idle';
    }

    // PTY prompt detection overrides transcript for "waiting"
    // (PTY sees the prompt immediately, transcript may lag)
    if (state.ptyState === 'waiting') {
      granularState = 'waiting';
    }

    const newStatus = STATE_TO_STATUS[granularState] || 'active';
    if (newStatus !== state.resolvedStatus) {
      state.resolvedStatus = newStatus;
      state.granularState = granularState;
      this.onStatusChange(sessionId, newStatus, granularState);
    }
  }

  // Get backward-compatible status for a session
  getStatus(sessionId) {
    const state = this.sessions.get(sessionId);
    return state?.resolvedStatus || 'active';
  }

  // Get granular state (thinking, tool_running, waiting, idle, etc.)
  getGranularState(sessionId) {
    const state = this.sessions.get(sessionId);
    return state?.granularState || state?.ptyState || 'idle';
  }

  // Get full cleaned buffer (cached — avoids redundant stripAnsi calls)
  getCleanBuffer(sessionId) {
    const state = this.sessions.get(sessionId);
    if (state?._cleanCache) return state._cleanCache;
    const buf = this.statusBuffers[sessionId];
    if (!buf) return '';
    const clean = stripAnsi(buf);
    if (state) state._cleanCache = clean;
    return clean;
  }

  // Get cleaned tail text for prompt analysis (used by auto-respond)
  getCleanTail(sessionId) {
    return this.getCleanBuffer(sessionId).slice(-400);
  }

  // Clean up a session
  remove(sessionId) {
    const state = this.sessions.get(sessionId);
    if (state?.cooldownTimer) clearTimeout(state.cooldownTimer);
    this.sessions.delete(sessionId);
    delete this.statusBuffers[sessionId];
    this.ptyLogger.close(sessionId);
    this.transcriptWatcher.stop(sessionId);
  }

  // Shutdown everything
  shutdown() {
    for (const [, state] of this.sessions) {
      if (state.cooldownTimer) clearTimeout(state.cooldownTimer);
    }
    this.sessions.clear();
    this.statusBuffers = {};
    this.ptyLogger.closeAll();
    this.transcriptWatcher.stopAll();
  }
}
