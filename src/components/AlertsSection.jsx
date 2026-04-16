import { useEffect, useRef, useState } from 'react';

export default function AlertsSection({ notifications, onDismiss, onJump }) {
  const recent = notifications.slice(-5).reverse();
  if (recent.length === 0) return null;

  return (
    <div className="sidebar-alerts">
      <div className="sidebar-section-title">ALERTS</div>
      {recent.map(notif => (
        <AlertItem
          key={notif.id}
          notification={notif}
          onDismiss={() => onDismiss(notif.id)}
          onJump={() => onJump && onJump(notif.sessionId)}
        />
      ))}
    </div>
  );
}

function AlertItem({ notification, onDismiss, onJump }) {
  const [visible, setVisible] = useState(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    let dismissed = false;
    let fadeTimer;
    const rafId = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      fadeTimer = setTimeout(() => {
        if (!dismissed) onDismissRef.current();
      }, 300);
    }, 8000);
    return () => {
      dismissed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
      clearTimeout(fadeTimer);
    };
  }, []);

  const typeIcon = notification.type === 'input_needed' ? '!' : notification.type === 'completed' ? '✓' : '*';
  const typeClass = notification.type === 'input_needed' ? 'warning' : notification.type === 'completed' ? 'success' : 'info';

  return (
    <div
      className={`sidebar-alert ${typeClass} ${visible ? 'visible' : ''}`}
      onClick={onJump}
    >
      <span className="sidebar-alert-icon">{typeIcon}</span>
      <span className="sidebar-alert-msg">{notification.message}</span>
      <button className="sidebar-alert-dismiss" onClick={(e) => { e.stopPropagation(); onDismiss(); }}>x</button>
    </div>
  );
}
