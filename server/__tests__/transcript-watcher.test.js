import { describe, it, expect, vi } from 'vitest';
import { TranscriptWatcher } from '../transcript-watcher.js';

describe('TranscriptWatcher._processEvent', () => {
  function setup() {
    const onStateChange = vi.fn();
    const watcher = new TranscriptWatcher({ onStateChange });
    const entry = { state: null }; // minimal entry for _processEvent
    return { watcher, onStateChange, entry };
  }

  it('detects thinking state from assistant event with thinking block', () => {
    const { watcher, onStateChange, entry } = setup();
    watcher._processEvent('s1', entry, {
      type: 'assistant',
      message: {
        content: [{ type: 'thinking', thinking: 'Let me analyze...' }],
      },
    });
    expect(onStateChange).toHaveBeenCalledWith('s1', 'thinking', null);
    expect(entry.state).toBe('thinking');
  });

  it('detects tool_running from assistant event with tool_use block', () => {
    const { watcher, onStateChange, entry } = setup();
    watcher._processEvent('s1', entry, {
      type: 'assistant',
      message: {
        content: [{ type: 'tool_use', name: 'read_file' }],
      },
    });
    expect(onStateChange).toHaveBeenCalledWith('s1', 'tool_running', {
      toolName: 'read_file',
      toolInput: null,
    });
  });

  it('detects waiting from end_turn stop_reason', () => {
    const { watcher, onStateChange, entry } = setup();
    watcher._processEvent('s1', entry, {
      type: 'assistant',
      message: {
        content: [{ type: 'text', text: 'Done!' }],
        stop_reason: 'end_turn',
      },
    });
    expect(onStateChange).toHaveBeenCalledWith('s1', 'waiting', null);
  });

  it('tool_use + end_turn → waiting (end_turn overwrites)', () => {
    // This tests the behavior where tool_use sets tool_running but
    // end_turn on same event immediately overwrites to waiting
    const { watcher, onStateChange, entry } = setup();
    watcher._processEvent('s1', entry, {
      type: 'assistant',
      message: {
        content: [{ type: 'tool_use', name: 'write_file' }],
        stop_reason: 'end_turn',
      },
    });
    // The last assignment wins — end_turn sets waiting
    expect(entry.state).toBe('waiting');
  });

  it('ignores non-assistant events', () => {
    const { watcher, onStateChange, entry } = setup();
    watcher._processEvent('s1', entry, {
      type: 'user',
      message: { content: 'hello' },
    });
    expect(onStateChange).not.toHaveBeenCalled();
    expect(entry.state).toBeNull();
  });

  it('tool_use takes priority over thinking when both present', () => {
    const { watcher, onStateChange, entry } = setup();
    watcher._processEvent('s1', entry, {
      type: 'assistant',
      message: {
        content: [
          { type: 'thinking', thinking: 'Let me think...' },
          { type: 'tool_use', name: 'read_file' },
        ],
      },
    });
    expect(entry.state).toBe('tool_running');
  });

  it('does not emit if state unchanged', () => {
    const { watcher, onStateChange, entry } = setup();
    entry.state = 'thinking';
    watcher._processEvent('s1', entry, {
      type: 'assistant',
      message: { content: [{ type: 'thinking', thinking: 'more...' }] },
    });
    expect(onStateChange).not.toHaveBeenCalled(); // same state, no emit
  });
});
