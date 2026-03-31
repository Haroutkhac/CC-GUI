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
