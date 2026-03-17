import React, { useState, useEffect, useRef } from 'react';

// Pokemon-style typewriter text
function TypewriterText({ text, speed = 30 }) {
  const [displayed, setDisplayed] = useState('');
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      idx.current++;
      if (idx.current <= text.length) {
        setDisplayed(text.slice(0, idx.current));
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayed}</span>;
}

// Pokemon-style menu arrow
function MenuArrow() {
  return <span className="pkmn-arrow">{'\u25B6'}</span>;
}

export function CreateProjectDialog({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [path, setPath] = useState('');

  return (
    <div className="pkmn-overlay" onClick={onCancel}>
      <div className="pkmn-dialog" onClick={e => e.stopPropagation()}>
        <div className="pkmn-dialog-inner">
          <div className="pkmn-dialog-title">NEW PROJECT</div>
          <form onSubmit={e => { e.preventDefault(); if (name && path) onSubmit(name, path); }}>
            <div className="pkmn-field">
              <label>NAME</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="My Project" autoFocus />
            </div>
            <div className="pkmn-field">
              <label>PATH</label>
              <input type="text" value={path} onChange={e => setPath(e.target.value)} placeholder="/Users/you/project" />
            </div>
            <div className="pkmn-menu-list">
              <button type="submit" className="pkmn-menu-item">
                <MenuArrow /> CREATE
              </button>
              <button type="button" className="pkmn-menu-item" onClick={onCancel}>
                <MenuArrow /> CANCEL
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function CreateSessionDialog({ projectId, projectName, onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [command, setCommand] = useState('claude');

  return (
    <div className="pkmn-overlay" onClick={onCancel}>
      <div className="pkmn-dialog" onClick={e => e.stopPropagation()}>
        <div className="pkmn-dialog-inner">
          <div className="pkmn-dialog-title">NEW SESSION</div>
          <div className="pkmn-dialog-sub">Table: {projectName}</div>
          <form onSubmit={e => { e.preventDefault(); if (name) onSubmit(projectId, name, command); }}>
            <div className="pkmn-field">
              <label>NAME</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Bug Fix" autoFocus />
            </div>
            <div className="pkmn-field">
              <label>COMMAND</label>
              <input type="text" value={command} onChange={e => setCommand(e.target.value)} placeholder="claude" />
            </div>
            <div className="pkmn-menu-list">
              <button type="submit" className="pkmn-menu-item">
                <MenuArrow /> CREATE
              </button>
              <button type="button" className="pkmn-menu-item" onClick={onCancel}>
                <MenuArrow /> CANCEL
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function TableContextMenu({ project, sessions, onCreateSession, onDeleteProject, onSelectSession, onClose }) {
  const projectSessions = sessions.filter(s => s.projectId === project.id);

  return (
    <div className="pkmn-overlay" onClick={onClose}>
      <div className="pkmn-dialog wide" onClick={e => e.stopPropagation()}>
        <div className="pkmn-dialog-inner">
          <div className="pkmn-dialog-title">{project.name}</div>
          <div className="pkmn-dialog-sub">{project.region} Region &bull; {project.path}</div>

          {projectSessions.length === 0 ? (
            <div className="pkmn-empty">
              <TypewriterText text="No Pokemon at this table yet. Create a session to add one!" />
            </div>
          ) : (
            <div className="pkmn-session-list">
              {projectSessions.map(s => (
                <button
                  key={s.id}
                  className={`pkmn-session-item status-${s.status}`}
                  onClick={() => onSelectSession?.(s.id)}
                >
                  <span className="pkmn-session-starter">{s.starter}</span>
                  <span className="pkmn-session-name">{s.name}</span>
                  <span className={`pkmn-session-status ${s.status}`}>{s.status}</span>
                </button>
              ))}
            </div>
          )}

          <div className="pkmn-menu-list">
            <button className="pkmn-menu-item" onClick={onCreateSession}>
              <MenuArrow /> NEW SESSION
            </button>
            <button className="pkmn-menu-item danger" onClick={() => {
              if (confirm('Release all Pokemon from this table?')) onDeleteProject(project.id);
            }}>
              <MenuArrow /> DELETE TABLE
            </button>
            <button className="pkmn-menu-item" onClick={onClose}>
              <MenuArrow /> CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
