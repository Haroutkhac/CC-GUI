import React, { useState, useRef, useCallback, useMemo } from 'react';

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

const SWIPE_THRESHOLD = 50;

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 900,
    background: 'rgba(24, 24, 32, 0.85)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Press Start 2P', monospace",
    color: '#383838',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px 10px',
    background: '#383838',
    color: '#F8F8F0',
    borderBottom: '4px solid #282828',
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
    fontFamily: "'Press Start 2P', monospace",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  regionTag: {
    fontSize: '8px',
    fontFamily: "'Press Start 2P', monospace",
    opacity: 0.65,
    letterSpacing: '1px',
  },
  closeBtn: {
    background: 'none',
    border: '2px solid #F8F8F0',
    color: '#F8F8F0',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '10px',
    padding: '6px 10px',
    cursor: 'pointer',
    flexShrink: 0,
    marginLeft: '12px',
  },
  optionsBtn: {
    background: 'none',
    border: '2px solid #F8F8F0',
    color: '#F8F8F0',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '14px',
    padding: '4px 10px',
    cursor: 'pointer',
    flexShrink: 0,
    marginLeft: '8px',
    lineHeight: 1,
  },
  trackArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    touchAction: 'pan-y',
  },
  track: {
    display: 'flex',
    alignItems: 'center',
    willChange: 'transform',
  },
  card: {
    width: '85vw',
    maxWidth: '380px',
    flexShrink: 0,
    background: '#F8F8F0',
    border: '4px solid #383838',
    borderRadius: '12px',
    padding: '20px 16px 18px',
    margin: '0 6px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 #282828',
    transition: 'box-shadow 0.15s',
    boxSizing: 'border-box',
  },
  cardActive: {
    boxShadow: '6px 6px 0 #282828',
  },
  starterCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: '3px solid #383838',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '9px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#F8F8F0',
    textAlign: 'center',
    lineHeight: 1.3,
    textShadow: '1px 1px 0 rgba(0,0,0,0.35)',
  },
  sessionName: {
    fontSize: '12px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#383838',
    textAlign: 'center',
    wordBreak: 'break-word',
  },
  statusBadge: {
    fontSize: '8px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#F8F8F0',
    padding: '3px 10px',
    borderRadius: '6px',
    letterSpacing: '1px',
    border: '2px solid #383838',
  },
  summaryLine: {
    fontSize: '8px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 1.6,
    minHeight: '26px',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  addCard: {
    width: '85vw',
    maxWidth: '380px',
    flexShrink: 0,
    background: '#F8F8F0',
    border: '4px dashed #9E9E9E',
    borderRadius: '12px',
    padding: '20px 16px 18px',
    margin: '0 6px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    cursor: 'pointer',
    minHeight: '200px',
    boxSizing: 'border-box',
  },
  addIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: '3px dashed #9E9E9E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#9E9E9E',
  },
  addLabel: {
    fontSize: '10px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#9E9E9E',
  },
  arrowIndicator: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '20px',
    fontFamily: "'Press Start 2P', monospace",
    color: 'rgba(248, 248, 240, 0.5)',
    pointerEvents: 'none',
    zIndex: 2,
  },
  arrowLeft: {
    left: '4px',
  },
  arrowRight: {
    right: '4px',
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 0 18px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    border: '2px solid #F8F8F0',
    background: 'transparent',
    transition: 'background 0.2s',
  },
  dotActive: {
    background: '#F8F8F0',
  },
};

// Deterministic color for a starter name
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchRef = useRef({ startX: 0, startY: 0, startTime: 0, moved: false });
  const trackRef = useRef(null);

  // Total cards: sessions + 1 "add" card
  const totalCards = sessions.length + 1;

  const clampIndex = useCallback(
    (idx) => Math.max(0, Math.min(idx, totalCards - 1)),
    [totalCards]
  );

  // Card width calculation: 85vw + 12px margin
  const getCardWidth = useCallback(() => {
    const vw = Math.min(window.innerWidth * 0.85, 380);
    return vw + 12; // card width + horizontal margins
  }, []);

  const getTrackOffset = useCallback(
    (idx) => {
      const cardW = getCardWidth();
      const centerOffset = (window.innerWidth - cardW) / 2;
      return centerOffset - idx * cardW;
    },
    [getCardWidth]
  );

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      moved: false,
    };
    setIsTransitioning(false);
  }, []);

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    const diffX = touch.clientX - touchRef.current.startX;
    const diffY = touch.clientY - touchRef.current.startY;

    // If vertical scroll is dominant, don't hijack
    if (!touchRef.current.moved && Math.abs(diffY) > Math.abs(diffX)) {
      return;
    }

    touchRef.current.moved = true;
    setDragOffset(diffX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    const { moved, startX, startTime } = touchRef.current;

    if (!moved || Math.abs(dragOffset) < 5) {
      // It was a tap, not a swipe. Reset drag.
      setDragOffset(0);
      return;
    }

    const elapsed = Date.now() - startTime;
    const velocity = Math.abs(dragOffset) / Math.max(elapsed, 1);

    let newIndex = currentIndex;

    if (dragOffset < -SWIPE_THRESHOLD || (velocity > 0.4 && dragOffset < 0)) {
      newIndex = clampIndex(currentIndex + 1);
    } else if (dragOffset > SWIPE_THRESHOLD || (velocity > 0.4 && dragOffset > 0)) {
      newIndex = clampIndex(currentIndex - 1);
    }

    setIsTransitioning(true);
    setCurrentIndex(newIndex);
    setDragOffset(0);

    const tid = setTimeout(() => setIsTransitioning(false), 320);
    touchRef.current.transitionTimer = tid;
  }, [dragOffset, currentIndex, clampIndex]);

  // Card tap handler -- only fire if there was no significant swipe
  const handleCardClick = useCallback(
    (index) => {
      if (touchRef.current.moved && Math.abs(dragOffset) > 10) return;

      if (index < sessions.length) {
        onSelectSession?.(sessions[index].id);
      } else {
        onCreateSession?.();
      }
    },
    [sessions, onSelectSession, onCreateSession, dragOffset]
  );

  const trackTransform = useMemo(() => {
    const base = getTrackOffset(currentIndex);
    return `translateX(${base + dragOffset}px)`;
  }, [currentIndex, dragOffset, getTrackOffset]);

  const showLeftArrow = currentIndex > 0;
  const showRightArrow = currentIndex < totalCards - 1;

  // Pulsing animation for waiting status -- inline keyframe via style tag
  const pulseKeyframes = `
    @keyframes carousel-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.45; }
    }
  `;

  return (
    <div className="carousel-overlay" style={styles.overlay}>
      <style>{pulseKeyframes}</style>

      {/* Header */}
      <div className="carousel-header" style={styles.header}>
        <div className="carousel-header-info" style={styles.headerInfo}>
          <div className="carousel-project-name" style={styles.projectName}>
            {project?.name || 'Project'}
          </div>
          <div className="carousel-region" style={styles.regionTag}>
            {project?.region ? `${project.region} REGION` : ''}
          </div>
        </div>
        <button
          className="carousel-options-btn"
          style={styles.optionsBtn}
          onClick={() => onShowOptions?.()}
          aria-label="More options"
        >
          &#x22EF;
        </button>
        <button
          className="carousel-close-btn"
          style={styles.closeBtn}
          onClick={() => onClose?.()}
          aria-label="Close carousel"
        >
          &#x2715;
        </button>
      </div>

      {/* Swipeable track area */}
      <div
        className="carousel-track-area"
        style={styles.trackArea}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left arrow */}
        {showLeftArrow && (
          <div
            className="carousel-arrow carousel-arrow-left"
            style={{ ...styles.arrowIndicator, ...styles.arrowLeft }}
          >
            &#x25C0;
          </div>
        )}

        {/* Right arrow */}
        {showRightArrow && (
          <div
            className="carousel-arrow carousel-arrow-right"
            style={{ ...styles.arrowIndicator, ...styles.arrowRight }}
          >
            &#x25B6;
          </div>
        )}

        {/* Card track */}
        <div
          ref={trackRef}
          className="carousel-track"
          style={{
            ...styles.track,
            transform: trackTransform,
            transition: isTransitioning ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
          }}
        >
          {sessions.map((session, idx) => {
            const summary = summaries?.[session.id] || '';
            const status = session.status || 'idle';
            const color = STATUS_COLORS[status] || STATUS_COLORS.idle;
            const bg = starterColor(session.starter);
            const isActive = idx === currentIndex;
            const isWaiting = status === 'waiting';

            return (
              <div
                key={session.id}
                className={`carousel-card carousel-card-session ${isActive ? 'carousel-card-active' : ''}`}
                style={{
                  ...styles.card,
                  ...(isActive ? styles.cardActive : {}),
                  opacity: isActive ? 1 : 0.7,
                  transform: isActive ? 'scale(1)' : 'scale(0.93)',
                  transition: isTransitioning
                    ? 'opacity 0.3s, transform 0.3s, box-shadow 0.15s'
                    : 'none',
                }}
                onClick={() => handleCardClick(idx)}
              >
                {/* Starter circle */}
                <div
                  className="carousel-starter-circle"
                  style={{ ...styles.starterCircle, background: bg }}
                >
                  {session.starter || '?'}
                </div>

                {/* Session name */}
                <div className="carousel-session-name" style={styles.sessionName}>
                  {session.name || 'Unnamed'}
                </div>

                {/* Status badge */}
                <div
                  className={`carousel-status-badge carousel-status-${status}`}
                  style={{
                    ...styles.statusBadge,
                    background: color,
                    animation: isWaiting ? 'carousel-pulse 1.5s ease-in-out infinite' : 'none',
                  }}
                >
                  {STATUS_LABELS[status] || status.toUpperCase()}
                </div>

                {/* Summary line */}
                <div className="carousel-summary" style={styles.summaryLine}>
                  {summary || '\u2014'}
                </div>
              </div>
            );
          })}

          {/* "+" Add card */}
          <div
            className={`carousel-card carousel-card-add ${currentIndex === sessions.length ? 'carousel-card-active' : ''}`}
            style={{
              ...styles.addCard,
              opacity: currentIndex === sessions.length ? 1 : 0.7,
              transform: currentIndex === sessions.length ? 'scale(1)' : 'scale(0.93)',
              transition: isTransitioning
                ? 'opacity 0.3s, transform 0.3s'
                : 'none',
            }}
            onClick={() => handleCardClick(sessions.length)}
          >
            <div className="carousel-add-icon" style={styles.addIcon}>
              +
            </div>
            <div className="carousel-add-label" style={styles.addLabel}>
              NEW SESSION
            </div>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="carousel-dots" style={styles.dots}>
        {Array.from({ length: totalCards }, (_, i) => (
          <div
            key={i}
            className={`carousel-dot ${i === currentIndex ? 'carousel-dot-active' : ''}`}
            style={{
              ...styles.dot,
              ...(i === currentIndex ? styles.dotActive : {}),
            }}
          />
        ))}
      </div>
    </div>
  );
}
