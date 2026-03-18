import React, { useState, useCallback } from 'react';
import GameCanvas from './components/GameCanvas.jsx';
import TerminalOverlay from './components/TerminalOverlay.jsx';
import { CreateProjectDialog, CreateSessionDialog, TableContextMenu } from './components/DialogBox.jsx';
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

  const [activeTerminal, setActiveTerminal] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null); // for swipe context
  const [dialog, setDialog] = useState(null);
  const [dialogData, setDialogData] = useState(null);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [orchestratorOpen, setOrchestratorOpen] = useState(false);
  const [carouselProject, setCarouselProject] = useState(null);

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

  const handleCreateProject = useCallback(async (name, path) => {
    await createProject(name, path);
    setDialog(null);
    setDialogData(null);
  }, [createProject]);

  const handleCreateSession = useCallback(async (projectId, name, command) => {
    const session = await createSession(projectId, name, command);
    setDialog(null);
    setDialogData(null);
    // Auto-open the new session
    if (session?.id) openTerminal(session.id);
  }, [createSession, openTerminal]);

  const handleDeleteProject = useCallback(async (projectId) => {
    await deleteProject(projectId);
    setDialog(null);
    setDialogData(null);
    setCarouselProject(null);
  }, [deleteProject]);

  // Quick create from carousel
  const handleQuickCreate = useCallback(async (projectId) => {
    const session = await quickCreateSession(projectId);
    if (session?.id) openTerminal(session.id);
  }, [quickCreateSession, openTerminal]);

  // Switch terminal (swipe)
  const handleSwitchSession = useCallback((sessionId) => {
    setActiveTerminal(sessionId);
  }, []);

  // ESC to close - capture phase
  React.useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (activeTerminal) setActiveTerminal(null);
        else if (orchestratorOpen) setOrchestratorOpen(false);
        else if (carouselProject) setCarouselProject(null);
        else if (dashboardOpen) setDashboardOpen(false);
        else if (dialog) { setDialog(null); setDialogData(null); }
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [activeTerminal, dialog, dashboardOpen, orchestratorOpen, carouselProject]);

  const activeSession = activeTerminal ? sessions.find(s => s.id === activeTerminal) : null;
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
          onShowOptions={() => {
            setDialog('tableMenu');
            setDialogData(carouselProject);
            setCarouselProject(null);
          }}
          onClose={() => setCarouselProject(null)}
        />
      )}

      {/* Terminal overlay */}
      {activeTerminal && socket && (
        <TerminalOverlay
          sessionId={activeTerminal}
          sessionName={activeSession?.name}
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
          onCancel={() => { setDialog(null); setDialogData(null); }}
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
          onSelectSession={openTerminal}
          onClose={() => { setDialog(null); setDialogData(null); }}
        />
      )}

      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
        onJump={handleNotificationJump}
      />
    </div>
  );
}

function MobileControls() {
  const [visible, setVisible] = useState(false);
  React.useEffect(() => { setVisible('ontouchstart' in window); }, []);
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
