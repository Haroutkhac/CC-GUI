import { describe, it, expect, vi } from 'vitest';
import { Orchestrator, PRIORITY } from '../orchestrator.js';

describe('Orchestrator._mapPriority', () => {
  function setup() {
    const mockStateDetector = {
      getCleanTail: vi.fn().mockReturnValue('some terminal output'),
    };
    const orchestrator = new Orchestrator({ stateDetector: mockStateDetector });
    return { orchestrator };
  }

  // Table-driven: [granularState, detail, expectedPriority, expectedReason, description]
  const cases = [
    // CRITICAL
    ['waiting', { waitingReason: 'yn_prompt' }, PRIORITY.CRITICAL, 'Confirmation needed', 'Y/n prompt → CRITICAL'],
    ['waiting', { waitingReason: 'permission_prompt' }, PRIORITY.CRITICAL, 'Permission request', 'Permission prompt → CRITICAL'],

    // HIGH
    ['error', { errorType: 'rate_limit' }, PRIORITY.HIGH, 'Rate limited', 'Rate limit error → HIGH'],
    ['error', { errorType: 'billing_error' }, PRIORITY.HIGH, 'Billing error', 'Billing error → HIGH'],
    ['error', { errorType: 'authentication_failed' }, PRIORITY.HIGH, 'Auth failed', 'Auth error → HIGH'],
    ['error', { errorType: 'server_error' }, PRIORITY.HIGH, 'Server error', 'Server error → HIGH'],
    ['error', { errorType: 'max_output_tokens' }, PRIORITY.HIGH, 'Max output tokens', 'Max tokens → HIGH'],
    ['error', { errorType: 'error_max_turns' }, PRIORITY.HIGH, 'Max turns reached', 'Max turns → HIGH'],
    ['error', { errorType: 'error_max_budget_usd' }, PRIORITY.HIGH, 'Budget exceeded', 'Budget exceeded → HIGH'],
    ['error', { errorType: 'error_during_execution' }, PRIORITY.HIGH, 'Execution error', 'Execution error → HIGH'],
    ['error', { errorType: 'error_max_structured_output_retries' }, PRIORITY.HIGH, 'Max retries exceeded', 'Max retries → HIGH'],
    ['error', null, PRIORITY.HIGH, 'Error', 'Unknown error → HIGH'],
    ['error', {}, PRIORITY.HIGH, 'Error', 'Empty error detail → HIGH'],
    ['waiting', { waitingReason: 'input_prompt' }, PRIORITY.HIGH, 'Waiting for input', 'Input prompt → HIGH'],

    // MEDIUM
    ['waiting', { waitingReason: 'completed' }, PRIORITY.MEDIUM, 'Task completed', 'Completed → MEDIUM'],
    ['waiting', { waitingReason: 'requires_action' }, PRIORITY.MEDIUM, 'Action required', 'Requires action → MEDIUM'],
    ['waiting', { waitingReason: 'end_turn' }, PRIORITY.MEDIUM, 'Turn completed', 'End turn → MEDIUM'],
    ['waiting', null, PRIORITY.MEDIUM, 'Waiting', 'Generic waiting → MEDIUM'],
    ['waiting', {}, PRIORITY.MEDIUM, 'Waiting', 'Empty waiting detail → MEDIUM'],

    // LOW
    ['thinking', null, PRIORITY.LOW, 'Thinking', 'Thinking → LOW'],
    ['tool_running', { toolName: 'Read' }, PRIORITY.LOW, 'Running Read', 'Tool running Read → LOW'],
    ['tool_running', { toolName: 'Bash' }, PRIORITY.LOW, 'Running Bash', 'Tool running Bash → LOW'],
    ['tool_running', null, PRIORITY.LOW, 'Running tool', 'Tool running no name → LOW'],
    ['responding', null, PRIORITY.LOW, 'Responding', 'Responding → LOW'],
    ['compacting', null, PRIORITY.LOW, 'Compacting context', 'Compacting → LOW'],
    ['api_retry', { retryAttempt: 2, retryMax: 5 }, PRIORITY.LOW, 'Retrying (2/5)', 'API retry with counts → LOW'],
    ['api_retry', null, PRIORITY.LOW, 'Retrying API call', 'API retry no detail → LOW'],
    ['working', null, PRIORITY.LOW, 'Working', 'Generic working → LOW'],

    // NONE
    ['idle', null, PRIORITY.NONE, 'Idle', 'Idle → NONE'],
    ['active', null, PRIORITY.NONE, 'Idle', 'Active → NONE'],
  ];

  for (const [granularState, detail, expectedPriority, expectedReason, desc] of cases) {
    it(desc, () => {
      const { orchestrator } = setup();
      const result = orchestrator._mapPriority(granularState, detail);

      expect(result.priority).toBe(expectedPriority);
      expect(result.reason).toBe(expectedReason);
    });
  }

  // Action hint tests
  it('sets correct actionHints', () => {
    const { orchestrator } = setup();

    expect(orchestrator._mapPriority('waiting', { waitingReason: 'yn_prompt' }).actionHint).toBe('Y/n');
    expect(orchestrator._mapPriority('waiting', { waitingReason: 'permission_prompt' }).actionHint).toBe('approve');
    expect(orchestrator._mapPriority('waiting', { waitingReason: 'input_prompt' }).actionHint).toBe('input');
    expect(orchestrator._mapPriority('error', { errorType: 'rate_limit' }).actionHint).toBe('error');
    expect(orchestrator._mapPriority('waiting', { waitingReason: 'completed' }).actionHint).toBe('review');
    expect(orchestrator._mapPriority('thinking', null).actionHint).toBe('working');
    expect(orchestrator._mapPriority('idle', null).actionHint).toBe('idle');
  });
});

describe('Orchestrator.onStateChange', () => {
  function setup() {
    const mockStateDetector = {
      getCleanTail: vi.fn().mockReturnValue('last 400 chars of output...'),
    };
    const orchestrator = new Orchestrator({ stateDetector: mockStateDetector });
    return { orchestrator, mockStateDetector };
  }

  it('adds entry to states and populates context from StateDetector', () => {
    const { orchestrator, mockStateDetector } = setup();

    orchestrator.onStateChange('s1', 'waiting', { waitingReason: 'yn_prompt' });

    const ranked = orchestrator.getRanked();
    expect(ranked).toHaveLength(1);
    expect(ranked[0].sessionId).toBe('s1');
    expect(ranked[0].priority).toBe(PRIORITY.CRITICAL);
    expect(ranked[0].reason).toBe('Confirmation needed');
    expect(ranked[0].context).toContain('last 400 chars');
    expect(mockStateDetector.getCleanTail).toHaveBeenCalledWith('s1');
  });

  it('preserves detectedAt when priority+reason unchanged', () => {
    const { orchestrator } = setup();

    orchestrator.onStateChange('s1', 'thinking', null);
    const firstDetectedAt = orchestrator.getState('s1').detectedAt;

    // Same state again — detectedAt should be preserved
    orchestrator.onStateChange('s1', 'thinking', null);
    expect(orchestrator.getState('s1').detectedAt).toBe(firstDetectedAt);
  });

  it('updates detectedAt when priority changes', () => {
    const { orchestrator } = setup();

    orchestrator.onStateChange('s1', 'thinking', null);
    const firstDetectedAt = orchestrator.getState('s1').detectedAt;

    // Different state — detectedAt should update
    orchestrator.onStateChange('s1', 'waiting', { waitingReason: 'yn_prompt' });
    expect(orchestrator.getState('s1').detectedAt).toBeGreaterThanOrEqual(firstDetectedAt);
    expect(orchestrator.getState('s1').priority).toBe(PRIORITY.CRITICAL);
  });

  it('debounces onChange callback', () => {
    vi.useFakeTimers();
    const { orchestrator } = setup();
    const onChange = vi.fn();
    orchestrator.onChange = onChange;

    // Rapid fire state changes
    orchestrator.onStateChange('s1', 'thinking', null);
    orchestrator.onStateChange('s2', 'waiting', { waitingReason: 'yn_prompt' });
    orchestrator.onStateChange('s3', 'idle', null);

    // Should not have fired yet (debounced 50ms)
    expect(onChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(onChange).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});

describe('Orchestrator.onExitStatus', () => {
  function setup() {
    const orchestrator = new Orchestrator();
    return { orchestrator };
  }

  it('sets MEDIUM priority for completed sessions', () => {
    const { orchestrator } = setup();

    orchestrator.onExitStatus('s1', 'completed', { exitCode: 0 });

    const state = orchestrator.getState('s1');
    expect(state.priority).toBe(PRIORITY.MEDIUM);
    expect(state.reason).toBe('Session completed successfully');
    expect(state.actionHint).toBe('review');
  });

  it('sets HIGH priority for crashed sessions', () => {
    const { orchestrator } = setup();

    orchestrator.onExitStatus('s1', 'exited', { exitCode: 1 });

    const state = orchestrator.getState('s1');
    expect(state.priority).toBe(PRIORITY.HIGH);
    expect(state.reason).toBe('Exited with code 1');
    expect(state.actionHint).toBe('error');
  });

  it('calls onChange immediately (no debounce)', () => {
    const { orchestrator } = setup();
    const onChange = vi.fn();
    orchestrator.onChange = onChange;

    orchestrator.onExitStatus('s1', 'completed', { exitCode: 0 });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('Orchestrator.getRanked', () => {
  function setup() {
    const mockStateDetector = {
      getCleanTail: vi.fn().mockReturnValue(''),
    };
    const orchestrator = new Orchestrator({ stateDetector: mockStateDetector });
    return { orchestrator };
  }

  it('returns sessions sorted by priority DESC, then detectedAt ASC', () => {
    const { orchestrator } = setup();

    // Add sessions with different priorities
    orchestrator.onStateChange('low', 'thinking', null);
    orchestrator.onStateChange('critical', 'waiting', { waitingReason: 'yn_prompt' });
    orchestrator.onStateChange('medium', 'waiting', { waitingReason: 'end_turn' });
    orchestrator.onStateChange('high', 'error', { errorType: 'rate_limit' });

    const ranked = orchestrator.getRanked();
    expect(ranked[0].sessionId).toBe('critical');
    expect(ranked[1].sessionId).toBe('high');
    expect(ranked[2].sessionId).toBe('medium');
    expect(ranked[3].sessionId).toBe('low');
  });

  it('breaks priority ties by detectedAt (longest waiting first)', () => {
    const { orchestrator } = setup();

    // Two sessions at same priority, first one should rank first
    orchestrator.onStateChange('first', 'thinking', null);

    // Force a slightly later timestamp for second
    const state = orchestrator.getState('first');
    state.detectedAt = Date.now() - 1000; // 1 second earlier

    orchestrator.onStateChange('second', 'responding', null);

    const ranked = orchestrator.getRanked();
    const lowEntries = ranked.filter(e => e.priority === PRIORITY.LOW);
    expect(lowEntries[0].sessionId).toBe('first');
    expect(lowEntries[1].sessionId).toBe('second');
  });
});

describe('Orchestrator.remove', () => {
  it('removes session from tracking and triggers onChange', () => {
    const orchestrator = new Orchestrator();
    const onChange = vi.fn();
    orchestrator.onChange = onChange;

    orchestrator.onExitStatus('s1', 'completed', { exitCode: 0 });
    expect(orchestrator.getState('s1')).not.toBeNull();

    orchestrator.remove('s1');
    expect(orchestrator.getState('s1')).toBeNull();
    expect(orchestrator.getRanked()).toHaveLength(0);
    expect(onChange).toHaveBeenCalled();
  });
});
