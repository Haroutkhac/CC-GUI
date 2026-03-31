import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

let _notifIdCounter = 0;

/** Fetch or return the cached auth token from the server (localhost only). */
async function getAuthToken() {
  const cached = localStorage.getItem('cc-gui-token');
  if (cached) return cached;

  // Env var override for Vite dev
  const envToken = import.meta.env.VITE_AUTH_TOKEN;
  if (envToken) {
    localStorage.setItem('cc-gui-token', envToken);
    return envToken;
  }

  try {
    const res = await fetch('/api/auth-token');
    if (res.ok) {
      const { token } = await res.json();
      localStorage.setItem('cc-gui-token', token);
      return token;
    }
  } catch (e) {
    console.warn('Failed to fetch auth token:', e.message);
  }
  return null;
}

export function useSocket() {
  const socketRef = useRef(null);
  const tokenRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [orchestratorQueue, setOrchestratorQueue] = useState([]);
  const [aiSummaries, setAiSummaries] = useState({});
  const [aiStatus, setAiStatus] = useState({
    autoRespondEnabled: false,
    coordinationEnabled: false,
    safeMode: true,
    protectedAgentCommands: [],
    defaultSessionCommand: 'claude',
  });
  const [autoResponses, setAutoResponses] = useState([]);
  const [aiDiffs, setAiDiffs] = useState({});
  const [aiBranches, setAiBranches] = useState({});
  const [aiConflicts, setAiConflicts] = useState({});
  const [prStatuses, setPrStatuses] = useState({});

  // Force reload when restored from bfcache (back/forward navigation)
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useEffect(() => {
    let disposed = false;
    let socket = null;

    getAuthToken().then((token) => {
      if (disposed) return;
      tokenRef.current = token;

      socket = io(window.location.origin, {
        transports: ['websocket', 'polling'],
        auth: { token },
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

      // AI Orchestrator events
      socket.on('ai:summaries', (data) => setAiSummaries(data || {}));
      socket.on('ai:status', (data) => setAiStatus(data || {}));
      socket.on('ai:auto-response', (entry) => {
        setAutoResponses(prev => [...prev.slice(-50), entry]);
      });
      socket.on('ai:diffs', (data) => setAiDiffs(data || {}));
      socket.on('ai:branches', (data) => setAiBranches(data || {}));
      socket.on('ai:conflicts', (data) => setAiConflicts(data || {}));
      socket.on('ai:pr-status', (entry) => {
        setPrStatuses(prev => ({ ...prev, [entry.sessionId]: entry }));
      });
      socket.on('ai:pr-statuses', (data) => setPrStatuses(data || {}));

      socket.on('notification', (notif) => {
        setNotifications(prev => [...prev.slice(-10), { ...notif, id: `notif-${Date.now()}-${++_notifIdCounter}`, time: new Date() }]);

        // Vibrate on mobile for input_needed
        if (notif.type === 'input_needed') {
          navigator.vibrate?.(200);
          // Pokemon-style attention chime (ascending two-tone with fade)
          try {
            if (!window._ccAudioCtx) window._ccAudioCtx = new AudioContext();
            const actx = window._ccAudioCtx;
            if (actx.state === 'suspended') actx.resume();
            const now = actx.currentTime;

            // First note — E5
            const osc1 = actx.createOscillator();
            const gain1 = actx.createGain();
            osc1.type = 'sine';
            osc1.frequency.value = 659.25;
            gain1.gain.setValueAtTime(0.18, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc1.connect(gain1).connect(actx.destination);
            osc1.start(now);
            osc1.stop(now + 0.2);

            // Second note — A5 (higher, resolving)
            const osc2 = actx.createOscillator();
            const gain2 = actx.createGain();
            osc2.type = 'sine';
            osc2.frequency.value = 880;
            gain2.gain.setValueAtTime(0.0001, now + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.18, now + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            osc2.connect(gain2).connect(actx.destination);
            osc2.start(now + 0.12);
            osc2.stop(now + 0.45);
          } catch (e) { /* audio not available */ }
        }

        // Browser notification — show when tab is not visible
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.hidden) {
          try {
            const browserNotif = new Notification('CC Gym', {
              body: notif.message,
              icon: '/favicon.ico',
              tag: `cc-gym-${notif.sessionId}`,
              requireInteraction: notif.type === 'input_needed',
            });
            browserNotif.onclick = () => {
              window.focus();
              browserNotif.close();
            };
          } catch (e) { /* notification not available */ }
        }
      });

      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    });

    return () => {
      disposed = true;
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('projects:updated');
        socket.off('sessions:updated');
        socket.off('sessions:summaries');
        socket.off('orchestrator:update');
        socket.off('ai:summaries');
        socket.off('ai:status');
        socket.off('ai:auto-response');
        socket.off('ai:diffs');
        socket.off('ai:branches');
        socket.off('ai:conflicts');
        socket.off('ai:pr-status');
        socket.off('ai:pr-statuses');
        socket.off('notification');
        socket.close();
      }
    };
  }, []);

  const apiCall = useCallback(async (url, options = {}) => {
    const token = tokenRef.current;
    const headers = { ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { ...options, headers });
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
      body: JSON.stringify({
        projectId,
        name: `Session ${Date.now() % 10000}`,
        command: aiStatus.defaultSessionCommand || 'claude',
      }),
    });
  }, [apiCall, aiStatus.defaultSessionCommand]);

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

  // AI Orchestrator controls
  const toggleAutoRespond = useCallback(() => {
    socketRef.current?.emit('ai:toggle-auto-respond');
  }, []);

  const refreshAISummaries = useCallback(() => {
    socketRef.current?.emit('ai:refresh');
  }, []);

  const toggleCoordination = useCallback(() => {
    socketRef.current?.emit('ai:toggle-coordination');
  }, []);

  const createPR = useCallback((sessionId) => {
    socketRef.current?.emit('ai:create-pr', { sessionId });
  }, []);

  const createAllPRs = useCallback((projectId) => {
    socketRef.current?.emit('ai:create-all-prs', { projectId });
  }, []);

  return {
    socket: socketRef.current,
    connected,
    projects,
    sessions,
    summaries,
    notifications,
    orchestratorQueue,
    aiSummaries,
    aiStatus,
    autoResponses,
    aiDiffs,
    aiBranches,
    aiConflicts,
    prStatuses,
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
    toggleAutoRespond,
    refreshAISummaries,
    toggleCoordination,
    createPR,
    createAllPRs,
  };
}
