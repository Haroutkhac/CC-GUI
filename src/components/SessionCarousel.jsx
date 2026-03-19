import React, { useEffect } from 'react';

const STATUS_COLORS = {
  idle: '#9E9E9E',
  active: '#4A90D9',
  working: '#4CAF50',
  waiting: '#F5C542',
  exited: '#E53935',
};

const STATUS_LABELS = {
  idle: 'IDLE',
  active: 'ACTIVE',
  working: 'WORKING',
  waiting: 'WAITING',
  exited: 'EXITED',
};

function starterColor(name) {
  const palette = [
    '#E53935', '#4A90D9', '#4CAF50', '#F5C542',
    '#AB47BC', '#FF7043', '#26A69A', '#EC407A',
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

export default function SessionCarousel({
  project,
  sessions,
  summaries,
  onSelectSession,
  onCreateSession,
  onShowOptions,
  onClose,
}) {
  // Keyboard: 1-9 to jump, N to create (ESC handled by App.jsx global handler)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        onCreateSession?.();
        return;
      }
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (idx < sessions.length) {
          e.preventDefault();
          onSelectSession?.(sessions[idx].id);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [sessions, onSelectSession, onCreateSession]);

  return (
    <div style={styles.overlay}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <div style={styles.projectName}>{project?.name || 'Project'}</div>
          <div style={styles.regionTag}>
            {project?.region ? `${project.region} REGION` : ''}
          </div>
        </div>
        <button style={styles.optionsBtn} onClick={() => onShowOptions?.()}>&#x22EF;</button>
        <button style={styles.closeBtn} onClick={() => onClose?.()}>ESC</button>
      </div>

      {/* Session list */}
      <div style={styles.listContainer}>
        {sessions.length === 0 && (
          <div style={styles.emptyState}>
            No sessions yet. Press <kbd style={styles.kbd}>N</kbd> to create one.
          </div>
        )}

        {sessions.map((session, idx) => {
          const summary = summaries?.[session.id] || '';
          const status = session.status || 'idle';
          const color = STATUS_COLORS[status] || STATUS_COLORS.idle;
          const bg = starterColor(session.starter);
          const isWaiting = status === 'waiting';

          return (
            <div
              key={session.id}
              style={{
                ...styles.row,
                ...(isWaiting ? { borderLeftColor: '#F5C542' } : {}),
              }}
              onClick={() => onSelectSession?.(session.id)}
            >
              {/* Number key */}
              <div style={styles.rowNum}>
                {idx < 9 ? (
                  <kbd style={styles.kbd}>{idx + 1}</kbd>
                ) : (
                  <span style={styles.rowNumBlank} />
                )}
              </div>

              {/* Starter icon */}
              <div style={{ ...styles.starterDot, background: bg }}>
                {(session.starter || '?').slice(0, 3)}
              </div>

              {/* Info */}
              <div style={styles.rowInfo}>
                <div style={styles.rowName}>{session.name || 'Unnamed'}</div>
                <div style={styles.rowSummary}>{summary || '\u2014'}</div>
              </div>

              {/* Status badge */}
              <div
                style={{
                  ...styles.statusBadge,
                  background: color,
                  animation: isWaiting ? 'session-pulse 1.5s ease-in-out infinite' : 'none',
                }}
              >
                {STATUS_LABELS[status] || status.toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with New Session */}
      <div style={styles.footer}>
        <button style={styles.newBtn} onClick={() => onCreateSession?.()}>
          <kbd style={styles.kbd}>N</kbd> NEW SESSION
        </button>
      </div>

    </div>
  );
}

const font = "'Press Start 2P', monospace";

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 900,
    background: 'rgba(24, 24, 32, 0.92)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: font,
    color: '#F8F8F0',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px 10px',
    background: '#383838',
    borderBottom: '4px solid #282828',
    flexShrink: 0,
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: 0,
  },
  projectName: {
    fontSize: '13px',
    fontFamily: font,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  regionTag: {
    fontSize: '8px',
    fontFamily: font,
    opacity: 0.65,
    letterSpacing: '1px',
  },
  optionsBtn: {
    background: 'none',
    border: '2px solid #F8F8F0',
    color: '#F8F8F0',
    fontFamily: font,
    fontSize: '14px',
    padding: '4px 10px',
    cursor: 'pointer',
    flexShrink: 0,
    marginLeft: '8px',
    lineHeight: 1,
  },
  closeBtn: {
    background: 'none',
    border: '2px solid #F8F8F0',
    color: '#F8F8F0',
    fontFamily: font,
    fontSize: '9px',
    padding: '6px 10px',
    cursor: 'pointer',
    flexShrink: 0,
    marginLeft: '12px',
  },
  listContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  emptyState: {
    textAlign: 'center',
    fontSize: '10px',
    fontFamily: font,
    color: '#888',
    padding: '40px 20px',
    lineHeight: 2,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    background: 'rgba(248, 248, 240, 0.06)',
    border: '2px solid rgba(248, 248, 240, 0.12)',
    borderLeft: '4px solid rgba(248, 248, 240, 0.12)',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  rowNum: {
    flexShrink: 0,
    width: '24px',
    textAlign: 'center',
  },
  rowNumBlank: {
    display: 'inline-block',
    width: '24px',
  },
  kbd: {
    fontFamily: font,
    fontSize: '8px',
    padding: '2px 5px',
    background: 'rgba(248, 248, 240, 0.15)',
    border: '1px solid rgba(248, 248, 240, 0.3)',
    borderRadius: '2px',
    color: '#F8F8F0',
  },
  starterDot: {
    flexShrink: 0,
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '7px',
    fontFamily: font,
    color: '#F8F8F0',
    textShadow: '1px 1px 0 rgba(0,0,0,0.35)',
    textTransform: 'capitalize',
  },
  rowInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  rowName: {
    fontSize: '10px',
    fontFamily: font,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowSummary: {
    fontSize: '8px',
    fontFamily: font,
    color: '#999',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.4,
  },
  statusBadge: {
    flexShrink: 0,
    fontSize: '7px',
    fontFamily: font,
    color: '#F8F8F0',
    padding: '3px 8px',
    borderRadius: '4px',
    letterSpacing: '0.5px',
  },
  footer: {
    padding: '12px 16px',
    borderTop: '4px solid #282828',
    background: '#383838',
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  newBtn: {
    background: 'none',
    border: '2px dashed rgba(248, 248, 240, 0.4)',
    color: '#F8F8F0',
    fontFamily: font,
    fontSize: '9px',
    padding: '10px 20px',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'background 0.1s',
    width: '100%',
    justifyContent: 'center',
  },
};
