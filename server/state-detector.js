import './types.js';
import { PtyLogger } from './pty-logger.js';
import { TranscriptWatcher } from './transcript-watcher.js';
import { stripAnsi, extractOSC, STATUS_BUFFER_LIMIT, TITLE_BUSY_PREFIXES, TITLE_IDLE_PREFIX } from './utils.js';

// Spinner chars used by Claude Code (from components/Spinner/utils.ts)
// macOS: · ✢ ✳ ✶ ✻ ✽  |  Ghostty: · ✢ ✳ ✶ ✻ *  |  reduced-motion: ●
// NOTE: `*` is NOT included here — it's far too common in normal output
// (markdown bold, bullet lists, code, etc.) and causes false "working"
// detections. Those false positives clear the `waitingNotified` flag in
// notification-wiring and produce duplicate "needs input" notifications
// for an idle session. The Ghostty case is still covered by OSC title
// detection (TITLE_BUSY_PREFIXES) below.
const SPINNER_PATTERN = /[·✢✳✶✻✽●]/;
const SPINNER_COOLDOWN_MS = 2000;

// Map granular states to backward-compatible status values
const STATE_TO_STATUS = {
  thinking: 'working',
  tool_running: 'working',
  responding: 'working',
  compacting: 'working',
  api_retry: 'working',
  working: 'working',
  error: 'waiting',       // errors need attention — map to waiting
  waiting: 'waiting',
  idle: 'active',
  active: 'active',
  completed: 'completed',
  exited: 'exited',
};

export class StateDetector {
  constructor(options = {}) {
    /** @type {(sessionId: string, newStatus: string, granularState: string) => void} */
    this.onStatusChange = options.onStatusChange || (() => {});
    this.ptyLogger = new PtyLogger();
    this.transcriptWatcher = new TranscriptWatcher({
      onStateChange: (sessionId, state, detail) => this._onTranscriptState(sessionId, state, detail),
    });
    this.sessions = new Map(); // sessionId -> session detection state
    this.statusBuffers = {};
  }

  /**
   * @param {string} sessionId
   * @returns {DetectionState}
   */
  _getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        ptyState: null,
        transcriptState: null,
        transcriptDetail: null,
        // Session metadata from transcript init event
        sessionMeta: null,
        resolvedStatus: 'active',
        granularState: 'idle',
        lastSpinnerTime: 0,
        cooldownTimer: null,
        _lastEmittedDetail: null,
      });
    }
    return this.sessions.get(sessionId);
  }

  // Start watching a session's transcript file
  watchTranscript(sessionId, cwd, claudeSessionId) {
    this.transcriptWatcher.watch(sessionId, cwd, claudeSessionId);
  }

  /**
   * Main entry point: called on each raw PTY data chunk.
   * @param {string} sessionId
   * @param {string} rawData
   */
  ingest(sessionId, rawData) {
    this.ptyLogger.log(sessionId, rawData);

    // Detect clear screen — old content is no longer visible, reset buffer
    // Claude Code sends these when /clear is run
    const hasClearScreen = /\x1b\[2J|\x1bc|\x1b\[3J/.test(rawData);

    // Update buffer and invalidate clean cache
    if (!this.statusBuffers[sessionId]) this.statusBuffers[sessionId] = '';
    if (hasClearScreen) {
      // Reset buffer — old content is gone from the terminal
      this.statusBuffers[sessionId] = rawData;
      const state = this._getSession(sessionId);
      state._cleanCache = null;
      state.lastClearTime = Date.now();
      // Clear stale transcript state (old end_turn is irrelevant after /clear)
      state.transcriptState = null;
      state.transcriptDetail = null;
      this._setPtyState(sessionId, 'active');
      return;
    }
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
    //    Strip OSC sequences first — ✳ appears both as a spinner frame
    //    and as the idle title prefix; matching inside OSC would false-positive.
    const visibleData = rawData.replace(/\x1b\][^\x07]*\x07/g, '');
    if (SPINNER_PATTERN.test(visibleData)) {
      state.lastSpinnerTime = Date.now();
      state.lastClearTime = 0; // real work started — re-enable prompt detection
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

    // 2. OSC title extraction — check for Claude Code's actual title prefixes
    //    From screens/REPL.tsx: busy titles start with ⠂ or ⠐ (animating),
    //    idle titles start with ✳ (static)
    const oscTitles = extractOSC(buf);
    if (oscTitles.length > 0) {
      const lastTitle = oscTitles[oscTitles.length - 1];

      // Check Claude Code's actual title animation prefixes (most reliable)
      if (TITLE_BUSY_PREFIXES.some(p => lastTitle.startsWith(p))) {
        this._setPtyState(sessionId, 'working');
        return;
      }
      if (lastTitle.startsWith(TITLE_IDLE_PREFIX)) {
        // Idle title — but don't override if transcript has a more specific state
        if (!state.transcriptState || state.transcriptState === 'waiting' || state.transcriptState === 'idle') {
          this._setPtyState(sessionId, 'active');
        }
        return;
      }

      // Fallback: keyword matching for non-standard title formats
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
      // After a screen clear, the fresh prompt is not "waiting for input" —
      // suppress until real work (spinners) starts a new turn
      if (state.lastClearTime && Date.now() - state.lastClearTime < 30000) {
        if (state.ptyState !== 'active') {
          this._setPtyState(sessionId, 'active');
        }
        return;
      }
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

    // When PTY exits "waiting" (prompt disappeared — user typed input),
    // clear stale transcript "waiting" so the resolved status updates immediately
    if (state.ptyState === 'waiting' && ptyState !== 'waiting' && state.transcriptState === 'waiting') {
      state.transcriptState = null;
      state.transcriptDetail = null;
    }

    state.ptyState = ptyState;
    this._resolveAndEmit(sessionId);
  }

  _onTranscriptState(sessionId, transcriptState, detail) {
    const state = this._getSession(sessionId);

    // null state = metadata-only update (e.g., init event)
    if (transcriptState === null) {
      if (detail) {
        // Store session metadata from init events
        if (detail.model || detail.claudeVersion || detail.permissionMode) {
          state.sessionMeta = {
            ...(state.sessionMeta || {}),
            model: detail.model || state.sessionMeta?.model,
            claudeVersion: detail.claudeVersion || state.sessionMeta?.claudeVersion,
            permissionMode: detail.permissionMode || state.sessionMeta?.permissionMode,
          };
        }
      }
      return;
    }

    // Real work from transcript clears the post-clear suppression
    if (transcriptState === 'thinking' || transcriptState === 'tool_running' || transcriptState === 'responding') {
      state.lastClearTime = 0;
    }
    state.transcriptState = transcriptState;
    state.transcriptDetail = detail || null;
    this._resolveAndEmit(sessionId);
  }

  /** @param {string} sessionId */
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

    // PTY spinner detection overrides stale transcript "waiting"
    // (after user sends input, PTY detects spinners before transcript updates)
    if (state.ptyState === 'working' && granularState === 'waiting') {
      granularState = 'working';
    }

    const newStatus = STATE_TO_STATUS[granularState] || 'active';
    const detail = state.transcriptDetail;
    const detailChanged = detail &&
      JSON.stringify(detail) !== JSON.stringify(state._lastEmittedDetail);

    if (newStatus !== state.resolvedStatus || detailChanged) {
      state.resolvedStatus = newStatus;
      state.granularState = granularState;
      state._lastEmittedDetail = detail;
      this.onStatusChange(sessionId, newStatus, granularState, detail);
    }
  }

  // Get backward-compatible status for a session
  getStatus(sessionId) {
    const state = this.sessions.get(sessionId);
    return state?.resolvedStatus || 'active';
  }

  // Get granular state (thinking, tool_running, responding, compacting, waiting, idle, etc.)
  getGranularState(sessionId) {
    const state = this.sessions.get(sessionId);
    return state?.granularState || state?.ptyState || 'idle';
  }

  // Get transcript detail (toolName, errorType, etc.)
  getDetail(sessionId) {
    const state = this.sessions.get(sessionId);
    return state?.transcriptDetail || null;
  }

  // Get session metadata (model, version, permission mode) from init event
  getSessionMeta(sessionId) {
    const state = this.sessions.get(sessionId);
    return state?.sessionMeta || null;
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
