import { useState, useEffect, useRef } from 'react';
import { capitalize } from '../../shared/constants.js';

const PRIORITY_COLORS = {
  4: '#C04040', // CRITICAL - red
  3: '#C08800', // HIGH - amber
  2: '#3060A0', // MEDIUM - blue
  1: '#40A048', // LOW - green
  0: '#808080', // IDLE - gray
};

const PRIORITY_BG = {
  4: 'rgba(192, 64, 64, 0.08)',
  3: 'rgba(192, 136, 0, 0.06)',
  2: 'rgba(48, 96, 160, 0.04)',
  1: 'transparent',
  0: 'transparent',
};

const HINT_LABELS = {
  'Y/n': 'Y / N',
  'approve': 'APPROVE',
  'input': 'OPEN',
  'error': 'INVESTIGATE',
  'review': 'REVIEW',
  'working': 'WORKING...',
  'idle': 'IDLE',
};

function timeAgo(ts) {
  if (!ts) return '';
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h`;
}

export default function OrchestratorPanel({
  queue, sessions, projects, aiSummaries,
  aiConflicts, aiDiffs, aiBranches, prStatuses,
  onCreatePR, onCreateAllPRs,
  onSelectSession, onClose,
}) {
  // Enrich queue items with session/project metadata
  const enriched = queue.map(item => {
    const session = sessions.find(s => s.id === item.sessionId);
    const project = session ? projects.find(p => p.id === session.projectId) : null;
    return { ...item, session, project };
  }).filter(item => item.session);

  const criticalCount = enriched.filter(e => e.priority >= 3).length;
  const actionableCount = enriched.filter(e => e.priority >= 2).length;

  // Collect all conflicts across projects
  const allConflicts = [];
  const allOverlaps = [];
  for (const [projectId, data] of Object.entries(aiConflicts || {})) {
    const project = projects.find(p => p.id === projectId);
    for (const mc of (data.mergeConflicts || [])) {
      const sA = sessions.find(s => s.id === mc.sessionA);
      const sB = sessions.find(s => s.id === mc.sessionB);
      allConflicts.push({ ...mc, sA, sB, project });
    }
    for (const overlap of (data.overlaps || [])) {
      const overlapSessions = overlap.sessionIds.map(id => sessions.find(s => s.id === id)).filter(Boolean);
      allOverlaps.push({ ...overlap, sessions: overlapSessions, project });
    }
  }

  const [selectedIndex, setSelectedIndex] = useState(0);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (enriched.length > 0 && selectedIndex >= enriched.length) {
      setSelectedIndex(enriched.length - 1);
    }
  }, [enriched.length, selectedIndex]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault(); e.stopPropagation();
        setSelectedIndex(prev => Math.min(prev + 1, enriched.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault(); e.stopPropagation();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && enriched.length > 0) {
        e.preventDefault(); e.stopPropagation();
        onSelectSession(enriched[selectedIndex].sessionId);
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [enriched, selectedIndex, onSelectSession]);

  useEffect(() => {
    if (!bodyRef.current) return;
    const el = bodyRef.current.querySelector('.orch-item-selected');
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  const getName = (session) => session?.starter
    ? capitalize(session.starter)
    : session?.name || '?';

  return (
    <div className="orch-overlay" onClick={onClose}>
      <div className="orch-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="orch-header">
          <div className="orch-header-top">
            <div>
              <div className="orch-title">COMMAND CENTER</div>
              <div className="orch-subtitle">
                {actionableCount > 0 ? (
                  <>
                    <span className={criticalCount > 0 ? 'orch-urgent' : ''}>
                      {actionableCount} need{actionableCount === 1 ? 's' : ''} attention
                    </span>
                    {criticalCount > 0 && (
                      <><span className="orch-sep">&bull;</span><span className="orch-urgent">{criticalCount} urgent</span></>
                    )}
                  </>
                ) : (
                  <span>All clear — nothing needs attention</span>
                )}
                {allConflicts.length > 0 && (
                  <><span className="orch-sep">&bull;</span><span className="orch-conflict">{allConflicts.length} merge conflict{allConflicts.length > 1 ? 's' : ''}</span></>
                )}
              </div>
              <div className="orch-nav-hint">
                <span>↑↓ navigate</span>
                <span className="orch-sep">&bull;</span>
                <span>ENTER select</span>
                <span className="orch-sep">&bull;</span>
                <span>ESC close</span>
              </div>
            </div>
            <button className="orch-close" onClick={onClose}>X</button>
          </div>
        </div>

        {/* Conflict alerts */}
        {(allConflicts.length > 0 || allOverlaps.length > 0) && (
          <div className="orch-conflicts">
            <div className="orch-conflicts-title">GIT ALERTS</div>
            {allConflicts.map((mc, i) => (
              <div key={`mc-${i}`} className="orch-conflict-row orch-conflict-critical">
                <span className="orch-conflict-icon">!!</span>
                <span>
                  Merge conflict: <strong>{getName(mc.sA)}</strong> vs <strong>{getName(mc.sB)}</strong>
                  {mc.conflicts?.length > 0 && (
                    <span className="orch-conflict-files"> in {mc.conflicts.map(c => c.file.split('/').pop()).join(', ')}</span>
                  )}
                </span>
              </div>
            ))}
            {allOverlaps.filter(o => !allConflicts.some(mc =>
              o.sessionIds.includes(mc.sessionA) && o.sessionIds.includes(mc.sessionB)
            )).map((overlap, i) => (
              <div key={`ov-${i}`} className="orch-conflict-row orch-conflict-warn">
                <span className="orch-conflict-icon">!</span>
                <span>
                  {overlap.sessions.map(s => getName(s)).join(' & ')} both editing <strong>{overlap.file.split('/').pop()}</strong>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Queue */}
        <div className="orch-body" ref={bodyRef}>
          {enriched.length === 0 ? (
            <div className="orch-empty">
              {sessions.length === 0
                ? 'No active sessions yet. Create a project and session to get started.'
                : 'All sessions are being monitored. No actions needed right now.'}
            </div>
          ) : (
            enriched.map((item, idx) => {
              const aiSummary = aiSummaries?.[item.sessionId];
              const diff = aiDiffs?.[item.sessionId];
              const branch = aiBranches?.[item.sessionId];
              const pr = prStatuses?.[item.sessionId];
              return (
                <button
                  key={item.sessionId}
                  className={`orch-item ${idx === selectedIndex ? 'orch-item-selected' : ''}`}
                  style={{ background: idx === selectedIndex ? undefined : PRIORITY_BG[item.priority] }}
                  onClick={() => onSelectSession(item.sessionId)}
                >
                  {/* Priority badge */}
                  <div className="orch-item-badge" style={{ borderColor: PRIORITY_COLORS[item.priority] }}>
                    <div
                      className={`orch-item-dot ${item.priority >= 3 ? 'pulse' : ''}`}
                      style={{ background: PRIORITY_COLORS[item.priority] }}
                    />
                  </div>

                  {/* Info */}
                  <div className="orch-item-info">
                    <div className="orch-item-top">
                      <span className="orch-item-name">{getName(item.session)}</span>
                      <span className="orch-item-project">{item.project?.name}</span>
                      {branch?.commitCount > 0 && (
                        <span className="orch-item-git">{branch.commitCount}c {diff?.changedFiles?.length || 0}f</span>
                      )}
                      {item.detectedAt && item.priority >= 2 && (
                        <span className="orch-item-time">{timeAgo(item.detectedAt)}</span>
                      )}
                    </div>
                    <div className="orch-item-reason" style={{ color: PRIORITY_COLORS[item.priority] }}>
                      {item.reason}
                    </div>
                    {aiSummary?.summary && (
                      <div className="orch-item-summary">{aiSummary.summary}</div>
                    )}
                    {item.context && item.priority >= 2 && !aiSummary?.summary && (
                      <div className="orch-item-context">{item.context}</div>
                    )}
                  </div>

                  {/* Action area */}
                  <div className="orch-item-actions">
                    <div
                      className={`orch-item-action ${item.priority >= 3 ? 'urgent' : ''}`}
                      style={{
                        borderColor: PRIORITY_COLORS[item.priority],
                        color: PRIORITY_COLORS[item.priority],
                      }}
                    >
                      {aiSummary?.action && aiSummary.action !== 'None'
                        ? aiSummary.action
                        : (HINT_LABELS[item.actionHint] || item.action)}
                    </div>
                    {pr?.status === 'created' && (
                      <span className="orch-pr-badge orch-pr-done" onClick={e => { e.stopPropagation(); window.open(pr.prUrl, '_blank'); }}>PR</span>
                    )}
                    {pr?.status === 'error' && (
                      <span className="orch-pr-badge orch-pr-error" title={pr.error}>ERR</span>
                    )}
                    {!pr?.status && branch?.commitCount > 0 && item.session?.branch && (
                      <span className="orch-pr-badge orch-pr-create" onClick={e => { e.stopPropagation(); onCreatePR?.(item.sessionId); }}>PR</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
