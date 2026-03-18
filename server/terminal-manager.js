import pty from 'node-pty';
import os from 'os';
import { SCROLLBACK_LIMIT } from './utils.js';

const shell = os.platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/zsh';

export class TerminalManager {
  constructor() {
    this.terminals = new Map(); // sessionId -> { pty, scrollback }
  }

  create(sessionId, command, args = [], options = {}) {
    const { cwd, onData, onExit } = options;

    const home = process.env.HOME || '/Users/' + process.env.USER;
    const extraPaths = [
      `${home}/.local/bin`,
      `${home}/.npm-global/bin`,
      '/usr/local/bin',
    ];
    const env = {
      ...process.env,
      TERM: 'xterm-256color',
      PATH: [...extraPaths, process.env.PATH].join(':'),
    };

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
      entry.scrollback += data;
      if (entry.scrollback.length > SCROLLBACK_LIMIT) {
        entry.scrollback = entry.scrollback.slice(-SCROLLBACK_LIMIT);
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
