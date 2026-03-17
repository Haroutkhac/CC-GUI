import pty from 'node-pty';
import os from 'os';

const shell = os.platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/zsh';

export class TerminalManager {
  constructor() {
    this.terminals = new Map(); // sessionId -> { pty, scrollback }
  }

  create(sessionId, command, args = [], options = {}) {
    const { cwd, onData, onExit } = options;

    const env = { ...process.env, TERM: 'xterm-256color' };

    const ptyProcess = pty.spawn(command || shell, args, {
      name: 'xterm-256color',
      cols: 120,
      rows: 30,
      cwd: cwd || process.env.HOME,
      env,
    });

    const entry = {
      pty: ptyProcess,
      scrollback: '',
    };

    ptyProcess.onData((data) => {
      // Store scrollback (keep last 100KB)
      entry.scrollback += data;
      if (entry.scrollback.length > 100000) {
        entry.scrollback = entry.scrollback.slice(-100000);
      }
      if (onData) onData(data);
    });

    ptyProcess.onExit(({ exitCode }) => {
      this.terminals.delete(sessionId);
      if (onExit) onExit(exitCode);
    });

    this.terminals.set(sessionId, entry);
    return entry;
  }

  get(sessionId) {
    return this.terminals.get(sessionId);
  }

  write(sessionId, data) {
    const entry = this.terminals.get(sessionId);
    if (entry) {
      entry.pty.write(data);
    }
  }

  resize(sessionId, cols, rows) {
    const entry = this.terminals.get(sessionId);
    if (entry) {
      try {
        entry.pty.resize(cols, rows);
      } catch (e) {
        // Ignore resize errors
      }
    }
  }

  getScrollback(sessionId) {
    const entry = this.terminals.get(sessionId);
    return entry ? entry.scrollback : null;
  }

  kill(sessionId) {
    const entry = this.terminals.get(sessionId);
    if (entry) {
      try {
        entry.pty.kill();
      } catch (e) {
        // Already dead
      }
      this.terminals.delete(sessionId);
    }
  }

  killAll() {
    for (const [id] of this.terminals) {
      this.kill(id);
    }
  }
}
