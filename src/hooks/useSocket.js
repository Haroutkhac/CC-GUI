import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('projects:updated', (data) => setProjects(data));
    socket.on('sessions:updated', (data) => setSessions(data));
    socket.on('sessions:summaries', (data) => setSummaries(data));

    socket.on('notification', (notif) => {
      setNotifications(prev => [...prev.slice(-10), { ...notif, id: Date.now(), time: new Date() }]);

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
      if (Notification.permission === 'granted') {
        new Notification('Claude Code Guild', {
          body: notif.message,
          icon: '/favicon.ico',
        });
      }
    });

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('projects:updated');
      socket.off('sessions:updated');
      socket.off('sessions:summaries');
      socket.off('notification');
      socket.close();
    };
  }, []);

  const createProject = useCallback(async (name, path) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, path }),
    });
    return res.json();
  }, []);

  const deleteProject = useCallback(async (id) => {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
  }, []);

  const createSession = useCallback(async (projectId, name, command) => {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, name, command }),
    });
    return res.json();
  }, []);

  // Quick create: auto-name, default command, return session immediately
  const quickCreateSession = useCallback(async (projectId) => {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, name: `Session ${Date.now() % 10000}`, command: 'claude' }),
    });
    return res.json();
  }, []);

  const deleteSession = useCallback(async (id) => {
    await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
  }, []);

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
