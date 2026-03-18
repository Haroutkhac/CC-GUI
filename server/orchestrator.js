// Orchestrator: monitors all terminal sessions and determines what action is needed

import { stripAnsi, ORCHESTRATOR_BUFFER_LIMIT } from './utils.js';

export const PRIORITY = {
  CRITICAL: 4,  // Permission prompts, Y/n confirmations
  HIGH: 3,      // Waiting for user input, errors
  MEDIUM: 2,    // Task completed, needs review
  LOW: 1,       // Actively working
  NONE: 0,      // Idle / nothing happening
};

const PRIORITY_LABELS = {
  [PRIORITY.CRITICAL]: 'CRITICAL',
  [PRIORITY.HIGH]: 'HIGH',
  [PRIORITY.MEDIUM]: 'MEDIUM',
  [PRIORITY.LOW]: 'LOW',
  [PRIORITY.NONE]: 'IDLE',
};

const PRIORITY_ACTIONS = {
  [PRIORITY.CRITICAL]: 'Respond now',
  [PRIORITY.HIGH]: 'Needs attention',
  [PRIORITY.MEDIUM]: 'Review when ready',
  [PRIORITY.LOW]: 'No action needed',
  [PRIORITY.NONE]: 'Idle',
};

export class Orchestrator {
  constructor() {
    this.states = new Map();    // sessionId -> analysis state
    this.buffers = new Map();   // sessionId -> raw output buffer
    this.onChange = null;        // callback when priorities change
    this._debounceTimer = null;
  }

  // Feed terminal output into the orchestrator
  ingest(sessionId, rawData, meta) {
    let buf = (this.buffers.get(sessionId) || '') + rawData;
    if (buf.length > ORCHESTRATOR_BUFFER_LIMIT) buf = buf.slice(-ORCHESTRATOR_BUFFER_LIMIT);
    this.buffers.set(sessionId, buf);

    const clean = stripAnsi(buf);
    const tail = clean.slice(-600);

    const prev = this.states.get(sessionId);
    const analysis = this._analyze(tail, meta);
    analysis.sessionId = sessionId;
    analysis.meta = meta;

    // Keep original detectedAt if priority hasn't changed
    if (prev && prev.priority === analysis.priority && prev.reason === analysis.reason) {
      analysis.detectedAt = prev.detectedAt;
    } else {
      analysis.detectedAt = Date.now();
    }

    this.states.set(sessionId, analysis);

    // Debounce the onChange callback (50ms) to batch rapid updates
    if (this.onChange) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => this.onChange(), 50);
    }
  }

  // Analyze the cleaned terminal output and determine priority/action
  _analyze(tail, meta) {
    const lastLines = tail.split('\n').filter(l => l.trim()).slice(-8);
    const context = lastLines.slice(-3).join('\n').slice(0, 300);

    // --- CRITICAL: Permission / confirmation prompts ---
    if (/\(Y\/n\)\s*$/i.test(tail) || /\(y\/N\)\s*$/i.test(tail)) {
      const promptLine = lastLines.find(l => /Y\/n|y\/N/i.test(l)) || lastLines[lastLines.length - 1] || '';
      return {
        priority: PRIORITY.CRITICAL,
        label: PRIORITY_LABELS[PRIORITY.CRITICAL],
        reason: 'Confirmation needed',
        action: 'Respond Y or N',
        actionHint: 'Y/n',
        context: promptLine.slice(0, 200),
      };
    }

    if (/Do you want to proceed|Allow .* to |Approve.*Deny|Would you like to/i.test(tail.slice(-400))) {
      const promptLine = lastLines.find(l => /proceed|Allow|Approve|Deny|Would you like/i.test(l)) || lastLines[lastLines.length - 1] || '';
      return {
        priority: PRIORITY.CRITICAL,
        label: PRIORITY_LABELS[PRIORITY.CRITICAL],
        reason: 'Permission request',
        action: 'Approve or deny',
        actionHint: 'approve',
        context: promptLine.slice(0, 200),
      };
    }

    // --- HIGH: Waiting for user input (prompt at end) ---
    if (/(?:^|\n)\s*>\s*$/.test(tail) || /❯\s*$/.test(tail)) {
      return {
        priority: PRIORITY.HIGH,
        label: PRIORITY_LABELS[PRIORITY.HIGH],
        reason: 'Waiting for input',
        action: 'Type your next prompt',
        actionHint: 'input',
        context,
      };
    }

    // --- HIGH: Error detected ---
    const errorMatch = tail.slice(-400).match(/(Error|Failed|ENOENT|EACCES|Permission denied|Command failed|panic|FATAL)[:\s](.{0,100})/i);
    if (errorMatch) {
      return {
        priority: PRIORITY.HIGH,
        label: PRIORITY_LABELS[PRIORITY.HIGH],
        reason: 'Error detected',
        action: 'Investigate error',
        actionHint: 'error',
        context: errorMatch[0].slice(0, 200),
      };
    }

    // --- MEDIUM: Task completed ---
    if (/✓|✔|Done[.!]|Successfully|Completed|finished/i.test(tail.slice(-300))) {
      return {
        priority: PRIORITY.MEDIUM,
        label: PRIORITY_LABELS[PRIORITY.MEDIUM],
        reason: 'Task completed',
        action: 'Review output',
        actionHint: 'review',
        context,
      };
    }

    // --- LOW: Actively working ---
    if (/(Thinking|Working|Running|Reading|Writing|Editing|Searching|Analyzing|Creating|Updating|Compiling|Building|Installing)/i.test(tail.slice(-300))) {
      const workMatch = tail.slice(-300).match(/(Thinking|Working|Running|Reading|Writing|Editing|Searching|Analyzing|Creating|Updating|Compiling|Building|Installing)[^\n]*/i);
      return {
        priority: PRIORITY.LOW,
        label: PRIORITY_LABELS[PRIORITY.LOW],
        reason: workMatch ? workMatch[0].slice(0, 80) : 'Working',
        action: 'No action needed',
        actionHint: 'working',
        context,
      };
    }

    // --- NONE: Idle ---
    return {
      priority: PRIORITY.NONE,
      label: PRIORITY_LABELS[PRIORITY.NONE],
      reason: 'Idle',
      action: 'No action needed',
      actionHint: 'idle',
      context,
    };
  }

  // Called when a session's status changes
  onStatusChange(sessionId, status, meta) {
    if (status === 'exited') {
      const exitCode = meta.exitCode;
      this.states.set(sessionId, {
        sessionId,
        meta,
        priority: exitCode === 0 ? PRIORITY.MEDIUM : PRIORITY.HIGH,
        label: exitCode === 0 ? PRIORITY_LABELS[PRIORITY.MEDIUM] : PRIORITY_LABELS[PRIORITY.HIGH],
        reason: exitCode === 0 ? 'Session ended cleanly' : `Exited with code ${exitCode}`,
        action: exitCode === 0 ? 'Review or restart' : 'Investigate crash',
        actionHint: exitCode === 0 ? 'review' : 'error',
        context: '',
        detectedAt: Date.now(),
      });
      this.onChange?.();
    }
  }

  // Get all sessions ranked by priority (highest first, then longest waiting)
  getRanked() {
    const entries = [];
    for (const [sessionId, state] of this.states) {
      entries.push({ ...state });
    }
    entries.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return (a.detectedAt || 0) - (b.detectedAt || 0);
    });
    return entries;
  }

  // Remove a session from tracking
  remove(sessionId) {
    this.states.delete(sessionId);
    this.buffers.delete(sessionId);
    this.onChange?.();
  }

  // Get state for a single session
  getState(sessionId) {
    return this.states.get(sessionId) || null;
  }
}
