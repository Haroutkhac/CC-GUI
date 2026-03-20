import { useState, useCallback, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas.jsx';
import TerminalOverlay from './components/TerminalOverlay.jsx';
import { CreateProjectDialog, CreateSessionDialog, TableContextMenu, ConfirmDialog } from './components/DialogBox.jsx';
import NotificationToast from './components/NotificationToast.jsx';
import HUD from './components/HUD.jsx';
import StatusDashboard from './components/StatusDashboard.jsx';
import SessionCarousel from './components/SessionCarousel.jsx';
import OrchestratorPanel from './components/OrchestratorPanel.jsx';
import { useSocket } from './hooks/useSocket.js';

export default function App() {
  const {
    socket, connected, projects, sessions, summaries, notifications, orchestratorQueue,
    createProject, deleteProject, createSession, quickCreateSession, deleteSession,
    attachTerminal, detachTerminal, sendTerminalInput, resizeTerminal,
    dismissNotification,
  } = useSocket();

  // Restore last-open terminal from localStorage so page refresh picks up where you left off
  const [activeTerminal, setActiveTerminal] = useState(() => {
    try { return localStorage.getItem('cc-gui:activeTerminal') || null; } catch { return null; }
  });
  const [activeProjectId, setActiveProjectId] = useState(() => {
    try { return localStorage.getItem('cc-gui:activeProjectId') || null; } catch { return null; }
  });
  const lastTerminalRef = useRef(null);

  // Persist UI state to localStorage
  useEffect(() => {
    try {
      if (activeTerminal) {
        localStorage.setItem('cc-gui:activeTerminal', activeTerminal);
      } else {
        localStorage.removeItem('cc-gui:activeTerminal');
      }
    } catch {}
  }, [activeTerminal]);

  useEffect(() => {
    try {
      if (activeProjectId) {
        localStorage.setItem('cc-gui:activeProjectId', activeProjectId);
      } else {
        localStorage.removeItem('cc-gui:activeProjectId');
      }
    } catch {}
  }, [activeProjectId]);

  // Clear restored terminal if the session no longer exists (deleted or stale)
  useEffect(() => {
    if (activeTerminal && sessions.length > 0 && !sessions.find(s => s.id === activeTerminal)) {
      setActiveTerminal(null);
    }
  }, [activeTerminal, sessions]);
  const [dialog, setDialog] = useState(null);
  const [dialogData, setDialogData] = useState(null);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [orchestratorOpen, setOrchestratorOpen] = useState(false);
  const [carouselProject, setCarouselProject] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }

  // Open terminal for a session
  const openTerminal = useCallback((sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) setActiveProjectId(session.projectId);
    setActiveTerminal(sessionId);
    setDashboardOpen(false);
    setCarouselProject(null);
  }, [sessions]);

  // NPC click -> open terminal directly
  const handleNPCInteract = useCallback((sessionId) => {
    openTerminal(sessionId);
  }, [openTerminal]);

  // X key near NPC -> dismiss with confirm
  const handleDismissNPC = useCallback((sessionId, name) => {
    setConfirmDialog({
      message: `Are you sure you want to release ${name || 'this Pokemon'}? This can't be undone!`,
      onConfirm: () => { deleteSession(sessionId); setConfirmDialog(null); },
    });
  }, [deleteSession]);

  // X key near table -> delete project with confirm
  const handleDeleteTable = useCallback((projectId, name) => {
    setConfirmDialog({
      message: `Delete ${name || 'this table'} and release all its Pokemon? This can't be undone!`,
      onConfirm: async () => {
        try { await deleteProject(projectId); } catch (err) { console.error('Failed to delete project:', err); }
        setConfirmDialog(null);
      },
    });
  }, [deleteProject]);

  // Table click -> open carousel
  const handleTableInteract = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCarouselProject(project);
    }
  }, [projects]);

  const handleNotificationJump = useCallback((sessionId) => {
    if (sessionId) openTerminal(sessionId);
  }, [openTerminal]);

  const [dialogError, setDialogError] = useState(null);

  const handleCreateProject = useCallback(async (name, path) => {
    try {
      setDialogError(null);
      await createProject(name, path);
      setDialog(null);
      setDialogData(null);
    } catch (err) {
      console.error('Failed to create project:', err);
      setDialogError(err.message || 'Failed to create project');
    }
  }, [createProject]);

  const handleCreateSession = useCallback(async (projectId, name, command) => {
    try {
      const session = await createSession(projectId, name, command);
      setDialog(null);
      setDialogData(null);
      if (session?.id) openTerminal(session.id);
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  }, [createSession, openTerminal]);

  const handleDeleteProject = useCallback(async (projectId) => {
    try {
      await deleteProject(projectId);
      setDialog(null);
      setDialogData(null);
      setCarouselProject(null);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  }, [deleteProject]);

  // Quick create from carousel
  const handleQuickCreate = useCallback(async (projectId) => {
    try {
      const session = await quickCreateSession(projectId);
      if (session?.id) openTerminal(session.id);
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  }, [quickCreateSession, openTerminal]);

  // Switch terminal (swipe)
  const handleSwitchSession = useCallback((sessionId) => {
    setActiveTerminal(sessionId);
  }, []);

  // Global keyboard shortcuts (capture phase)
  // Plain letter keys — no Cmd/Ctrl needed. Ignored when typing in inputs or terminal.
  useEffect(() => {
    const handleKey = (e) => {
      // ESC always works
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (confirmDialog) setConfirmDialog(null);
        else if (activeTerminal) setActiveTerminal(null);
        else if (orchestratorOpen) setOrchestratorOpen(false);
        else if (carouselProject) setCarouselProject(null);
        else if (dashboardOpen) setDashboardOpen(false);
        else if (dialog) { setDialog(null); setDialogData(null); }
        return;
      }

      // Skip shortcuts when focused on an input/textarea, inside terminal, or overlay is open
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (activeTerminal) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // K toggles command center regardless of other overlays
      if (e.key === 'k') {
        e.preventDefault();
        setOrchestratorOpen(prev => !prev);
        return;
      }

      // Block other shortcuts when any overlay is open
      if (dialog || dashboardOpen || carouselProject || orchestratorOpen) return;

      switch (e.key) {
        case 'n': // New project
          e.preventDefault();
          setDialog('createProject');
          break;
        case 's': // Quick-spawn session in first project
          e.preventDefault();
          if (projects.length > 0) handleQuickCreate(projects[0].id);
          break;
        case 't': // Team dashboard
          e.preventDefault();
          setDashboardOpen(prev => !prev);
          break;
        default:
          // 1-9: jump to session by orchestrator rank
          if (e.key >= '1' && e.key <= '9') {
            const idx = parseInt(e.key) - 1;
            const actionable = (orchestratorQueue || []).filter(q => q.priority >= 2);
            if (actionable[idx]) {
              e.preventDefault();
              openTerminal(actionable[idx].sessionId);
            }
          }
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [activeTerminal, dialog, dashboardOpen, orchestratorOpen, carouselProject, confirmDialog, projects, orchestratorQueue, openTerminal, handleQuickCreate]);

  // Track last opened terminal so we can keep it mounted (hidden) when closed
  useEffect(() => {
    if (activeTerminal) lastTerminalRef.current = activeTerminal;
  }, [activeTerminal]);

  const terminalSessionId = activeTerminal || lastTerminalRef.current;
  const terminalSession = terminalSessionId ? sessions.find(s => s.id === terminalSessionId) : null;
  const projectSessionsForSwipe = activeProjectId
    ? sessions.filter(s => s.projectId === activeProjectId)
    : [];

  const waitingCount = sessions.filter(s => s.status === 'waiting').length;

  return (
    <div className="app">
      <GameCanvas
        projects={projects}
        sessions={sessions}
        onNPCInteract={handleNPCInteract}
        onTableInteract={handleTableInteract}
        onDeleteTable={handleDeleteTable}
        onDismissNPC={handleDismissNPC}
        onCreateAtTable={handleQuickCreate}
        inputPaused={!!activeTerminal || !!dialog || dashboardOpen || orchestratorOpen || !!carouselProject || !!confirmDialog}
      />

      <HUD
        projects={projects}
        sessions={sessions}
        connected={connected}
        orchestratorQueue={orchestratorQueue}
        onCreateProject={() => setDialog('createProject')}
        onOpenOrchestrator={() => setOrchestratorOpen(true)}
      />

      <MobileControls />

      {/* FAB: Team Status button */}
      <button
        className="fab-team"
        onClick={() => setDashboardOpen(true)}
      >
        {waitingCount > 0 && <span className="fab-badge">{waitingCount}</span>}
        TEAM
      </button>

      {/* Orchestrator Panel */}
      {orchestratorOpen && (
        <OrchestratorPanel
          queue={orchestratorQueue}
          sessions={sessions}
          projects={projects}
          onSelectSession={(sessionId) => {
            setOrchestratorOpen(false);
            openTerminal(sessionId);
          }}
          onClose={() => setOrchestratorOpen(false)}
        />
      )}

      {/* Status Dashboard */}
      {dashboardOpen && (
        <StatusDashboard
          projects={projects}
          sessions={sessions}
          summaries={summaries}
          open={dashboardOpen}
          onSelectSession={openTerminal}
          onClose={() => setDashboardOpen(false)}
        />
      )}

      {/* Session Carousel */}
      {carouselProject && !activeTerminal && (
        <SessionCarousel
          project={carouselProject}
          sessions={sessions.filter(s => s.projectId === carouselProject.id)}
          summaries={summaries}
          onSelectSession={openTerminal}
          onCreateSession={() => handleQuickCreate(carouselProject.id)}
          onDeleteSession={deleteSession}
          onShowOptions={() => {
            setDialog('tableMenu');
            setDialogData(carouselProject);
            setCarouselProject(null);
          }}
          onClose={() => setCarouselProject(null)}
        />
      )}

      {/* Terminal overlay — kept mounted to preserve chat history */}
      {terminalSessionId && socket && (
        <TerminalOverlay
          sessionId={terminalSessionId}
          visible={!!activeTerminal}
          sessionName={terminalSession?.name}
          socket={socket}
          onClose={() => setActiveTerminal(null)}
          sendInput={sendTerminalInput}
          resizeTerminal={resizeTerminal}
          attachTerminal={attachTerminal}
          detachTerminal={detachTerminal}
          projectSessions={projectSessionsForSwipe}
          onSwitchSession={handleSwitchSession}
        />
      )}

      {/* Dialogs */}
      {dialog === 'createProject' && (
        <CreateProjectDialog
          onSubmit={handleCreateProject}
          onCancel={() => { setDialog(null); setDialogData(null); setDialogError(null); }}
          serverError={dialogError}
        />
      )}
      {dialog === 'createSession' && dialogData && (
        <CreateSessionDialog
          projectId={dialogData.id}
          projectName={dialogData.name}
          onSubmit={handleCreateSession}
          onCancel={() => { setDialog(null); setDialogData(null); }}
        />
      )}
      {dialog === 'tableMenu' && dialogData && (
        <TableContextMenu
          project={dialogData}
          sessions={sessions}
          onCreateSession={() => setDialog('createSession')}
          onDeleteProject={handleDeleteProject}
          onDeleteSession={deleteSession}
          onSelectSession={openTerminal}
          onClose={() => { setDialog(null); setDialogData(null); }}
          onConfirm={(message, action) => {
            setConfirmDialog({ message, onConfirm: () => { action(); setConfirmDialog(null); } });
          }}
        />
      )}

      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
        onJump={handleNotificationJump}
      />

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}

function MobileControls() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible('ontouchstart' in window); }, []);
  if (!visible) return null;

  const press = (key, down) => {
    window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key }));
  };
  const Btn = ({ dir, label }) => (
    <button
      className={`dpad-btn dpad-${dir}`}
      onTouchStart={e => { e.preventDefault(); press(`Arrow${dir.charAt(0).toUpperCase() + dir.slice(1)}`, true); }}
      onTouchEnd={e => { e.preventDefault(); press(`Arrow${dir.charAt(0).toUpperCase() + dir.slice(1)}`, false); }}
    >{label}</button>
  );

  return (
    <div className="mobile-controls">
      <div className="dpad">
        <Btn dir="up" label={'\u25B2'} />
        <Btn dir="left" label={'\u25C0'} />
        <Btn dir="right" label={'\u25B6'} />
        <Btn dir="down" label={'\u25BC'} />
      </div>
      <button
        className="dpad-action"
        onTouchStart={e => { e.preventDefault(); press('Enter', true); }}
        onTouchEnd={e => { e.preventDefault(); press('Enter', false); }}
      >A</button>
    </div>
  );
}
