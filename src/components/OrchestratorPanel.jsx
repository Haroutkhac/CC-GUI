import React from 'react';

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

export default function OrchestratorPanel({ queue, sessions, projects, onSelectSession, onClose }) {
  // Enrich queue items with session/project metadata
  const enriched = queue.map(item => {
    const session = sessions.find(s => s.id === item.sessionId);
    const project = session ? projects.find(p => p.id === session.projectId) : null;
    return { ...item, session, project };
  }).filter(item => item.session); // filter out orphaned entries

  const criticalCount = enriched.filter(e => e.priority >= 3).length;
  const actionableCount = enriched.filter(e => e.priority >= 2).length;

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
                      <>
                        <span className="orch-sep">&bull;</span>
                        <span className="orch-urgent">{criticalCount} urgent</span>
                      </>
                    )}
                  </>
                ) : (
                  <span>All clear — nothing needs attention</span>
                )}
              </div>
            </div>
            <button className="orch-close" onClick={onClose}>X</button>
          </div>
        </div>

        {/* Queue */}
        <div className="orch-body">
          {enriched.length === 0 ? (
            <div className="orch-empty">
              No active sessions yet. Create a project and session to get started.
            </div>
          ) : (
            enriched.map(item => (
              <button
                key={item.sessionId}
                className="orch-item"
                style={{ background: PRIORITY_BG[item.priority] }}
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
                    <span className="orch-item-name">{item.session?.name}</span>
                    <span className="orch-item-project">{item.project?.name}</span>
                    {item.detectedAt && item.priority >= 2 && (
                      <span className="orch-item-time">{timeAgo(item.detectedAt)}</span>
                    )}
                  </div>
                  <div className="orch-item-reason" style={{ color: PRIORITY_COLORS[item.priority] }}>
                    {item.reason}
                  </div>
                  {item.context && item.priority >= 2 && (
                    <div className="orch-item-context">{item.context}</div>
                  )}
                </div>

                {/* Action button */}
                <div
                  className={`orch-item-action ${item.priority >= 3 ? 'urgent' : ''}`}
                  style={{
                    borderColor: PRIORITY_COLORS[item.priority],
                    color: PRIORITY_COLORS[item.priority],
                  }}
                >
                  {HINT_LABELS[item.actionHint] || item.action}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
