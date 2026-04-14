import { useState, useEffect, useMemo } from 'react';
import { drawPokemon } from '../game/sprites.js';
import { capitalize } from '../../shared/constants.js';

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

// Tiny pokemon pixel grid for sidebar items
function PixelAvatar({ starter, size = 2 }) {
  const [pixels, setPixels] = useState(null);

  useEffect(() => {
    if (!starter) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      drawPokemon(ctx, 0, 0, starter, 1);
      const imageData = ctx.getImageData(0, 0, 16, 16);
      const data = imageData.data;
      const grid = [];
      for (let y = 0; y < 16; y++) {
        const row = [];
        for (let x = 0; x < 16; x++) {
          const i = (y * 16 + x) * 4;
          if (data[i + 3] > 30) {
            row.push(`rgb(${data[i]},${data[i + 1]},${data[i + 2]})`);
          } else {
            row.push(null);
          }
        }
        grid.push(row);
      }
      setPixels(grid);
    } catch { setPixels(null); }
  }, [starter]);

  if (!pixels) return <div style={{ width: 16 * size, height: 16 * size }} />;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(16, ${size}px)`,
        gridTemplateRows: `repeat(16, ${size}px)`,
        flexShrink: 0,
      }}
    >
      {pixels.flat().map((color, i) => (
        <div key={i} style={{ width: size, height: size, background: color || 'transparent' }} />
      ))}
    </div>
  );
}

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
  expanded,
  onToggleExpand,
  onSelectSession,
}) {
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());

  // === NOTIFICATION FEED ===
  const feedItems = useMemo(() => {
    const bySession = new Map();
    for (const notif of notifications) {
      const existing = bySession.get(notif.sessionId);
      if (!existing || new Date(notif.time) > new Date(existing.time)) {
        bySession.set(notif.sessionId, notif);
      }
    }
    for (const session of sessions) {
      if (['waiting', 'completed'].includes(session.status) && !bySession.has(session.id)) {
        bySession.set(session.id, {
          id: `feed-${session.id}`,
          sessionId: session.id,
          projectId: session.projectId,
          type: session.status === 'waiting' ? 'input_needed' : session.status,
          message: session.status === 'waiting'
            ? `${capitalize(session.starter || 'Pokemon')} needs input!`
            : `${capitalize(session.starter || 'Pokemon')} finished!`,
          time: new Date(),
        });
      }
    }
    return Array.from(bySession.values())
      .map(notif => {
        const session = sessions.find(s => s.id === notif.sessionId);
        const project = session ? projects.find(p => p.id === session.projectId) : null;
        const summary = aiSummaries?.[notif.sessionId];
        return {
          ...notif,
          starter: session?.starter,
          sessionStatus: session?.status,
          projectName: project?.name,
          summary: summary?.summary,
          needsInput: session?.status === 'waiting',
        };
      })
      .sort((a, b) => {
        if (a.needsInput && !b.needsInput) return -1;
        if (!a.needsInput && b.needsInput) return 1;
        return new Date(b.time || 0) - new Date(a.time || 0);
      })
      .slice(0, 6);
  }, [notifications, sessions, projects, aiSummaries]);

  // === ORCHESTRATOR BY PROJECT ===
  const projectGroups = useMemo(() => {
    const groups = new Map();

    // Initialize groups for all projects
    for (const project of projects) {
      groups.set(project.id, {
        project,
        items: [],
        highestPriority: 0,
        actionableCount: 0,
      });
    }

    // Place queue items into their project groups
    for (const item of orchestratorQueue) {
      const session = sessions.find(s => s.id === item.sessionId);
      if (!session) continue;
      const group = groups.get(session.projectId);
      if (!group) continue;
      const enriched = { ...item, session };
      group.items.push(enriched);
      if (item.priority > group.highestPriority) group.highestPriority = item.priority;
      if (item.priority >= 2) group.actionableCount++;
    }

    // Sort: projects with highest priority first, then alphabetical
    return Array.from(groups.values())
      .filter(g => g.items.length > 0)
      .sort((a, b) => {
        if (b.highestPriority !== a.highestPriority) return b.highestPriority - a.highestPriority;
        return (a.project.name || '').localeCompare(b.project.name || '');
      });
  }, [orchestratorQueue, sessions, projects]);

  const toggleGroup = (projectId) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  return (
    <div className={`activity-sidebar ${expanded ? 'expanded' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <span className="sidebar-title">ACTIVITY</span>
        <button className="sidebar-toggle" onClick={onToggleExpand}>
          {expanded ? '»' : '«'}
        </button>
      </div>

      <div className="sidebar-scroll">
        {/* Notification Feed */}
        {feedItems.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">RECENT</div>
            {feedItems.map(item => (
              <button
                key={item.id || item.sessionId}
                className={`sidebar-notif ${item.needsInput ? 'urgent' : ''}`}
                onClick={() => onSelectSession(item.sessionId)}
              >
                <div
                  className={`sidebar-dot ${item.needsInput ? 'blink' : ''}`}
                  style={{ background: item.needsInput ? '#C08800' : item.sessionStatus === 'completed' ? '#2ECC71' : '#3060A0' }}
                />
                <PixelAvatar starter={item.starter} size={3} />
                <div className="sidebar-notif-text">
                  <span className="sidebar-notif-name">{capitalize(item.starter || '?')}</span>
                  {expanded && (
                    <span className="sidebar-notif-msg">
                      {item.summary || item.message || ''}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="sidebar-divider">
          <span className="sidebar-section-title">TABLES</span>
        </div>

        {/* Per-Project Orchestrator */}
        {projectGroups.length === 0 ? (
          <div className="sidebar-empty">No active tables</div>
        ) : (
          projectGroups.map(group => {
            const isCollapsed = collapsedGroups.has(group.project.id);
            return (
              <div key={group.project.id} className="sidebar-project">
                <button
                  className="sidebar-project-header"
                  onClick={() => toggleGroup(group.project.id)}
                >
                  <div
                    className={`sidebar-dot ${group.highestPriority >= 3 ? 'blink' : ''}`}
                    style={{ background: PRIORITY_COLORS[group.highestPriority] }}
                  />
                  <span className="sidebar-project-name">
                    {group.project.name || 'Unknown'}
                  </span>
                  {group.actionableCount > 0 && (
                    <span
                      className="sidebar-project-badge"
                      style={{
                        background: PRIORITY_COLORS[group.highestPriority],
                      }}
                    >
                      {group.actionableCount}
                    </span>
                  )}
                  <span className="sidebar-chevron">{isCollapsed ? '▶' : '▼'}</span>
                </button>

                {!isCollapsed && (
                  <div className="sidebar-project-items">
                    {group.items
                      .sort((a, b) => b.priority - a.priority)
                      .map(item => {
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
                                {item.priority >= 2 && item.detectedAt && (
                                  <span className="sidebar-queue-time">{timeAgo(item.detectedAt)}</span>
                                )}
                              </div>
                              <div
                                className="sidebar-queue-reason"
                                style={{ color: PRIORITY_COLORS[item.priority] }}
                              >
                                {item.reason}
                              </div>
                              {expanded && summary?.summary && (
                                <div className="sidebar-queue-summary">{summary.summary}</div>
                              )}
                            </div>
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
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
