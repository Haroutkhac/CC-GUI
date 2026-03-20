import React, { useRef, useEffect, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

export default function TerminalOverlay({
  sessionId,
  visible = true,
  sessionName,
  socket,
  onClose,
  sendInput,
  resizeTerminal,
  attachTerminal,
  detachTerminal,
  // Swipe navigation
  projectSessions,
  onSwitchSession,
}) {
  const termRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const mobileInputRef = useRef(null);
  const [gitMenuOpen, setGitMenuOpen] = useState(false);
  const isMobile = 'ontouchstart' in window;

  useEffect(() => {
    const container = termRef.current;
    if (!container || !socket) return;

    // Clean up any prior terminal (StrictMode double-mount protection)
    if (xtermRef.current) {
      xtermRef.current.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    }
    // Clear any leftover xterm DOM from a previous instance
    container.innerHTML = '';

    let disposed = false;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: isMobile ? 12 : 14,
      fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
      theme: {
        background: '#181820',
        foreground: '#e0e0e0',
        cursor: '#F1C40F',
        cursorAccent: '#181820',
        selectionBackground: 'rgba(241, 196, 15, 0.3)',
        black: '#181820',
        red: '#E74C3C',
        green: '#2ECC71',
        yellow: '#F1C40F',
        blue: '#3498DB',
        magenta: '#9B59B6',
        cyan: '#1ABC9C',
        white: '#ECF0F1',
        brightBlack: '#34495E',
        brightRed: '#E74C3C',
        brightGreen: '#2ECC71',
        brightYellow: '#F1C40F',
        brightBlue: '#3498DB',
        brightMagenta: '#9B59B6',
        brightCyan: '#1ABC9C',
        brightWhite: '#FFFFFF',
      },
      allowProposedApi: true,
      scrollback: 10000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(container);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Cmd/Ctrl shortcuts: select all, copy, paste, clear
    term.attachCustomKeyEventHandler((e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod || e.type !== 'keydown') return true;

      switch (e.key) {
        case 'a': { // Select current input line (not entire scrollback)
          e.preventDefault();
          const buf = term.buffer.active;
          const absRow = buf.baseY + buf.cursorY;
          const line = buf.getLine(absRow);
          if (line) {
            const text = line.translateToString(true);
            // Find prompt character and select everything after it
            const promptIdx = Math.max(text.lastIndexOf('> '), text.lastIndexOf('❯ '));
            const start = promptIdx >= 0 ? promptIdx + 2 : 0;
            const length = text.trimEnd().length - start;
            if (length > 0) {
              term.select(start, absRow, length);
            }
          }
          return false;
        }
        case 'c': // Copy selection (fall through to default if no selection)
          if (term.hasSelection()) {
            e.preventDefault();
            navigator.clipboard.writeText(term.getSelection()).catch(() => {});
            term.clearSelection();
            return false;
          }
          return true; // let Ctrl+C send SIGINT when nothing is selected
        case 'v': // Paste
          e.preventDefault();
          navigator.clipboard.readText().then((text) => {
            if (text && !disposed) sendInput(sessionId, text);
          }).catch(() => {});
          return false;
        case 'k': // Clear terminal viewport
          e.preventDefault();
          term.clear();
          return false;
        default:
          return true;
      }
    });

    // Defer fit() until the DOM has laid out and the terminal has dimensions
    const rafId = requestAnimationFrame(() => {
      if (!disposed) {
        try { fitAddon.fit(); } catch (_) {}
      }
    });

    term.onData((data) => {
      if (!disposed) sendInput(sessionId, data);
    });
    term.onResize(({ cols, rows }) => {
      if (!disposed) resizeTerminal(sessionId, cols, rows);
    });

    const handleData = ({ sessionId: sid, data }) => {
      if (!disposed && sid === sessionId && data) term.write(data);
    };
    const handleAttached = ({ sessionId: sid }) => {
      if (!disposed && sid === sessionId) {
        setTimeout(() => {
          if (!disposed) {
            fitAddon.fit();
            resizeTerminal(sessionId, term.cols, term.rows);
          }
        }, 100);
      }
    };
    const handleExit = ({ sessionId: sid, code }) => {
      if (!disposed && sid === sessionId) term.write(`\r\n\x1b[33m[Process exited with code ${code}]\x1b[0m\r\n`);
    };
    const handleError = ({ sessionId: sid, error }) => {
      if (!disposed && sid === sessionId) term.write(`\r\n\x1b[31m[Error: ${error}]\x1b[0m\r\n`);
    };

    socket.on('terminal:data', handleData);
    socket.on('terminal:attached', handleAttached);
    socket.on('terminal:exit', handleExit);
    socket.on('terminal:error', handleError);

    // Defer attach so React StrictMode cleanup can cancel the first
    // invocation before it fires — prevents double-scrollback on reopen.
    let attached = false;
    const attachTimer = setTimeout(() => {
      if (!disposed) {
        attached = true;
        attachTerminal(sessionId);
      }
    }, 0);

    const handleResize = () => {
      if (!disposed) fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    setTimeout(() => {
      if (!disposed) term.focus();
    }, 200);

    return () => {
      disposed = true;
      clearTimeout(attachTimer);
      cancelAnimationFrame(rafId);
      socket.off('terminal:data', handleData);
      socket.off('terminal:attached', handleAttached);
      socket.off('terminal:exit', handleExit);
      socket.off('terminal:error', handleError);
      window.removeEventListener('resize', handleResize);
      if (attached) detachTerminal(sessionId);
      term.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, [sessionId, socket, sendInput, resizeTerminal, attachTerminal, detachTerminal]);

  // Re-fit, scroll to bottom, and focus terminal when overlay becomes visible again
  useEffect(() => {
    if (visible && fitAddonRef.current && xtermRef.current) {
      requestAnimationFrame(() => {
        if (fitAddonRef.current && xtermRef.current) {
          try { fitAddonRef.current.fit(); } catch (_) {}
          xtermRef.current.scrollToBottom();
          xtermRef.current.focus();
        }
      });
    }
  }, [visible]);

  // Swipe detection on header for switching sessions
  const touchStartX = useRef(0);
  const handleHeaderTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleHeaderTouchEnd = (e) => {
    if (!projectSessions || !onSwitchSession) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const currentIdx = projectSessions.findIndex(s => s.id === sessionId);
    if (currentIdx < 0) return;
    if (dx < -60 && currentIdx < projectSessions.length - 1) {
      onSwitchSession(projectSessions[currentIdx + 1].id);
    } else if (dx > 60 && currentIdx > 0) {
      onSwitchSession(projectSessions[currentIdx - 1].id);
    }
  };

  // Mobile keyboard: focus hidden input to bring up keyboard
  const focusMobileInput = () => {
    if (mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  };

  const handleMobileInput = (e) => {
    const val = e.target.value;
    if (val) {
      sendInput(sessionId, val);
      e.target.value = '';
    }
  };

  const handleMobileKeyDown = (e) => {
    const keyMap = {
      'Enter': '\r',
      'Backspace': '\x7f',
      'Tab': '\t',
      'ArrowUp': '\x1b[A',
      'ArrowDown': '\x1b[B',
      'ArrowRight': '\x1b[C',
      'ArrowLeft': '\x1b[D',
    };
    if (keyMap[e.key]) {
      e.preventDefault();
      sendInput(sessionId, keyMap[e.key]);
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: '\u21B5', value: '\r', color: '#3060A0' }, // Enter
    { label: 'Tab', value: '\t', color: '#606060' },
    { label: '\u2191', value: '\x1b[A', color: '#606060' }, // Up
    { label: '\u2193', value: '\x1b[B', color: '#606060' }, // Down
  ];

  // Git commands
  const gitActions = [
    { label: 'Status', cmd: 'git status\r' },
    { label: 'Diff', cmd: 'git diff --stat\r' },
    { label: 'Log', cmd: 'git log --oneline -5\r' },
    { label: 'Create PR', cmd: 'gh pr create --fill\r' },
  ];

  // Session position indicator
  const currentIdx = projectSessions ? projectSessions.findIndex(s => s.id === sessionId) : -1;
  const totalSessions = projectSessions ? projectSessions.length : 0;

  return (
    <div className="terminal-overlay" style={visible ? undefined : { display: 'none' }}>
      <div
        className="terminal-header"
        onTouchStart={handleHeaderTouchStart}
        onTouchEnd={handleHeaderTouchEnd}
      >
        <div className="terminal-title">
          <span className="terminal-dot green" />
          <span>{sessionName || 'Terminal'}</span>
          {totalSessions > 1 && (
            <span className="terminal-pos">{currentIdx + 1}/{totalSessions}</span>
          )}
        </div>
        <div className="terminal-header-actions">
          {isMobile && (
            <button className="terminal-btn" onClick={focusMobileInput}>KB</button>
          )}
          <button
            className={`terminal-btn ${gitMenuOpen ? 'active' : ''}`}
            onClick={() => setGitMenuOpen(!gitMenuOpen)}
          >GIT</button>
          <button className="terminal-close" onClick={onClose}>X</button>
        </div>
      </div>

      {/* Git dropdown */}
      {gitMenuOpen && (
        <div className="terminal-git-menu">
          {gitActions.map(a => (
            <button
              key={a.label}
              className="terminal-git-item"
              onClick={() => { sendInput(sessionId, a.cmd); setGitMenuOpen(false); }}
            >{a.label}</button>
          ))}
        </div>
      )}

      <div className="terminal-body" ref={termRef} />

      {/* Quick action toolbar */}
      <div className="terminal-quick-actions">
        {quickActions.map(a => (
          <button
            key={a.label}
            className="quick-action-btn"
            style={{ borderColor: a.color, color: a.color }}
            onClick={() => sendInput(sessionId, a.value)}
          >{a.label}</button>
        ))}
      </div>

      {/* Hidden mobile input */}
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

      {/* Swipe hint for multi-session */}
      {totalSessions > 1 && (
        <div className="terminal-swipe-hint">
          {currentIdx > 0 && <span className="swipe-arrow left">{'\u25C0'}</span>}
          <span>swipe header to switch</span>
          {currentIdx < totalSessions - 1 && <span className="swipe-arrow right">{'\u25B6'}</span>}
        </div>
      )}
    </div>
  );
}
