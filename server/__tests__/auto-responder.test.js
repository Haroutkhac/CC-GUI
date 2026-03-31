import { describe, it, expect, vi } from 'vitest';
import { AutoResponder } from '../auto-responder.js';

describe('AutoResponder.checkAutoRespond', () => {
  function setup() {
    const written = [];
    const terminalManager = {
      write: vi.fn((sessionId, data) => written.push({ sessionId, data })),
    };
    const responder = new AutoResponder({ terminalManager });
    return { responder, terminalManager, written };
  }

  it('auto-responds Y to safe Y/n prompt', () => {
    const { responder, written } = setup();
    const result = responder.checkAutoRespond('s1', 'Edit server/utils.js? (Y/n)');
    expect(result).toBe(true);
    expect(written).toHaveLength(1);
    expect(written[0].data).toBe('Y\n');
  });

  it('rejects when auto-respond is disabled', () => {
    const { responder, written } = setup();
    responder.autoRespondEnabled = false;
    const result = responder.checkAutoRespond('s1', 'Edit file? (Y/n)');
    expect(result).toBe(false);
    expect(written).toHaveLength(0);
  });

  it('rejects prompts without Y/n pattern', () => {
    const { responder, written } = setup();
    const result = responder.checkAutoRespond('s1', 'What do you want to do?');
    expect(result).toBe(false);
    expect(written).toHaveLength(0);
  });

  // Dangerous command tests
  const dangerousCases = [
    ['git push --force to remote? (Y/n)', 'push --force'],
    ['git push --force-push? (Y/n)', '--force-push'],
    ['delete branch main? (Y/n)', 'delete branch'],
    ['DROP TABLE users; (Y/n)', 'drop table'],
    ['rm -rf /tmp/project? (Y/n)', 'rm -rf'],
    ['git reset --hard HEAD~1? (Y/n)', 'reset --hard'],
    ['git clean -fd? (Y/n)', 'git clean'],
    ['skip hooks --no-verify? (Y/n)', '--no-verify'],
    ['force delete the branch? (Y/n)', 'force delete'],
  ];

  for (const [prompt, desc] of dangerousCases) {
    it(`blocks dangerous: ${desc}`, () => {
      const { responder, written } = setup();
      const result = responder.checkAutoRespond('s1', prompt);
      expect(result).toBe(false);
      expect(written).toHaveLength(0);
    });
  }

  // Safe prompts that should be approved
  const safeCases = [
    'Create file src/utils.js? (Y/n)',
    'Edit server/index.js? (Y/n)',
    'Run npm install? (Y/n)',
    'Apply changes? (Y/n)',
    'Write to disk? (Y/n)',
  ];

  for (const prompt of safeCases) {
    it(`approves safe: ${prompt.slice(0, 40)}`, () => {
      const { responder, written } = setup();
      const result = responder.checkAutoRespond('s1', prompt);
      expect(result).toBe(true);
      expect(written).toHaveLength(1);
    });
  }

  it('respects cooldown between auto-responds', () => {
    const { responder } = setup();
    responder.checkAutoRespond('s1', 'Edit file? (Y/n)');
    // Immediate second call should be blocked by cooldown
    const result = responder.checkAutoRespond('s1', 'Edit another file? (Y/n)');
    expect(result).toBe(false);
  });

  it('tracks auto-response history', () => {
    const { responder } = setup();
    responder.checkAutoRespond('s1', 'Edit file? (Y/n)');
    const responses = responder.getAutoResponses();
    expect(responses).toHaveLength(1);
    expect(responses[0].sessionId).toBe('s1');
    expect(responses[0].response).toBe('Y');
  });
});
