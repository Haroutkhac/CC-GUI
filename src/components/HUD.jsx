import React from 'react';

export default function HUD({ projects, sessions, connected, onCreateProject }) {
  const activeCount = sessions.filter(s => s.status === 'active' || s.status === 'working').length;
  const waitingCount = sessions.filter(s => s.status === 'waiting').length;

  return (
    <div className="pkmn-hud">
      <div className="pkmn-hud-left">
        <div className="pkmn-hud-title">CLAUDE CODE GUILD</div>
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
              <span className="stat-waiting">{waitingCount} Waiting!</span>
            </>
          )}
        </div>
      </div>
      <div className="pkmn-hud-right">
        <span className={`pkmn-hud-status ${connected ? 'online' : 'offline'}`}>
          {connected ? 'ONLINE' : 'OFFLINE'}
        </span>
        <button className="pkmn-hud-btn" onClick={onCreateProject}>
          + TABLE
        </button>
      </div>
    </div>
  );
}
