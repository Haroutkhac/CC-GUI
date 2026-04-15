import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { uploadImageBlob, readClipboardForTerminal } from '../lib/clipboard.js';

const SCROLLBACK_LINES = 10000;

const TERMINAL_THEME = {
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
};

function createTerminal(isMobile) {
  return new Terminal({
    cursorBlink: true,
    fontSize: isMobile ? 12 : 14,
    fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
    theme: TERMINAL_THEME,
    allowProposedApi: true,
    scrollback: SCROLLBACK_LINES,
  });
}

// Returns the xterm custom-key-event handler for Cmd/Ctrl shortcuts:
// A (handled by overlay), C (copy), V (paste text/image), K (clear).
function buildKeyEventHandler(term, lifecycle, sendInput, sessionId) {
  return (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod || e.type !== 'keydown') return true;

    switch (e.key) {
      case 'a':
        e.preventDefault();
        return false;
      case 'c':
        if (term.hasSelection()) {
          e.preventDefault();
          navigator.clipboard.writeText(term.getSelection()).catch((err) => {
            console.warn('Failed to copy selection:', err);
          });
          term.clearSelection();
          return false;
        }
        return true;
      case 'v':
        e.preventDefault();
        readClipboardForTerminal()
          .then((result) => {
            if (!result || lifecycle.disposed) return;
            sendInput(sessionId, result.value);
          })
          .catch((err) => console.warn('Clipboard paste failed:', err));
        return false;
      case 'k':
        e.preventDefault();
        term.clear();
        return false;
      default:
        return true;
    }
  };
}

// Native paste handler for right-click / mobile paste. xterm's custom
// key handler only catches Cmd/Ctrl+V; this catches the rest.
function buildNativePasteHandler(lifecycle, sendInput, sessionId) {
  return async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (!item.type.startsWith('image/')) continue;
      e.preventDefault();
      e.stopPropagation();
      const blob = item.getAsFile();
      if (!blob) return;
      try {
        const path = await uploadImageBlob(blob, item.type);
        if (path && !lifecycle.disposed) sendInput(sessionId, path);
      } catch (err) {
        console.warn('Failed to upload pasted image:', err);
      }
      return;
    }
  };
}

function attachSocketHandlers({ socket, sessionId, term, lifecycle, fitAddon, attachTerminal, resizeTerminal }) {
  const handleData = ({ sessionId: sid, data }) => {
    if (!lifecycle.disposed && sid === sessionId && data) term.write(data);
  };
  const handleAttached = ({ sessionId: sid }) => {
    if (lifecycle.disposed || sid !== sessionId) return;
    setTimeout(() => {
      if (lifecycle.disposed) return;
      fitAddon.fit();
      resizeTerminal(sessionId, term.cols, term.rows);
    }, 100);
  };
  const handleExit = ({ sessionId: sid, code }) => {
    if (!lifecycle.disposed && sid === sessionId) {
      term.write(`\r\n\x1b[33m[Process exited with code ${code}]\x1b[0m\r\n`);
    }
  };
  const handleError = ({ sessionId: sid, error }) => {
    if (!lifecycle.disposed && sid === sessionId) {
      term.write(`\r\n\x1b[31m[Error: ${error}]\x1b[0m\r\n`);
    }
  };
  const handleRestarted = ({ sessionId: sid }) => {
    if (lifecycle.disposed || sid !== sessionId) return;
    term.clear();
    term.reset();
    term.write('\x1b[33m[Restarting terminal...]\x1b[0m\r\n');
    attachTerminal(sessionId);
  };

  socket.on('terminal:data', handleData);
  socket.on('terminal:attached', handleAttached);
  socket.on('terminal:exit', handleExit);
  socket.on('terminal:error', handleError);
  socket.on('terminal:restarted', handleRestarted);

  return () => {
    socket.off('terminal:data', handleData);
    socket.off('terminal:attached', handleAttached);
    socket.off('terminal:exit', handleExit);
    socket.off('terminal:error', handleError);
    socket.off('terminal:restarted', handleRestarted);
  };
}

export function useTerminalSession({
  containerRef,
  sessionId,
  socket,
  isMobile,
  sendInput,
  resizeTerminal,
  attachTerminal,
  detachTerminal,
}) {
  const termRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !socket) return undefined;

    if (termRef.current) {
      termRef.current.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
    }
    container.innerHTML = '';

    const lifecycle = { disposed: false };
    const term = createTerminal(isMobile);
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    term.open(container);

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    term.attachCustomKeyEventHandler(buildKeyEventHandler(term, lifecycle, sendInput, sessionId));

    const rafId = requestAnimationFrame(() => {
      if (lifecycle.disposed) return;
      try {
        fitAddon.fit();
      } catch (err) {
        console.warn('Initial fit failed:', err);
      }
    });

    term.onData((data) => {
      if (!lifecycle.disposed) sendInput(sessionId, data);
    });
    term.onResize(({ cols, rows }) => {
      if (!lifecycle.disposed) resizeTerminal(sessionId, cols, rows);
    });

    const detachSocket = attachSocketHandlers({
      socket, sessionId, term, lifecycle, fitAddon, attachTerminal, resizeTerminal,
    });

    // Defer attach so React StrictMode cleanup can cancel the first
    // invocation before it fires — prevents double-scrollback on reopen.
    let attached = false;
    const attachTimer = setTimeout(() => {
      if (lifecycle.disposed) return;
      attached = true;
      attachTerminal(sessionId);
    }, 0);

    const handleNativePaste = buildNativePasteHandler(lifecycle, sendInput, sessionId);
    container.addEventListener('paste', handleNativePaste);

    const handleResize = () => {
      if (!lifecycle.disposed) fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    const focusTimer = setTimeout(() => {
      if (!lifecycle.disposed) term.focus();
    }, 200);

    return () => {
      lifecycle.disposed = true;
      clearTimeout(attachTimer);
      clearTimeout(focusTimer);
      cancelAnimationFrame(rafId);
      detachSocket();
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('paste', handleNativePaste);
      if (attached) detachTerminal(sessionId);
      term.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
    };
  }, [sessionId, socket, sendInput, resizeTerminal, attachTerminal, detachTerminal, isMobile, containerRef]);

  return { termRef, fitAddonRef };
}
