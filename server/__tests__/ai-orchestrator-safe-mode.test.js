import { describe, it, expect } from 'vitest';
import { AIOrchestrator } from '../ai-orchestrator.js';

function makeOrchestrator(safeMode) {
  return new AIOrchestrator({
    terminalManager: { on() {}, write() {} },
    gitMonitor: { on() {}, diffs: {} },
    store: {},
    safeModeConfig: { safeMode },
  });
}

describe('AIOrchestrator safe-mode wiring', () => {
  it('disables auto-respond at boot when safe mode is on', () => {
    const orchestrator = makeOrchestrator(true);
    expect(orchestrator.autoRespondEnabled).toBe(false);
    expect(orchestrator.autoResponder.autoRespondEnabled).toBe(false);
  });

  it('enables auto-respond at boot when safe mode is off', () => {
    const orchestrator = makeOrchestrator(false);
    expect(orchestrator.autoRespondEnabled).toBe(true);
    expect(orchestrator.autoResponder.autoRespondEnabled).toBe(true);
  });

  it('allows runtime toggle regardless of initial safe-mode default', () => {
    const orchestrator = makeOrchestrator(true);
    expect(orchestrator.autoRespondEnabled).toBe(false);
    orchestrator.autoRespondEnabled = true;
    expect(orchestrator.autoResponder.autoRespondEnabled).toBe(true);
  });
});
