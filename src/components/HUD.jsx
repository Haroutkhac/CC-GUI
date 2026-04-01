import React, { useState } from 'react';

export default function HUD({ projects, sessions, connected, aiStatus, orchestratorQueue, notificationCount, onCreateProject, onOpenOrchestrator, onToggleNotifications, notificationsOpen }) {
  const activeCount = sessions.filter(s => s.status === 'active' || s.status === 'working').length;
  const waitingSessions = sessions.filter(s => s.status === 'waiting');
  const waitingCount = waitingSessions.length;
  const waitingNames = waitingSessions.map(s => { const name = s.starter || 'unknown'; return name.charAt(0).toUpperCase() + name.slice(1); });
  const urgentCount = (orchestratorQueue || []).filter(q => q.priority >= 3).length;
  const protectedSessions = sessions.filter(s => s.sessionType === 'protected_agent').length;
  const [showKeys, setShowKeys] = useState(false);

  return (
    <div className="pkmn-hud">
      <div className="pkmn-hud-left">
        <div className="pkmn-hud-title">CC GYM</div>
        {aiStatus?.safeMode && (
          <div className="pkmn-safe-banner">
            SAFE MODE ON
            {protectedSessions > 0 ? ` · ${protectedSessions} protected` : ''}
          </div>
        )}
        <div className="pkmn-hud-stats">
          <span>{projects.length} Tables</span>
          <span className="pkmn-hud-sep">&bull;</span>
          <span>{sessions.length} Pokemon</span>
          {activeCount > 0 && (
            <>
              <span className="pkmn-hud-sep">&bull;</span>
              <span className="stat-active">{activeCount} Active</span>
            </>
          )}
          {waitingCount > 0 && (
            <>
              <span className="pkmn-hud-sep">&bull;</span>
              <span className="stat-waiting">{waitingNames.join(', ')} Waiting!</span>
            </>
          )}
        </div>
      </div>
      <div className="pkmn-hud-right">
        <span className={`pkmn-hud-status ${connected ? 'online' : 'offline'}`}>
          {connected ? 'ONLINE' : 'OFFLINE'}
        </span>
        <div className="pkmn-hud-btns">
          <button className="pkmn-hud-btn orch-btn" onClick={onOpenOrchestrator}>
            {urgentCount > 0 && <span className="orch-hud-badge">{urgentCount}</span>}
            CMD CTR <kbd className="hud-kbd">K</kbd>
          </button>
          <button
            className={`pkmn-hud-btn notif-bell-btn ${notificationsOpen ? 'active' : ''}`}
            onClick={onToggleNotifications}
            title="Activity feed"
          >
            {notificationCount > 0 && <span className="notif-bell-badge">{notificationCount}</span>}
            NOTIFS
          </button>
          <button className="pkmn-hud-btn" onClick={onCreateProject}>
            + TABLE <kbd className="hud-kbd">N</kbd>
          </button>
          <button
            className="pkmn-hud-btn key-hint-btn"
            onClick={() => setShowKeys(v => !v)}
            title="Keyboard shortcuts"
          >
            ?
          </button>
        </div>
        {showKeys && (
          <div className="key-hints">
            <div className="key-hint"><kbd>K</kbd> Command Center</div>
            <div className="key-hint"><kbd>N</kbd> New Project</div>
            <div className="key-hint"><kbd>S</kbd> Spawn Session</div>
            <div className="key-hint"><kbd>T</kbd> Team Dashboard</div>
            <div className="key-hint"><kbd>1-9</kbd> Jump to session</div>
            <div className="key-hint"><kbd>ESC</kbd> Close / Back</div>
          </div>
        )}
      </div>
    </div>
  );
}
