import React, { useRef, useEffect, useState } from 'react';
import { useTerminalSession } from '../hooks/useTerminalSession.js';
import '@xterm/xterm/css/xterm.css';

// Quick action toolbar buttons (mobile + accessibility shortcuts)
const QUICK_ACTIONS = [
  { label: '\u21B5', value: '\r', color: '#3060A0' }, // Enter
  { label: 'Tab', value: '\t', color: '#606060' },
  { label: '\u2191', value: '\x1b[A', color: '#606060' }, // Up
  { label: '\u2193', value: '\x1b[B', color: '#606060' }, // Down
];

const GIT_ACTIONS = [
  { label: 'Status', cmd: 'git status\r' },
  { label: 'Diff', cmd: 'git diff --stat\r' },
  { label: 'Log', cmd: 'git log --oneline -5\r' },
  { label: 'Create PR', cmd: 'gh pr create --fill\r' },
];

const MOBILE_KEY_MAP = {
  Enter: '\r',
  Backspace: '\x7f',
  Tab: '\t',
  ArrowUp: '\x1b[A',
  ArrowDown: '\x1b[B',
  ArrowRight: '\x1b[C',
  ArrowLeft: '\x1b[D',
};

const SWIPE_THRESHOLD_PX = 60;

// Selects the current input line at the prompt cursor. Used by Cmd/Ctrl+A
// when the focus is anywhere inside the terminal overlay (not just the
// xterm canvas), since xterm's own handler only fires when the canvas
// has focus and the user may have clicked the header/toolbar.
function selectCurrentInputLine(term) {
  const buf = term.buffer.active;
  const absRow = buf.baseY + buf.cursorY;
  const line = buf.getLine(absRow);
  if (!line) return;
  const text = line.translateToString(true);
  const trimmed = text.trimEnd();
  // Find the prompt by scanning for common prompt characters from the left.
  const promptMatch = text.match(/^(.*?[>❯›➜❱$%#]\s?)/);
  const start = promptMatch ? promptMatch[1].length : 0;
  const length = trimmed.length - start;
  if (length > 0) term.select(start, absRow, length);
}

export default function TerminalOverlay({
  sessionId,
  visible = true,
  sessionName,
  projectName,
  branch,
  sessionType,
  baseCommand,
  unsafeCommand,
  safeMode,
  socket,
  onClose,
  sendInput,
  resizeTerminal,
  attachTerminal,
  detachTerminal,
  restartTerminal,
  projectSessions,
  onSwitchSession,
}) {
  const termRef = useRef(null);
  const mobileInputRef = useRef(null);
  const [gitMenuOpen, setGitMenuOpen] = useState(false);
  const isMobile = 'ontouchstart' in window;

  const { termRef: xtermRef, fitAddonRef } = useTerminalSession({
    containerRef: termRef,
    sessionId,
    socket,
    isMobile,
    sendInput,
    resizeTerminal,
    attachTerminal,
    detachTerminal,
  });

  // Re-fit, scroll to bottom, and focus terminal when overlay becomes visible again.
  useEffect(() => {
    if (!visible || !fitAddonRef.current || !xtermRef.current) return;
    requestAnimationFrame(() => {
      if (!fitAddonRef.current || !xtermRef.current) return;
      try {
        fitAddonRef.current.fit();
      } catch (err) {
        console.warn('Fit on visibility change failed:', err);
      }
      xtermRef.current.scrollToBottom();
      xtermRef.current.focus();
    });
  }, [visible, fitAddonRef, xtermRef]);

  // Cmd/Ctrl+A at overlay level so it works even when focus is on a button.
  useEffect(() => {
    if (!visible) return undefined;
    const handler = (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== 'a') return;
      const term = xtermRef.current;
      if (!term) return;
      e.preventDefault();
      e.stopPropagation();
      selectCurrentInputLine(term);
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [visible, xtermRef]);

  // Swipe detection on overlay for switching sessions.
  const touchStartX = useRef(0);
  const handleHeaderTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleHeaderTouchEnd = (e) => {
    if (!projectSessions || !onSwitchSession) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const currentIdx = projectSessions.findIndex((s) => s.id === sessionId);
    if (currentIdx < 0) return;
    if (dx < -SWIPE_THRESHOLD_PX && currentIdx < projectSessions.length - 1) {
      onSwitchSession(projectSessions[currentIdx + 1].id);
    } else if (dx > SWIPE_THRESHOLD_PX && currentIdx > 0) {
      onSwitchSession(projectSessions[currentIdx - 1].id);
    }
  };

  const focusMobileInput = () => mobileInputRef.current?.focus();

  const handleMobileInput = (e) => {
    const val = e.target.value;
    if (!val) return;
    sendInput(sessionId, val);
    e.target.value = '';
  };

  const handleMobileKeyDown = (e) => {
    const seq = MOBILE_KEY_MAP[e.key];
    if (!seq) return;
    e.preventDefault();
    sendInput(sessionId, seq);
  };

  // Prevents header/toolbar buttons from stealing focus from xterm.
  const keepFocus = (e) => e.preventDefault();

  const currentIdx = projectSessions ? projectSessions.findIndex((s) => s.id === sessionId) : -1;
  const totalSessions = projectSessions ? projectSessions.length : 0;
  const showSafetyBanner = safeMode || sessionType === 'protected_agent' || unsafeCommand;

  return (
    <div
      className="terminal-overlay"
      style={visible ? undefined : { display: 'none' }}
      onTouchStart={handleHeaderTouchStart}
      onTouchEnd={handleHeaderTouchEnd}
    >
      <div className="terminal-header">
        <div className="terminal-title">
          <span className="terminal-dot green" />
          <span>{sessionName || 'Terminal'}</span>
          {totalSessions > 1 && (
            <span className="terminal-pos">{currentIdx + 1}/{totalSessions}</span>
          )}
          {(projectName || branch) && (
            <span className="terminal-meta">
              {projectName}{branch ? ` · ${branch}` : ''}
            </span>
          )}
        </div>
        <div className="terminal-header-actions">
          {isMobile && (
            <button className="terminal-btn" onClick={focusMobileInput}>KB</button>
          )}
          <button
            className="terminal-btn"
            onMouseDown={keepFocus}
            onClick={() => restartTerminal(sessionId)}
            title="Restart terminal"
          >{'\u21BB'}</button>
          <button
            className={`terminal-btn ${gitMenuOpen ? 'active' : ''}`}
            onMouseDown={keepFocus}
            onClick={() => setGitMenuOpen(!gitMenuOpen)}
          >GIT</button>
          <button className="terminal-close" onClick={onClose}>X</button>
        </div>
      </div>

      {showSafetyBanner && (
        <div className="terminal-safety-banner">
          {safeMode && <span>SAFE MODE</span>}
          {sessionType === 'protected_agent' && (
            <span>Manual approvals required for {baseCommand || 'protected agent'}</span>
          )}
          {unsafeCommand && sessionType !== 'protected_agent' && (
            <span>Custom command: review terminal actions manually</span>
          )}
        </div>
      )}

      {gitMenuOpen && (
        <div className="terminal-git-menu">
          {GIT_ACTIONS.map((a) => (
            <button
              key={a.label}
              className="terminal-git-item"
              onMouseDown={keepFocus}
              onClick={() => { sendInput(sessionId, a.cmd); setGitMenuOpen(false); }}
            >{a.label}</button>
          ))}
        </div>
      )}

      <div className="terminal-body" ref={termRef} />

      <div className="terminal-quick-actions">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            className="quick-action-btn"
            style={{ borderColor: a.color, color: a.color }}
            onMouseDown={keepFocus}
            onClick={() => sendInput(sessionId, a.value)}
          >{a.label}</button>
        ))}
      </div>

      <textarea
        ref={mobileInputRef}
        className="mobile-hidden-input"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck="false"
        onInput={handleMobileInput}
        onKeyDown={handleMobileKeyDown}
      />

      {totalSessions > 1 && (
        <div className="terminal-swipe-hint">
          {currentIdx > 0 && <span className="swipe-arrow left">{'\u25C0'}</span>}
          <span>swipe to switch</span>
          {currentIdx < totalSessions - 1 && <span className="swipe-arrow right">{'\u25B6'}</span>}
        </div>
      )}
    </div>
  );
}
