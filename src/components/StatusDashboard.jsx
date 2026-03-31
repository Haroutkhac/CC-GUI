import React, { useState, useEffect, useRef } from 'react';
import { capitalize } from '../../shared/constants.js';

const STATUS_COLORS = {
  idle: '#808080',
  active: '#3060A0',
  working: '#40A048',
  waiting: '#C08800',
  completed: '#2ECC71',
  exited: '#C04040',
};

export default function StatusDashboard({
  projects, sessions, summaries, aiSummaries, aiStatus,
  aiDiffs, aiBranches, aiConflicts, prStatuses,
  onCreatePR, onSelectSession, onClose, open,
}) {
  if (!open) return null;

  const totalSessions = sessions.length;
  const waitingSessions = sessions.filter(s => s.status === 'waiting');
  const waitingCount = waitingSessions.length;
  const waitingNames = waitingSessions.map(s =>
    s.starter ? capitalize(s.starter) : 'Unknown'
  );
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const completedCount = completedSessions.length;

  // Count total conflicts across all projects
  const totalConflicts = Object.values(aiConflicts || {}).reduce(
    (sum, c) => sum + (c.mergeConflicts?.length || 0), 0
  );
  const totalOverlaps = Object.values(aiConflicts || {}).reduce(
    (sum, c) => sum + (c.overlaps?.length || 0), 0
  );

  // Group sessions by projectId
  const sessionsByProject = {};
  for (const session of sessions) {
    if (!sessionsByProject[session.projectId]) {
      sessionsByProject[session.projectId] = [];
    }
    sessionsByProject[session.projectId].push(session);
  }

  const projectIds = new Set(projects.map(p => p.id));
  const orphanedSessions = sessions.filter(s => !projectIds.has(s.projectId));

  // Flat list for arrow nav
  const flatSessionIds = [];
  for (const project of projects) {
    const projectSessions = sessionsByProject[project.id] || [];
    for (const s of projectSessions) flatSessionIds.push(s.id);
  }
  for (const s of orphanedSessions) flatSessionIds.push(s.id);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (flatSessionIds.length > 0 && selectedIndex >= flatSessionIds.length) {
      setSelectedIndex(flatSessionIds.length - 1);
    }
  }, [flatSessionIds.length, selectedIndex]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault(); e.stopPropagation();
        setSelectedIndex(prev => Math.min(prev + 1, flatSessionIds.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault(); e.stopPropagation();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && flatSessionIds.length > 0) {
        e.preventDefault(); e.stopPropagation();
        onSelectSession(flatSessionIds[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [flatSessionIds, selectedIndex, onSelectSession]);

  useEffect(() => {
    if (!bodyRef.current) return;
    const el = bodyRef.current.querySelector('.dash-session-selected');
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  // Find which sessions have conflicts with which
  const sessionConflictMap = {}; // sessionId -> [{ withSessionId, files }]
  for (const [, data] of Object.entries(aiConflicts || {})) {
    for (const mc of (data.mergeConflicts || [])) {
      if (!sessionConflictMap[mc.sessionA]) sessionConflictMap[mc.sessionA] = [];
      if (!sessionConflictMap[mc.sessionB]) sessionConflictMap[mc.sessionB] = [];
      sessionConflictMap[mc.sessionA].push({ with: mc.sessionB, files: mc.conflicts });
      sessionConflictMap[mc.sessionB].push({ with: mc.sessionA, files: mc.conflicts });
    }
  }

  // Overlap map: sessionId -> [files shared with others]
  const sessionOverlapMap = {};
  for (const [, data] of Object.entries(aiConflicts || {})) {
    for (const overlap of (data.overlaps || [])) {
      for (const sid of overlap.sessionIds) {
        if (!sessionOverlapMap[sid]) sessionOverlapMap[sid] = [];
        sessionOverlapMap[sid].push(overlap.file);
      }
    }
  }

  return (
    <div className="dash-overlay" onClick={onClose}>
      <div className="dash-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="dash-header">
          <div className="dash-header-top">
            <div className="dash-title">TEAM STATUS</div>
            <button className="dash-close" onClick={onClose}>X</button>
          </div>
          <div className="dash-subtitle">
            <span>{totalSessions} total</span>
            {completedCount > 0 && (
              <><span className="dash-sep">&bull;</span><span className="dash-done">{completedCount} done</span></>
            )}
            {waitingCount > 0 && (
              <><span className="dash-sep">&bull;</span><span className="dash-attention">{waitingNames.join(', ')} need{waitingCount === 1 ? 's' : ''} attention!</span></>
            )}
            {totalConflicts > 0 && (
              <><span className="dash-sep">&bull;</span><span className="dash-conflict">{totalConflicts} conflict{totalConflicts > 1 ? 's' : ''}</span></>
            )}
            {totalOverlaps > 0 && totalConflicts === 0 && (
              <><span className="dash-sep">&bull;</span><span className="dash-overlap">{totalOverlaps} file overlap{totalOverlaps > 1 ? 's' : ''}</span></>
            )}
          </div>
          <div className="dash-nav-hint">
            {aiStatus?.safeMode && <span className="dash-safe-mode">SAFE MODE</span>}
            {aiStatus?.safeMode && <span className="dash-sep">&bull;</span>}
            <span>↑↓ navigate</span>
            <span className="dash-sep">&bull;</span>
            <span>ENTER select</span>
            <span className="dash-sep">&bull;</span>
            <span>ESC close</span>
          </div>
        </div>

        {/* Body */}
        <div className="dash-body" ref={bodyRef}>
          {projects.length === 0 && sessions.length === 0 && (
            <div className="dash-empty">No projects or sessions yet.</div>
          )}

          {projects.map(project => {
            const projectSessions = sessionsByProject[project.id] || [];
            const projectConflicts = aiConflicts?.[project.id];
            return (
              <div key={project.id} className="dash-project">
                <div className="dash-project-header">
                  <span className="dash-project-name">{project.name}</span>
                  <span className="dash-project-count">{projectSessions.length}</span>
                  {projectConflicts?.mergeConflicts?.length > 0 && (
                    <span className="dash-conflict-badge">CONFLICTS</span>
                  )}
                </div>

                {projectSessions.length === 0 ? (
                  <div className="dash-no-sessions">No sessions</div>
                ) : (
                  <div className="dash-session-list">
                    {projectSessions.map(session => (
                      <SessionRow
                        key={session.id}
                        session={session}
                        summary={summaries?.[session.id]}
                        aiSummary={aiSummaries?.[session.id]}
                        diff={aiDiffs?.[session.id]}
                        branch={aiBranches?.[session.id]}
                        prStatus={prStatuses?.[session.id]}
                        conflicts={sessionConflictMap[session.id]}
                        overlaps={sessionOverlapMap[session.id]}
                        sessions={sessions}
                        selected={flatSessionIds[selectedIndex] === session.id}
                        onSelect={() => onSelectSession(session.id)}
                        onCreatePR={onCreatePR}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {orphanedSessions.length > 0 && (
            <div className="dash-project">
              <div className="dash-project-header">
                <span className="dash-project-name">UNLINKED</span>
                <span className="dash-project-count">{orphanedSessions.length}</span>
              </div>
              <div className="dash-session-list">
                {orphanedSessions.map(session => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    summary={summaries?.[session.id]}
                    aiSummary={aiSummaries?.[session.id]}
                    diff={aiDiffs?.[session.id]}
                    branch={aiBranches?.[session.id]}
                    prStatus={prStatuses?.[session.id]}
                    conflicts={sessionConflictMap[session.id]}
                    overlaps={sessionOverlapMap[session.id]}
                    sessions={sessions}
                    selected={flatSessionIds[selectedIndex] === session.id}
                    onSelect={() => onSelectSession(session.id)}
                    onCreatePR={onCreatePR}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Human-readable labels for granular states
const GRANULAR_LABELS = {
  thinking: 'thinking',
  tool_running: 'running tool',
  responding: 'responding',
  compacting: 'compacting',
  api_retry: 'retrying',
  working: 'working',
  error: 'error',
  waiting: 'waiting',
  idle: 'idle',
  active: 'active',
  completed: 'completed',
  exited: 'exited',
};

function getGranularLabel(session) {
  const gs = session.granularState;
  const detail = session.stateDetail;
  if (!gs) return session.status;

  if (gs === 'tool_running' && detail?.toolName) {
    return detail.toolName;
  }
  if (gs === 'api_retry' && detail?.retryAttempt) {
    return `retry ${detail.retryAttempt}/${detail.retryMax || '?'}`;
  }
  if (gs === 'error' && detail?.errorType) {
    const errorLabels = {
      rate_limit: 'rate limited',
      billing_error: 'billing error',
      authentication_failed: 'auth failed',
      server_error: 'server error',
      error_max_turns: 'max turns',
      error_max_budget_usd: 'over budget',
      error_during_execution: 'exec error',
    };
    return errorLabels[detail.errorType] || 'error';
  }
  return GRANULAR_LABELS[gs] || session.status;
}

function SessionRow({ session, summary, aiSummary, diff, branch, prStatus, conflicts, overlaps, sessions, selected, onSelect, onCreatePR }) {
  const statusColor = STATUS_COLORS[session.status] || '#808080';
  const isWaiting = session.status === 'waiting';
  const isCompleted = session.status === 'completed';
  const starterName = session.starter
    ? capitalize(session.starter)
    : '???';

  const displaySummary = aiSummary?.summary || summary;
  const displayAction = aiSummary?.action && aiSummary.action !== 'None' ? aiSummary.action : null;

  const hasConflicts = conflicts && conflicts.length > 0;
  const hasOverlaps = overlaps && overlaps.length > 0;
  const hasBranch = branch && branch.commitCount > 0;
  const hasFiles = diff?.changedFiles?.length > 0;

  const prDone = prStatus?.status === 'created';
  const prBusy = prStatus?.status && !['created', 'error'].includes(prStatus.status);
  const prError = prStatus?.status === 'error';

  // Use granular label when available, fall back to status
  const statusLabel = getGranularLabel(session);

  return (
    <button
      className={`dash-session-row ${isWaiting ? 'dash-session-waiting' : ''} ${isCompleted ? 'dash-session-completed' : ''} ${hasConflicts ? 'dash-session-conflict' : ''} ${selected ? 'dash-session-selected' : ''}`}
      onClick={onSelect}
    >
      <div className="dash-session-main">
        <span className="dash-starter">{starterName}</span>
        <span className="dash-session-name">{session.name}</span>
        {session.sessionType === 'protected_agent' && (
          <span className="dash-session-badge">PROTECTED</span>
        )}
        {session.unsafeCommand && session.sessionType !== 'protected_agent' && (
          <span className="dash-session-badge dash-session-badge-unsafe">CUSTOM</span>
        )}
        <span className="dash-status-dot" style={{ backgroundColor: statusColor }} />
        <span className="dash-status-text" style={{ color: statusColor }}>
          {statusLabel}
        </span>
      </div>

      {/* Git info line */}
      {(hasBranch || hasFiles) && (
        <div className="dash-session-git">
          {hasBranch && <span className="dash-git-branch">{branch.commitCount} commit{branch.commitCount > 1 ? 's' : ''}</span>}
          {hasFiles && <span className="dash-git-files">{diff.changedFiles.length} file{diff.changedFiles.length > 1 ? 's' : ''} changed</span>}
          {hasOverlaps && !hasConflicts && (
            <span className="dash-git-overlap">overlap: {overlaps.slice(0, 2).map(f => f.split('/').pop()).join(', ')}{overlaps.length > 2 ? '...' : ''}</span>
          )}
          {hasConflicts && (
            <span className="dash-git-conflict">
              CONFLICT with {conflicts.map(c => {
                const other = sessions.find(s => s.id === c.with);
                return other?.starter ? capitalize(other.starter) : '?';
              }).join(', ')}
            </span>
          )}
        </div>
      )}

      {displaySummary && (
        <div className="dash-session-summary">{displaySummary}</div>
      )}
      {displayAction && (
        <div className="dash-session-action">{'\u2192'} {displayAction}</div>
      )}

      {/* PR status / button */}
      {(hasBranch || prDone || prBusy || prError) && (
        <div className="dash-session-pr">
          {prDone && (
            <span className="dash-pr-done" onClick={e => { e.stopPropagation(); window.open(prStatus.prUrl, '_blank'); }}>
              PR CREATED
            </span>
          )}
          {prBusy && <span className="dash-pr-busy">{prStatus.status.toUpperCase()}...</span>}
          {prError && <span className="dash-pr-error" title={prStatus.error}>PR FAILED</span>}
          {!prDone && !prBusy && hasBranch && session.branch && (
            <span
              className="dash-pr-create"
              onClick={e => { e.stopPropagation(); onCreatePR?.(session.id); }}
            >
              CREATE PR
            </span>
          )}
        </div>
      )}
    </button>
  );
}
