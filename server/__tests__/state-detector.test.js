import { describe, it, expect, vi } from 'vitest';
import { StateDetector } from '../state-detector.js';

describe('StateDetector._resolveAndEmit', () => {
  function setup() {
    const onChange = vi.fn();
    const detector = new StateDetector({ onStatusChange: onChange });
    return { detector, onChange };
  }

  // Table-driven test for state combinations
  const cases = [
    // [ptyState, transcriptState, expectedStatus, expectedGranular, description]
    ['working', null, 'working', 'working', 'PTY working, no transcript → working'],
    ['waiting', null, 'waiting', 'waiting', 'PTY waiting, no transcript → waiting'],
    ['active', null, 'active', 'active', 'PTY active, no transcript → active'],
    [null, 'thinking', 'working', 'thinking', 'No PTY, transcript thinking → working'],
    [null, 'tool_running', 'working', 'tool_running', 'No PTY, transcript tool_running → working'],
    [null, 'waiting', 'waiting', 'waiting', 'No PTY, transcript waiting → waiting'],
    ['waiting', 'thinking', 'waiting', 'waiting', 'PTY waiting overrides transcript thinking'],
    ['waiting', 'tool_running', 'waiting', 'waiting', 'PTY waiting overrides transcript tool_running'],
    ['working', 'waiting', 'working', 'working', 'PTY working overrides stale transcript waiting'],
    ['active', 'thinking', 'working', 'thinking', 'PTY active, transcript thinking → working (transcript wins)'],
    ['active', 'tool_running', 'working', 'tool_running', 'PTY active, transcript tool_running → working'],
    ['active', 'waiting', 'waiting', 'waiting', 'PTY active, transcript waiting → waiting'],
    [null, null, 'active', 'idle', 'Both null → idle/active'],
  ];

  for (const [pty, transcript, expectedStatus, expectedGranular, desc] of cases) {
    it(desc, () => {
      const { detector, onChange } = setup();
      const sid = 'test-session';

      // Set states directly to avoid triggering PTY detection logic
      const state = detector._getSession(sid);
      state.ptyState = pty;
      state.transcriptState = transcript;
      // Set resolvedStatus to something different from expected so the
      // change is detected and granularState gets updated
      state.resolvedStatus = expectedStatus === 'active' ? 'working' : 'active';

      detector._resolveAndEmit(sid);

      expect(detector.getStatus(sid)).toBe(expectedStatus);
      expect(detector.getGranularState(sid)).toBe(expectedGranular);
    });
  }

  it('clears stale transcript waiting when PTY exits waiting', () => {
    const { detector } = setup();
    const sid = 'test-session';

    const state = detector._getSession(sid);
    state.ptyState = 'waiting';
    state.transcriptState = 'waiting';
    state.resolvedStatus = 'waiting';

    // PTY transitions from waiting to active
    detector._setPtyState(sid, 'active');

    // Transcript state should be cleared
    expect(state.transcriptState).toBeNull();
  });
});

describe('StateDetector waitingReason', () => {
  function setup() {
    const onChange = vi.fn();
    const detector = new StateDetector({ onStatusChange: onChange });
    return { detector, onChange };
  }

  it('sets waitingReason yn_prompt for Y/n PTY prompts', () => {
    const { detector, onChange } = setup();
    const sid = 'test-session';

    const state = detector._getSession(sid);
    state.resolvedStatus = 'active';

    detector._setPtyState(sid, 'waiting', { waitingReason: 'yn_prompt' });

    expect(state.ptyState).toBe('waiting');
    expect(state.ptyDetail).toEqual({ waitingReason: 'yn_prompt' });
    expect(onChange).toHaveBeenCalled();

    const call = onChange.mock.calls[0];
    expect(call[2]).toBe('waiting'); // granularState
    expect(call[3]).toEqual({ waitingReason: 'yn_prompt' }); // detail
  });

  it('sets waitingReason permission_prompt for permission PTY prompts', () => {
    const { detector, onChange } = setup();
    const sid = 'test-session';

    const state = detector._getSession(sid);
    state.resolvedStatus = 'active';

    detector._setPtyState(sid, 'waiting', { waitingReason: 'permission_prompt' });

    expect(state.ptyDetail).toEqual({ waitingReason: 'permission_prompt' });
    const call = onChange.mock.calls[0];
    expect(call[3]).toEqual({ waitingReason: 'permission_prompt' });
  });

  it('sets waitingReason input_prompt for bare > PTY prompts', () => {
    const { detector, onChange } = setup();
    const sid = 'test-session';

    const state = detector._getSession(sid);
    state.resolvedStatus = 'active';

    detector._setPtyState(sid, 'waiting', { waitingReason: 'input_prompt' });

    expect(state.ptyDetail).toEqual({ waitingReason: 'input_prompt' });
    const call = onChange.mock.calls[0];
    expect(call[3]).toEqual({ waitingReason: 'input_prompt' });
  });

  it('sets waitingReason completed for completion PTY detection', () => {
    const { detector, onChange } = setup();
    const sid = 'test-session';

    const state = detector._getSession(sid);
    state.resolvedStatus = 'active';

    detector._setPtyState(sid, 'waiting', { waitingReason: 'completed' });

    expect(state.ptyDetail).toEqual({ waitingReason: 'completed' });
    const call = onChange.mock.calls[0];
    expect(call[3]).toEqual({ waitingReason: 'completed' });
  });

  it('PTY waitingReason overrides transcript waitingReason', () => {
    const { detector, onChange } = setup();
    const sid = 'test-session';

    const state = detector._getSession(sid);
    state.resolvedStatus = 'active';
    state.transcriptState = 'waiting';
    state.transcriptDetail = { waitingReason: 'end_turn', costUsd: 0.5 };
    state.ptyState = 'waiting';
    state.ptyDetail = { waitingReason: 'yn_prompt' };

    detector._resolveAndEmit(sid);

    const call = onChange.mock.calls[0];
    const detail = call[3];
    // PTY yn_prompt should override transcript end_turn
    expect(detail.waitingReason).toBe('yn_prompt');
    // But transcript fields should be preserved
    expect(detail.costUsd).toBe(0.5);
  });

  it('derives waitingReason requires_action from transcript detail', () => {
    const { detector, onChange } = setup();
    const sid = 'test-session';

    const state = detector._getSession(sid);
    state.resolvedStatus = 'active';

    // Simulate transcript state change with requiresAction
    detector._onTranscriptState(sid, 'waiting', { requiresAction: true });

    expect(state.transcriptDetail.waitingReason).toBe('requires_action');
  });

  it('derives waitingReason end_turn from transcript detail without requiresAction', () => {
    const { detector, onChange } = setup();
    const sid = 'test-session';

    const state = detector._getSession(sid);
    state.resolvedStatus = 'active';

    // Simulate transcript state change with end_turn (no requiresAction)
    detector._onTranscriptState(sid, 'waiting', { costUsd: 1.0 });

    expect(state.transcriptDetail.waitingReason).toBe('end_turn');
  });

  it('skips duplicate ptyState + ptyDetail (no re-emit)', () => {
    const { detector, onChange } = setup();
    const sid = 'test-session';

    const state = detector._getSession(sid);
    state.resolvedStatus = 'active';

    // First set
    detector._setPtyState(sid, 'waiting', { waitingReason: 'yn_prompt' });
    expect(onChange).toHaveBeenCalledTimes(1);

    // Same state + same detail — should be skipped
    detector._setPtyState(sid, 'waiting', { waitingReason: 'yn_prompt' });
    expect(onChange).toHaveBeenCalledTimes(1);

    // Different waitingReason — should emit
    detector._setPtyState(sid, 'waiting', { waitingReason: 'input_prompt' });
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
