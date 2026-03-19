import React from 'react';

const STATUS_COLORS = {
  idle: '#808080',
  active: '#3060A0',
  working: '#40A048',
  waiting: '#C08800',
  exited: '#C04040',
};

export default function StatusDashboard({ projects, sessions, summaries, onSelectSession, onClose, open }) {
  if (!open) return null;

  const totalSessions = sessions.length;
  const waitingSessions = sessions.filter(s => s.status === 'waiting');
  const waitingCount = waitingSessions.length;
  const waitingNames = waitingSessions.map(s =>
    s.starter ? s.starter.charAt(0).toUpperCase() + s.starter.slice(1) : 'Unknown'
  );

  // Group sessions by projectId
  const sessionsByProject = {};
  for (const session of sessions) {
    if (!sessionsByProject[session.projectId]) {
      sessionsByProject[session.projectId] = [];
    }
    sessionsByProject[session.projectId].push(session);
  }

  // Collect orphaned sessions (no matching project)
  const projectIds = new Set(projects.map(p => p.id));
  const orphanedSessions = sessions.filter(s => !projectIds.has(s.projectId));

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
            {waitingCount > 0 && (
              <>
                <span className="dash-sep">&bull;</span>
                <span className="dash-attention">{waitingNames.join(', ')} need{waitingCount === 1 ? 's' : ''} attention!</span>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="dash-body">
          {projects.length === 0 && sessions.length === 0 && (
            <div className="dash-empty">No projects or sessions yet.</div>
          )}

          {projects.map(project => {
            const projectSessions = sessionsByProject[project.id] || [];
            return (
              <div key={project.id} className="dash-project">
                <div className="dash-project-header">
                  <span className="dash-project-name">{project.name}</span>
                  <span className="dash-project-count">{projectSessions.length}</span>
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
                        onSelect={() => onSelectSession(session.id)}
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
                    onSelect={() => onSelectSession(session.id)}
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

function SessionRow({ session, summary, onSelect }) {
  const statusColor = STATUS_COLORS[session.status] || '#808080';
  const isWaiting = session.status === 'waiting';
  const starterName = session.starter
    ? session.starter.charAt(0).toUpperCase() + session.starter.slice(1)
    : '???';

  return (
    <button
      className={`dash-session-row ${isWaiting ? 'dash-session-waiting' : ''}`}
      onClick={onSelect}
    >
      <div className="dash-session-main">
        <span className="dash-starter">{starterName}</span>
        <span className="dash-session-name">{session.name}</span>
        <span
          className="dash-status-dot"
          style={{ backgroundColor: statusColor }}
        />
        <span className="dash-status-text" style={{ color: statusColor }}>
          {session.status}
        </span>
      </div>
      {summary && (
        <div className="dash-session-summary">{summary}</div>
      )}
    </button>
  );
}
