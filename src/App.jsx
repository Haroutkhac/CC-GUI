import { useState, useCallback, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas.jsx';
import AgentGrid from './components/AgentGrid.jsx';
import TerminalOverlay from './components/TerminalOverlay.jsx';
import { CreateProjectDialog, CreateSessionDialog, TableContextMenu, ConfirmDialog } from './components/DialogBox.jsx';
import ActivitySidebar from './components/ActivitySidebar.jsx';
import HUD from './components/HUD.jsx';
import SessionCarousel from './components/SessionCarousel.jsx';
import MobileControls from './components/MobileControls.jsx';
import { useSocket } from './hooks/useSocket.js';

export default function App() {
  const {
    socket, connected, projects, sessions, summaries, notifications, orchestratorQueue,
    aiSummaries, aiDiffs, aiBranches, aiConflicts, prStatuses, aiStatus,
    createProject, deleteProject, createSession, quickCreateSession, forkSession, deleteSession,
    attachTerminal, detachTerminal, sendTerminalInput, resizeTerminal, restartTerminal,
    dismissNotification, pushNotification, createPR,
  } = useSocket();

  const [activeTerminal, setActiveTerminal] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const lastTerminalRef = useRef(null);
  const restoredRef = useRef(false);

  // Restore last-open terminal & project from localStorage once data loads
  useEffect(() => {
    if (restoredRef.current) return;
    try {
      const savedProject = localStorage.getItem('cc-gui:activeProjectId');
      if (savedProject && projects.find(p => p.id === savedProject)) {
        setActiveProjectId(savedProject);
      } else if (projects.length > 0) {
        setActiveProjectId(projects[0].id);
      }
      const savedTerminal = localStorage.getItem('cc-gui:activeTerminal');
      if (savedTerminal && sessions.find(s => s.id === savedTerminal)) {
        setActiveTerminal(savedTerminal);
      }
      if (projects.length > 0) restoredRef.current = true;
    } catch {}
  }, [sessions, projects]);

  // If active project was deleted, fall back to first available
  useEffect(() => {
    if (activeProjectId && !projects.find(p => p.id === activeProjectId)) {
      setActiveProjectId(projects[0]?.id || null);
    }
  }, [projects, activeProjectId]);

  useEffect(() => {
    try {
      if (activeTerminal) localStorage.setItem('cc-gui:activeTerminal', activeTerminal);
      else localStorage.removeItem('cc-gui:activeTerminal');
    } catch {}
  }, [activeTerminal]);

  useEffect(() => {
    try {
      if (activeProjectId) localStorage.setItem('cc-gui:activeProjectId', activeProjectId);
      else localStorage.removeItem('cc-gui:activeProjectId');
    } catch {}
  }, [activeProjectId]);

  const [dialog, setDialog] = useState(null);
  const [dialogData, setDialogData] = useState(null);
  const [carouselProject, setCarouselProject] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [showGrid, setShowGrid] = useState(false);

  // Open terminal for a session
  const openTerminal = useCallback((sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) setActiveProjectId(session.projectId);
    setActiveTerminal(sessionId);
    setCarouselProject(null);
  }, [sessions]);

  const handleOpenGallery = useCallback(() => {
    setShowGrid(v => !v);
  }, []);

  // GameCanvas callbacks
  const handleNPCInteract = useCallback((sessionId) => {
    openTerminal(sessionId);
  }, [openTerminal]);

  const handleDismissNPC = useCallback((sessionId, name) => {
    setConfirmDialog({
      message: `Are you sure you want to release ${name || 'this Pokemon'}? This can't be undone!`,
      onConfirm: () => { deleteSession(sessionId); setConfirmDialog(null); },
    });
  }, [deleteSession]);

  const handleDeleteTable = useCallback((projectId, name) => {
    setConfirmDialog({
      message: `Delete ${name || 'this table'} and release all its Pokemon? This can't be undone!`,
      onConfirm: async () => {
        try { await deleteProject(projectId); } catch (err) { console.error('Failed to delete project:', err); }
        setConfirmDialog(null);
      },
    });
  }, [deleteProject]);

  const handleTableInteract = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) setCarouselProject(project);
  }, [projects]);

  const [dialogError, setDialogError] = useState(null);

  const handleCreateProject = useCallback(async (name, path) => {
    try {
      setDialogError(null);
      const project = await createProject(name, path);
      setDialog(null);
      setDialogData(null);
      if (project?.id) setActiveProjectId(project.id);
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

  const handleQuickCreate = useCallback(async (projectId) => {
    try {
      const session = await quickCreateSession(projectId);
      if (session?.id) openTerminal(session.id);
    } catch (err) {
      console.error('Failed to create session:', err);
      pushNotification({
        type: 'error',
        title: 'Could not spawn Pokémon',
        body: err?.message || 'Session creation failed',
      });
    }
  }, [quickCreateSession, openTerminal, pushNotification]);

  const handleSwitchSession = useCallback((sessionId) => {
    setActiveTerminal(sessionId);
  }, []);

  // Global keyboard shortcuts. The handler reads from a ref so the listener
  // only attaches once and avoids re-binding on every state change.
  const shortcutStateRef = useRef(null);
  shortcutStateRef.current = {
    activeTerminal, dialog, carouselProject, confirmDialog, showGrid,
    projects, activeProjectId, orchestratorQueue,
    openTerminal, handleQuickCreate,
    setActiveTerminal, setCarouselProject, setDialog, setDialogData, setConfirmDialog, setShowGrid,
  };
  useEffect(() => {
    const handleKey = (e) => {
      const s = shortcutStateRef.current;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (s.confirmDialog) s.setConfirmDialog(null);
        else if (s.dialog) { s.setDialog(null); s.setDialogData(null); }
        else if (s.activeTerminal) s.setActiveTerminal(null);
        else if (s.carouselProject) s.setCarouselProject(null);
        else if (s.showGrid) s.setShowGrid(false);
        return;
      }

      if (s.activeTerminal) return;

      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

      if (s.dialog || s.carouselProject) return;

      switch (e.key) {
        case 'n':
          e.preventDefault();
          s.setDialog('createProject');
          break;
        case 's':
          e.preventDefault();
          if (s.activeProjectId) s.handleQuickCreate(s.activeProjectId);
          else if (s.projects.length > 0) s.handleQuickCreate(s.projects[0].id);
          break;
        default:
          if (e.key >= '1' && e.key <= '9') {
            const idx = parseInt(e.key, 10) - 1;
            const actionable = (s.orchestratorQueue || []).filter((q) => q.priority >= 2);
            if (actionable[idx]) {
              e.preventDefault();
              s.openTerminal(actionable[idx].sessionId);
            }
          }
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, []);

  useEffect(() => {
    if (activeTerminal) lastTerminalRef.current = activeTerminal;
  }, [activeTerminal]);

  const lastId = lastTerminalRef.current;
  const terminalSessionId = activeTerminal || (lastId && sessions.find(s => s.id === lastId) ? lastId : null);
  const terminalSession = terminalSessionId ? sessions.find(s => s.id === terminalSessionId) : null;
  const projectSessionsForSwipe = activeProjectId
    ? sessions.filter(s => s.projectId === activeProjectId)
    : [];

  const activeProject = projects.find(p => p.id === activeProjectId) || null;
  const activeProjectSessions = activeProjectId
    ? sessions.filter(s => s.projectId === activeProjectId)
    : [];

  return (
    <div className="app">
      <HUD
        projects={projects}
        sessions={sessions}
        connected={connected}
        aiStatus={aiStatus}
        orchestratorQueue={orchestratorQueue}
        activeProjectId={activeProjectId}
        showGrid={showGrid}
        onSelectProject={setActiveProjectId}
        onOpenGallery={handleOpenGallery}
        onCreateProject={() => setDialog('createProject')}
      />

      <GameCanvas
        projects={projects}
        sessions={sessions}
        onNPCInteract={handleNPCInteract}
        onTableInteract={handleTableInteract}
        onDeleteTable={handleDeleteTable}
        onDismissNPC={handleDismissNPC}
        onCreateAtTable={handleQuickCreate}
        inputPaused={!!activeTerminal || !!dialog || !!carouselProject || !!confirmDialog || showGrid}
      />

      {showGrid && (
        <main className="agent-main">
          <AgentGrid
            project={activeProject}
            sessions={activeProjectSessions}
            orchestratorQueue={orchestratorQueue}
            aiSummaries={aiSummaries}
            aiBranches={aiBranches}
            aiDiffs={aiDiffs}
            aiConflicts={aiConflicts}
            prStatuses={prStatuses}
            onSelectSession={openTerminal}
            onCreatePR={createPR}
          />
        </main>
      )}

      <ActivitySidebar
        sessions={sessions}
        projects={projects}
        notifications={notifications}
        orchestratorQueue={orchestratorQueue}
        aiSummaries={aiSummaries}
        onSelectSession={openTerminal}
        onDismissNotification={dismissNotification}
      />

      <MobileControls />

      {carouselProject && !activeTerminal && (
        <SessionCarousel
          project={carouselProject}
          sessions={sessions.filter(s => s.projectId === carouselProject.id)}
          summaries={summaries}
          onSelectSession={openTerminal}
          onCreateSession={() => handleQuickCreate(carouselProject.id)}
          onDeleteSession={deleteSession}
          onForkSession={forkSession}
          onShowOptions={() => {
            setDialog('tableMenu');
            setDialogData(carouselProject);
            setCarouselProject(null);
          }}
          onClose={() => setCarouselProject(null)}
        />
      )}

      {terminalSessionId && socket && (
        <TerminalOverlay
          sessionId={terminalSessionId}
          visible={!!activeTerminal}
          sessionName={terminalSession?.name}
          projectName={terminalSession ? projects.find(p => p.id === terminalSession.projectId)?.name : null}
          branch={terminalSession?.branch}
          sessionType={terminalSession?.sessionType}
          baseCommand={terminalSession?.baseCommand}
          unsafeCommand={terminalSession?.unsafeCommand}
          safeMode={aiStatus?.safeMode}
          socket={socket}
          onClose={() => setActiveTerminal(null)}
          sendInput={sendTerminalInput}
          resizeTerminal={resizeTerminal}
          attachTerminal={attachTerminal}
          detachTerminal={detachTerminal}
          restartTerminal={restartTerminal}
          projectSessions={projectSessionsForSwipe}
          onSwitchSession={handleSwitchSession}
        />
      )}

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
          defaultCommand={aiStatus?.defaultSessionCommand || 'claude'}
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
