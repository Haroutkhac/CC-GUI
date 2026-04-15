import { useMemo } from 'react';
import { capitalize } from '../../shared/constants.js';
import AlertsSection from './AlertsSection.jsx';

const PRIORITY_COLORS = {
  4: '#C04040',
  3: '#C08800',
  2: '#3060A0',
  1: '#40A048',
  0: '#808080',
};

const HINT_LABELS = {
  'Y/n': 'Y/N',
  'approve': 'APPROVE',
  'input': 'INPUT',
  'error': 'ERROR',
  'review': 'REVIEW',
  'working': 'WORKING',
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

export default function ActivitySidebar({
  sessions,
  projects,
  notifications,
  orchestratorQueue,
  aiSummaries,
  onSelectSession,
  onDismissNotification,
}) {
  // === FLAT QUEUE (across all projects, sorted by priority) ===
  const queueItems = useMemo(() => {
    return (orchestratorQueue || [])
      .map(item => {
        const session = sessions.find(s => s.id === item.sessionId);
        if (!session) return null;
        const project = projects.find(p => p.id === session.projectId);
        return { ...item, session, project };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return (b.detectedAt || 0) - (a.detectedAt || 0);
      });
  }, [orchestratorQueue, sessions, projects]);

  return (
    <div className="activity-sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">ACTIVITY</span>
      </div>

      <div className="sidebar-scroll">
        <AlertsSection
          notifications={notifications}
          onDismiss={onDismissNotification}
          onJump={onSelectSession}
        />

        <div className="sidebar-section">
          <div className="sidebar-section-title">QUEUE</div>
          {queueItems.length === 0 ? (
            <div className="sidebar-empty">All clear</div>
          ) : (
            queueItems.map(item => {
              const summary = aiSummaries?.[item.sessionId];
              return (
                <button
                  key={item.sessionId}
                  className="sidebar-queue-item"
                  onClick={() => onSelectSession(item.sessionId)}
                >
                  <div
                    className={`sidebar-dot-sm ${item.priority >= 3 ? 'blink' : ''}`}
                    style={{ background: PRIORITY_COLORS[item.priority] }}
                  />
                  <div className="sidebar-queue-info">
                    <div className="sidebar-queue-top">
                      <span className="sidebar-queue-name">
                        {capitalize(item.session?.starter || item.session?.name || '?')}
                      </span>
                      {item.project?.name && (
                        <span className="sidebar-queue-project">/ {item.project.name}</span>
                      )}
                      {item.detectedAt && (
                        <span className="sidebar-queue-time">{timeAgo(item.detectedAt)}</span>
                      )}
                    </div>
                    <div
                      className="sidebar-queue-reason"
                      style={{ color: PRIORITY_COLORS[item.priority] }}
                    >
                      {item.reason}
                    </div>
                    {summary?.summary && (
                      <div className="sidebar-queue-summary">{summary.summary}</div>
                    )}
                    <span
                      className="sidebar-queue-hint"
                      style={{
                        borderColor: PRIORITY_COLORS[item.priority],
                        color: PRIORITY_COLORS[item.priority],
                      }}
                    >
                      {summary?.action && summary.action !== 'None'
                        ? summary.action
                        : (HINT_LABELS[item.actionHint] || '')}
                    </span>
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
