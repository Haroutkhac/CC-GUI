// Auto-responder: detects Y/n prompts and auto-approves safe ones.

import './types.js';

const AUTO_RESPOND_COOLDOWN_MS = 3000;

export class AutoResponder {
  constructor({ terminalManager, autoRespondEnabled = true }) {
    this.terminalManager = terminalManager;
    this.autoRespondEnabled = autoRespondEnabled;
    this.autoResponses = [];
    this.lastAutoRespondAt = {};
    this.onAutoRespond = null;
  }

  /**
   * @param {string} sessionId
   * @param {string} cleanTail
   * @returns {boolean}
   */
  checkAutoRespond(sessionId, cleanTail) {
    if (!this.autoRespondEnabled) return false;

    const now = Date.now();
    if (this.lastAutoRespondAt[sessionId] && now - this.lastAutoRespondAt[sessionId] < AUTO_RESPOND_COOLDOWN_MS) {
      return false;
    }

    const ynMatch = cleanTail.match(/(.{0,300})\(Y\/n\)\s*$/i);
    if (!ynMatch) return false;

    const promptText = ynMatch[1].trim();

    const dangerous = /push\s*--force|--force-push|delete\s+branch|drop\s+table|rm\s+-rf|reset\s+--hard|git\s+clean|--no-verify|force.*delete/i;
    if (dangerous.test(promptText)) return false;

    try {
      this.terminalManager.write(sessionId, 'Y\n');
    } catch (e) {
      return false;
    }

    this.lastAutoRespondAt[sessionId] = now;

    const entry = {
      sessionId,
      prompt: promptText.slice(-150),
      response: 'Y',
      timestamp: now,
    };
    this.autoResponses.push(entry);
    if (this.autoResponses.length > 200) {
      this.autoResponses = this.autoResponses.slice(-100);
    }

    this.onAutoRespond?.(entry);
    return true;
  }

  getAutoResponses(limit = 20) {
    return this.autoResponses.slice(-limit);
  }

  getStatus() {
    return { autoRespondEnabled: this.autoRespondEnabled };
  }

  remove(sessionId) {
    delete this.lastAutoRespondAt[sessionId];
    this.autoResponses = this.autoResponses.filter(r => r.sessionId !== sessionId);
  }
}
