import React, { useState } from 'react';
import { capitalize } from '../../shared/constants.js';

export default function HUD({
  projects, sessions, connected, aiStatus, orchestratorQueue,
  activeProjectId, onSelectProject, onOpenGallery,
  onCreateProject,
}) {
  const activeCount = sessions.filter(s => s.status === 'active' || s.status === 'working').length;
  const waitingSessions = sessions.filter(s => s.status === 'waiting');
  const waitingCount = waitingSessions.length;
  const waitingNames = waitingSessions.map(s => capitalize(s.starter || 'unknown'));
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
          {urgentCount > 0 && (
            <>
              <span className="pkmn-hud-sep">&bull;</span>
              <span className="stat-waiting">{urgentCount} urgent</span>
            </>
          )}
        </div>
        {projects.length > 0 && (
          <div className="pkmn-hud-projects">
            {projects.map(p => (
              <button
                key={p.id}
                className={`pkmn-hud-project ${p.id === activeProjectId ? 'active' : ''}`}
                onClick={() => onSelectProject(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="pkmn-hud-right">
        <span className={`pkmn-hud-status ${connected ? 'online' : 'offline'}`}>
          {connected ? 'ONLINE' : 'OFFLINE'}
        </span>
        <div className="pkmn-hud-btns">
          {activeProjectId && (
            <button className="pkmn-hud-btn" onClick={onOpenGallery}>
              GALLERY
            </button>
          )}
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
            <div className="key-hint"><kbd>N</kbd> New Project</div>
            <div className="key-hint"><kbd>S</kbd> Spawn Session</div>
            <div className="key-hint"><kbd>1-9</kbd> Jump to session</div>
            <div className="key-hint"><kbd>ESC</kbd> Close / Back</div>
          </div>
        )}
      </div>
    </div>
  );
}
