// AI Orchestrator: facade that composes AutoResponder, Summarizer,
// ConflictDetector, Coordinator, and PRCreator into a single interface.

import './types.js';
import { AutoResponder } from './auto-responder.js';
import { Summarizer } from './summarizer.js';
import { ConflictDetector } from './conflict-detector.js';
import { Coordinator } from './coordinator.js';
import { PRCreator } from './pr-creator.js';

export class AIOrchestrator {
  constructor({ terminalManager, gitMonitor, store }) {
    this.store = store;

    // Compose sub-modules
    this.autoResponder = new AutoResponder({ terminalManager });
    this.summarizer = new Summarizer();
    this.conflictDetector = new ConflictDetector({ gitMonitor, store });
    this.coordinator = new Coordinator({ terminalManager, store });
    this.prCreator = new PRCreator({ gitMonitor, store, summarizer: this.summarizer });

    // Wire cross-module dependencies:
    // Summarizer needs diffs from ConflictDetector for context
    this.summarizer._getDiffs = () => this.conflictDetector.diffs;
    // PRCreator needs diffs for sorting in createAllPRs
    this.prCreator._getDiffs = () => this.conflictDetector.diffs;

    // Forward callbacks from sub-modules to the facade's callbacks
    this.onChange = null;
    this.onDiffsChange = null;
    this.onConflictsChange = null;
    this.onPRStatus = null;
    this.onCoordination = null;
    this.onAutoRespond = null;

    // NOTE: These callbacks read this.onChange/onDiffsChange/etc. at call time (late-binding).
    // wireNotifications() sets these properties after construction, which works because
    // the closures capture `this` and dereference the property when invoked, not when defined.
    this.summarizer.onChange = () => this.onChange?.();
    this.conflictDetector.onDiffsChange = () => this.onDiffsChange?.();
    this.conflictDetector.onConflictsChange = () => this.onConflictsChange?.();
    this.prCreator.onPRStatus = (status) => this.onPRStatus?.(status);
    this.coordinator.onCoordination = (entry) => this.onCoordination?.(entry);
    this.autoResponder.onAutoRespond = (entry) => this.onAutoRespond?.(entry);

    // Wire conflict detector to coordinator for conflict warnings
    this.conflictDetector.onNewConflicts = (projectId, projectSessions, overlaps, mergeConflicts) => {
      if (this.coordinator.coordinationEnabled) {
        this.coordinator.handleNewConflicts(projectId, projectSessions, overlaps, mergeConflicts);
      }
    };
  }

  // ========== DELEGATED PROPERTIES ==========

  get autoRespondEnabled() {
    return this.autoResponder.autoRespondEnabled;
  }
  set autoRespondEnabled(value) {
    this.autoResponder.autoRespondEnabled = value;
  }

  get coordinationEnabled() {
    return this.coordinator.coordinationEnabled;
  }
  set coordinationEnabled(value) {
    this.coordinator.coordinationEnabled = value;
  }

  // Expose summarizer timer for shutdown cleanup
  get _timer() {
    return this.summarizer._timer;
  }
  set _timer(value) {
    this.summarizer._timer = value;
  }

  // ========== LIFECYCLE ==========

  startGitMonitor() {
    this.conflictDetector.startPolling();
  }

  stopGitMonitor() {
    this.conflictDetector.stopPolling();
  }

  // ========== TERMINAL INGESTION ==========

  /**
   * @param {string} sessionId
   * @param {string} rawData
   * @param {SessionMeta} meta
   */
  ingest(sessionId, rawData, meta) {
    this.summarizer.ingest(sessionId, rawData, meta);
  }

  /**
   * @param {string} sessionId
   * @param {string} newStatus
   * @param {SessionMeta} meta
   */
  onStatusChange(sessionId, newStatus, meta) {
    this.summarizer.onStatusChange(sessionId, newStatus, meta);
    this.coordinator.onStatusChange(sessionId, newStatus);

    // Trigger immediate git poll on meaningful state changes
    if (['waiting', 'exited'].includes(newStatus)) {
      // _gitPoll has its own internal guard for missing gitMonitor/store
      this.conflictDetector._gitPoll();
    }
  }

  // ========== AUTO-RESPOND ==========

  /**
   * @param {string} sessionId
   * @param {string} cleanTail
   * @returns {boolean}
   */
  checkAutoRespond(sessionId, cleanTail) {
    return this.autoResponder.checkAutoRespond(sessionId, cleanTail);
  }

  // ========== COORDINATION ==========

  sendCoordinationMessage(sessionId, message) {
    return this.coordinator.sendCoordinationMessage(sessionId, message);
  }

  // ========== PR CREATION ==========

  /**
   * @param {string} sessionId
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async createPR(sessionId) {
    return this.prCreator.createPR(sessionId);
  }

  async createAllPRs(projectId) {
    return this.prCreator.createAllPRs(projectId);
  }

  // ========== SUMMARIES ==========

  refreshAll() {
    this.summarizer.refreshAll();
  }

  // ========== PUBLIC GETTERS ==========

  /** @returns {Object<string, SummaryResult>} */
  getSummaries() {
    return this.summarizer.getSummaries();
  }

  getDiffs() {
    return this.conflictDetector.getDiffs();
  }

  getDiffDetail(sessionId) {
    return this.conflictDetector.getDiffDetail(sessionId);
  }

  getBranchStatus() {
    return this.conflictDetector.getBranchStatus();
  }

  getConflicts() {
    return this.conflictDetector.getConflicts();
  }

  getPRStatus() {
    return this.prCreator.getPRStatus();
  }

  getAutoResponses(limit = 20) {
    return this.autoResponder.getAutoResponses(limit);
  }

  getStatus() {
    return {
      autoRespondEnabled: this.autoResponder.autoRespondEnabled,
      coordinationEnabled: this.coordinator.coordinationEnabled,
      summaryCount: Object.keys(this.summarizer.summaries).length,
      pendingCount: this.summarizer.pendingSessions.size,
      processing: this.summarizer._processing,
      trackedSessions: Object.keys(this.conflictDetector.diffs).length,
      conflictProjects: Object.keys(this.conflictDetector.conflicts).length,
    };
  }

  // ========== CLEANUP ==========

  remove(sessionId) {
    this.autoResponder.remove(sessionId);
    this.summarizer.remove(sessionId);
    this.conflictDetector.remove(sessionId);
    this.coordinator.remove(sessionId);
    this.prCreator.remove(sessionId);
  }
}
