import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

let _notifIdCounter = 0;

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [orchestratorQueue, setOrchestratorQueue] = useState([]);

  // Force reload when restored from bfcache (back/forward navigation)
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useEffect(() => {
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
      setConnected(false);
    });

    socket.on('projects:updated', (data) => setProjects(data || []));
    socket.on('sessions:updated', (data) => setSessions(data || []));
    socket.on('sessions:summaries', (data) => setSummaries(data || {}));
    socket.on('orchestrator:update', (data) => setOrchestratorQueue(data || []));

    socket.on('notification', (notif) => {
      setNotifications(prev => [...prev.slice(-10), { ...notif, id: `notif-${Date.now()}-${++_notifIdCounter}`, time: new Date() }]);

      // Vibrate on mobile for input_needed
      if (notif.type === 'input_needed') {
        navigator.vibrate?.(200);
        // Pokemon-style beep (reuse single AudioContext)
        try {
          if (!window._ccAudioCtx) window._ccAudioCtx = new AudioContext();
          const actx = window._ccAudioCtx;
          if (actx.state === 'suspended') actx.resume();
          const osc = actx.createOscillator();
          const gain = actx.createGain();
          osc.frequency.value = 880;
          osc.type = 'square';
          gain.gain.value = 0.1;
          osc.connect(gain).connect(actx.destination);
          osc.start();
          setTimeout(() => osc.stop(), 100);
        } catch (e) { /* audio not available */ }
      }

      // Browser notification
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification('Claude Code Guild', {
            body: notif.message,
            icon: '/favicon.ico',
          });
        } catch (e) { /* notification not available */ }
      }
    });

    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('projects:updated');
      socket.off('sessions:updated');
      socket.off('sessions:summaries');
      socket.off('orchestrator:update');
      socket.off('notification');
      socket.close();
    };
  }, []);

  const apiCall = useCallback(async (url, options) => {
    const res = await fetch(url, options);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed: ${res.status}`);
    }
    return res.json();
  }, []);

  const createProject = useCallback((name, path) => {
    return apiCall('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, path }),
    });
  }, [apiCall]);

  const deleteProject = useCallback((id) => {
    return apiCall(`/api/projects/${id}`, { method: 'DELETE' });
  }, [apiCall]);

  const createSession = useCallback((projectId, name, command) => {
    return apiCall('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, name, command }),
    });
  }, [apiCall]);

  const quickCreateSession = useCallback((projectId) => {
    return apiCall('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, name: `Session ${Date.now() % 10000}`, command: 'claude' }),
    });
  }, [apiCall]);

  const deleteSession = useCallback((id) => {
    return apiCall(`/api/sessions/${id}`, { method: 'DELETE' });
  }, [apiCall]);

  const attachTerminal = useCallback((sessionId) => {
    socketRef.current?.emit('terminal:attach', sessionId);
  }, []);

  const detachTerminal = useCallback((sessionId) => {
    socketRef.current?.emit('terminal:detach', sessionId);
  }, []);

  const sendTerminalInput = useCallback((sessionId, data) => {
    socketRef.current?.emit('terminal:input', { sessionId, data });
  }, []);

  const resizeTerminal = useCallback((sessionId, cols, rows) => {
    socketRef.current?.emit('terminal:resize', { sessionId, cols, rows });
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    socket: socketRef.current,
    connected,
    projects,
    sessions,
    summaries,
    notifications,
    orchestratorQueue,
    createProject,
    deleteProject,
    createSession,
    quickCreateSession,
    deleteSession,
    attachTerminal,
    detachTerminal,
    sendTerminalInput,
    resizeTerminal,
    dismissNotification,
  };
}
