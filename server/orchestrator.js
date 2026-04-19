// Orchestrator: maps StateDetector granular states to priority levels.
// Single source of truth: StateDetector detects state, Orchestrator ranks priority.
// No direct PTY parsing — all state comes via onStateChange() callback.

import './types.js';

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

export class Orchestrator {
  constructor(options = {}) {
    this.stateDetector = options.stateDetector || null;
    this.states = new Map();    // sessionId -> OrchestratorEntry
    this.onChange = null;        // callback when priorities change
    this._debounceTimer = null;
  }

  /**
   * Called when StateDetector emits a state change.
   * Maps the granular state + detail to a priority level.
   * @param {string} sessionId
   * @param {string} granularState
   * @param {Object|null} detail
   */
  onStateChange(sessionId, granularState, detail) {
    const prev = this.states.get(sessionId);
    const analysis = this._mapPriority(granularState, detail);
    analysis.sessionId = sessionId;

    // Get context from StateDetector's cached clean tail
    if (this.stateDetector) {
      analysis.context = (this.stateDetector.getCleanTail(sessionId) || '').slice(-300);
    } else {
      analysis.context = '';
    }

    // Keep original detectedAt if priority+reason unchanged
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

  /**
   * Pure mapping from (granularState, detail) to priority entry.
   * No regex, no buffer reading — just state-to-priority translation.
   * @param {string} granularState
   * @param {Object|null} detail
   * @returns {Partial<OrchestratorEntry>}
   */
  _mapPriority(granularState, detail) {
    // --- CRITICAL: Y/n confirmation prompts ---
    if (granularState === 'waiting' && detail?.waitingReason === 'yn_prompt') {
      return {
        priority: PRIORITY.CRITICAL,
        label: PRIORITY_LABELS[PRIORITY.CRITICAL],
        reason: 'Confirmation needed',
        action: 'Respond Y or N',
        actionHint: 'Y/n',
      };
    }

    // --- CRITICAL: Permission/approval prompts ---
    if (granularState === 'waiting' && detail?.waitingReason === 'permission_prompt') {
      return {
        priority: PRIORITY.CRITICAL,
        label: PRIORITY_LABELS[PRIORITY.CRITICAL],
        reason: 'Permission request',
        action: 'Approve or deny',
        actionHint: 'approve',
      };
    }

    // --- HIGH: Error states ---
    if (granularState === 'error') {
      const errorReasons = {
        rate_limit: 'Rate limited',
        billing_error: 'Billing error',
        authentication_failed: 'Auth failed',
        server_error: 'Server error',
        max_output_tokens: 'Max output tokens',
        error_max_turns: 'Max turns reached',
        error_max_budget_usd: 'Budget exceeded',
        error_during_execution: 'Execution error',
        error_max_structured_output_retries: 'Max retries exceeded',
      };
      return {
        priority: PRIORITY.HIGH,
        label: PRIORITY_LABELS[PRIORITY.HIGH],
        reason: errorReasons[detail?.errorType] || 'Error',
        action: 'Investigate error',
        actionHint: 'error',
      };
    }

    // --- HIGH: PTY error detected (non-Claude sessions, shell errors) ---
    if (granularState === 'waiting' && detail?.waitingReason === 'error') {
      return {
        priority: PRIORITY.HIGH,
        label: PRIORITY_LABELS[PRIORITY.HIGH],
        reason: 'Error detected',
        action: 'Investigate error',
        actionHint: 'error',
      };
    }

    // --- HIGH: Bare input prompt (>, ❯, ?) ---
    if (granularState === 'waiting' && detail?.waitingReason === 'input_prompt') {
      return {
        priority: PRIORITY.HIGH,
        label: PRIORITY_LABELS[PRIORITY.HIGH],
        reason: 'Waiting for input',
        action: 'Type your next prompt',
        actionHint: 'input',
      };
    }

    // --- MEDIUM: Task completed (PTY detected or transcript result.success) ---
    if (granularState === 'waiting' && detail?.waitingReason === 'completed') {
      return {
        priority: PRIORITY.MEDIUM,
        label: PRIORITY_LABELS[PRIORITY.MEDIUM],
        reason: 'Task completed',
        action: 'Review output',
        actionHint: 'review',
      };
    }

    // --- MEDIUM: Requires action from transcript ---
    if (granularState === 'waiting' && detail?.waitingReason === 'requires_action') {
      return {
        priority: PRIORITY.MEDIUM,
        label: PRIORITY_LABELS[PRIORITY.MEDIUM],
        reason: 'Action required',
        action: 'Review and respond',
        actionHint: 'review',
      };
    }

    // --- MEDIUM: End of turn (finished responding) ---
    if (granularState === 'waiting' && detail?.waitingReason === 'end_turn') {
      return {
        priority: PRIORITY.MEDIUM,
        label: PRIORITY_LABELS[PRIORITY.MEDIUM],
        reason: 'Turn completed',
        action: 'Review when ready',
        actionHint: 'review',
      };
    }

    // --- MEDIUM: Generic waiting (no specific reason) ---
    if (granularState === 'waiting') {
      return {
        priority: PRIORITY.MEDIUM,
        label: PRIORITY_LABELS[PRIORITY.MEDIUM],
        reason: 'Waiting',
        action: 'Review when ready',
        actionHint: 'review',
      };
    }

    // --- LOW: Actively working ---
    if (['thinking', 'tool_running', 'responding', 'compacting', 'api_retry', 'working'].includes(granularState)) {
      let reason;
      switch (granularState) {
        case 'thinking':
          reason = 'Thinking';
          break;
        case 'tool_running':
          reason = detail?.toolName ? `Running ${detail.toolName}` : 'Running tool';
          break;
        case 'responding':
          reason = 'Responding';
          break;
        case 'compacting':
          reason = 'Compacting context';
          break;
        case 'api_retry':
          reason = detail?.retryAttempt
            ? `Retrying (${detail.retryAttempt}/${detail.retryMax || '?'})`
            : 'Retrying API call';
          break;
        default:
          reason = 'Working';
      }
      return {
        priority: PRIORITY.LOW,
        label: PRIORITY_LABELS[PRIORITY.LOW],
        reason,
        action: 'No action needed',
        actionHint: 'working',
      };
    }

    // --- NONE: Idle ---
    return {
      priority: PRIORITY.NONE,
      label: PRIORITY_LABELS[PRIORITY.NONE],
      reason: 'Idle',
      action: 'No action needed',
      actionHint: 'idle',
    };
  }

  /**
   * Called when a session's PTY process exits.
   * Not detected by StateDetector — comes from node-pty onExit callback.
   * @param {string} sessionId
   * @param {string} status - 'completed' or 'exited'
   * @param {SessionMeta} meta
   */
  onExitStatus(sessionId, status, meta) {
    if (status === 'completed') {
      this.states.set(sessionId, {
        sessionId,
        priority: PRIORITY.MEDIUM,
        label: PRIORITY_LABELS[PRIORITY.MEDIUM],
        reason: 'Session completed successfully',
        action: 'Review or restart',
        actionHint: 'review',
        context: '',
        detectedAt: Date.now(),
      });
      this.onChange?.();
    } else if (status === 'exited') {
      const exitCode = meta?.exitCode;
      this.states.set(sessionId, {
        sessionId,
        priority: PRIORITY.HIGH,
        label: PRIORITY_LABELS[PRIORITY.HIGH],
        reason: `Exited with code ${exitCode}`,
        action: 'Investigate crash',
        actionHint: 'error',
        context: '',
        detectedAt: Date.now(),
      });
      this.onChange?.();
    }
  }

  /**
   * Get all sessions ranked by priority (highest first, then longest waiting).
   * @returns {OrchestratorEntry[]}
   */
  getRanked() {
    const entries = [];
    for (const [, state] of this.states) {
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
    this.onChange?.();
  }

  // Get state for a single session
  getState(sessionId) {
    return this.states.get(sessionId) || null;
  }
}
