import { useEffect, useRef, useState, useMemo } from 'react';
import { drawPokemon } from '../game/sprites.js';

// Renders a pokemon sprite as a visible pixel grid
function PokemonPixelGrid({ starter, cellSize = 3 }) {
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
          const a = data[i + 3];
          if (a > 30) {
            row.push(`rgb(${data[i]},${data[i + 1]},${data[i + 2]})`);
          } else {
            row.push(null);
          }
        }
        grid.push(row);
      }
      setPixels(grid);
    } catch {
      setPixels(null);
    }
  }, [starter]);

  if (!pixels) return <div className="notif-pixel-grid-placeholder" />;

  return (
    <div
      className="notif-pixel-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(16, ${cellSize}px)`,
        gridTemplateRows: `repeat(16, ${cellSize}px)`,
      }}
    >
      {pixels.flat().map((color, i) => (
        <div
          key={i}
          style={{
            width: cellSize,
            height: cellSize,
            background: color || 'transparent',
          }}
        />
      ))}
    </div>
  );
}

export default function NotificationPanel({
  sessions,
  projects,
  aiSummaries,
  notifications,
  onSelectSession,
  onClose,
}) {
  const panelRef = useRef(null);

  // Build feed items from notifications + enrich with session/project data
  const feedItems = useMemo(() => {
    // Dedupe notifications by sessionId, keeping the most recent
    const bySession = new Map();
    for (const notif of notifications) {
      const existing = bySession.get(notif.sessionId);
      if (!existing || new Date(notif.time) > new Date(existing.time)) {
        bySession.set(notif.sessionId, notif);
      }
    }

    // Also add sessions that are in notable states but might not have notifications
    for (const session of sessions) {
      if (['waiting', 'completed', 'working'].includes(session.status) && !bySession.has(session.id)) {
        bySession.set(session.id, {
          id: `feed-${session.id}`,
          sessionId: session.id,
          projectId: session.projectId,
          type: session.status === 'waiting' ? 'input_needed' : session.status,
          message: session.status === 'waiting'
            ? `${capitalize(session.starter || 'Pokemon')} needs your input!`
            : session.status === 'completed'
              ? `${capitalize(session.starter || 'Pokemon')} finished!`
              : `${capitalize(session.starter || 'Pokemon')} is working...`,
          time: new Date(),
        });
      }
    }

    return Array.from(bySession.values())
      .map(notif => {
        const session = sessions.find(s => s.id === notif.sessionId);
        const project = session ? projects.find(p => p.id === session.projectId) : null;
        const summary = aiSummaries[notif.sessionId];

        return {
          ...notif,
          starter: session?.starter,
          sessionName: session?.name,
          sessionStatus: session?.status,
          projectName: project?.name,
          branch: session?.branch || notif.branch,
          summary: summary?.summary,
          needsInput: session?.status === 'waiting',
        };
      })
      .sort((a, b) => {
        // Waiting items first
        if (a.needsInput && !b.needsInput) return -1;
        if (!a.needsInput && b.needsInput) return 1;
        // Then by time (newest first)
        return new Date(b.time || 0) - new Date(a.time || 0);
      })
      .slice(0, 8);
  }, [notifications, sessions, projects, aiSummaries]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Delay to avoid closing on the same click that opened
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  return (
    <div className="notif-panel" ref={panelRef}>
      <div className="notif-panel-header">
        <span className="notif-panel-title">ACTIVITY</span>
        <button className="notif-panel-close" onClick={onClose}>x</button>
      </div>
      <div className="notif-panel-body">
        {feedItems.length === 0 ? (
          <div className="notif-panel-empty">No recent activity</div>
        ) : (
          feedItems.map(item => (
            <button
              key={item.id || item.sessionId}
              className={`notif-item ${item.needsInput ? 'notif-item-urgent' : ''}`}
              onClick={() => onSelectSession(item.sessionId)}
            >
              {item.needsInput && (
                <div className="notif-item-alert">!</div>
              )}
              <div className="notif-item-avatar">
                <PokemonPixelGrid starter={item.starter} cellSize={3} />
              </div>
              <div className="notif-item-content">
                <div className="notif-item-header">
                  <span className="notif-item-project">
                    {item.projectName || 'Unknown'}
                  </span>
                  {item.branch && (
                    <span className="notif-item-branch">{item.branch}</span>
                  )}
                </div>
                <div className="notif-item-summary">
                  {item.summary || item.message || 'No summary available'}
                </div>
                <div className="notif-item-status-row">
                  <span className={`notif-item-status ${item.sessionStatus || ''}`}>
                    {item.sessionStatus || 'unknown'}
                  </span>
                  <span className="notif-item-name">{capitalize(item.starter || '')}</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
