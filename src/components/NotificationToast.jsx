import { useEffect, useRef, useState } from 'react';

export default function NotificationToast({ notifications, onDismiss, onJump }) {
  return (
    <div className="notification-container">
      {notifications.slice(-5).map(notif => (
        <NotificationItem
          key={notif.id}
          notification={notif}
          onDismiss={() => onDismiss(notif.id)}
          onJump={() => onJump && onJump(notif.sessionId)}
        />
      ))}
    </div>
  );
}

function NotificationItem({ notification, onDismiss, onJump }) {
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
    }, 5000);
    return () => {
      dismissed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
      clearTimeout(fadeTimer);
    };
  }, []);

  const typeIcon = notification.type === 'input_needed' ? '!' : '*';
  const typeClass = notification.type === 'input_needed' ? 'warning' : 'info';

  return (
    <div
      className={`notification-toast ${typeClass} ${visible ? 'visible' : ''}`}
      onClick={onJump}
    >
      <span className="notification-icon">{typeIcon}</span>
      <span className="notification-message">{notification.message}</span>
      <button className="notification-dismiss" onClick={(e) => { e.stopPropagation(); onDismiss(); }}>x</button>
    </div>
  );
}
