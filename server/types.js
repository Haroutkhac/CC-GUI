/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} path
 * @property {string} region
 * @property {string[]} starters
 * @property {string} createdAt - ISO date string
 */

/**
 * @typedef {Object} Session
 * @property {string} id
 * @property {string} projectId
 * @property {string} name
 * @property {string} command
 * @property {'idle'|'active'|'working'|'waiting'|'completed'|'exited'} status
 * @property {string} starter
 * @property {string|null} claudeSessionId
 * @property {string} createdAt - ISO date string
 * @property {string} [worktreePath]
 * @property {string} [branch]
 * @property {number} [exitCode]
 * @property {string} [prUrl]
 */

/**
 * @typedef {Object} SessionMeta
 * @property {string} [sessionName]
 * @property {string} [projectName]
 * @property {string} [projectId]
 * @property {number} [exitCode]
 * @property {string} [status]
 */

/**
 * @typedef {Object} DetectionState
 * @property {string|null} ptyState
 * @property {string|null} transcriptState
 * @property {string} resolvedStatus
 * @property {string} granularState
 * @property {number} lastSpinnerTime
 * @property {ReturnType<typeof setTimeout>|null} cooldownTimer
 * @property {string} [_cleanCache]
 * @property {number} [lastClearTime]
 */

/**
 * @typedef {Object} OrchestratorEntry
 * @property {string} sessionId
 * @property {SessionMeta} meta
 * @property {number} priority
 * @property {string} label
 * @property {string} reason
 * @property {string} action
 * @property {string} actionHint
 * @property {string} context
 * @property {number} detectedAt
 */

/**
 * @typedef {Object} DiffInfo
 * @property {Array<{path: string, insertions: number, deletions: number}>} files
 * @property {string[]} changedFiles
 * @property {string} summary
 * @property {string} rawDiff
 * @property {number} lastCheckedAt
 */

/**
 * @typedef {Object} BranchStatus
 * @property {number} commitCount
 * @property {Array<{hash: string, message: string}>} commits
 * @property {string} base
 * @property {number} [lastCheckedAt]
 */

/**
 * @typedef {Object} SummaryResult
 * @property {string} summary
 * @property {string} action
 * @property {number} updatedAt
 */

/**
 * @typedef {Object} PRStatus
 * @property {'checking'|'rebasing'|'generating'|'pushing'|'creating'|'created'|'error'} status
 * @property {string|null} prUrl
 * @property {string|null} error
 * @property {number} updatedAt
 */

/**
 * @typedef {Object} ConflictInfo
 * @property {Array<{file: string, sessionIds: string[]}>} overlaps
 * @property {Array<{sessionA: string, sessionB: string, conflicts: Array<{file: string}>}>} mergeConflicts
 * @property {number} lastCheckedAt
 */
