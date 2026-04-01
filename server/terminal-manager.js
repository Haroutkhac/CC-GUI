import pty from 'node-pty';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { SCROLLBACK_LIMIT } from './utils.js';

const shell = os.platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/zsh';
const SCROLLBACK_SAVE_INTERVAL = 5000; // debounce disk writes to every 5s

export class TerminalManager {
  constructor({ dataDir } = {}) {
    this.terminals = new Map(); // sessionId -> { pty, scrollback, saveTimer }
    this.deadScrollback = new Map(); // sessionId -> scrollback (preserved after exit)
    this.scrollbackDir = dataDir ? path.join(dataDir, 'scrollback') : null;
    if (this.scrollbackDir) {
      fs.promises.mkdir(this.scrollbackDir, { recursive: true }).catch(() => {});
    }
  }

  _scrollbackPath(sessionId) {
    return this.scrollbackDir ? path.join(this.scrollbackDir, `${sessionId}.buf`) : null;
  }

  async _saveScrollbackToDisk(sessionId, scrollback) {
    const filePath = this._scrollbackPath(sessionId);
    if (!filePath) return;
    try {
      await fs.promises.writeFile(filePath, scrollback);
    } catch (e) {
      // Non-fatal — disk persistence is best-effort
    }
  }

  async _loadScrollbackFromDisk(sessionId) {
    const filePath = this._scrollbackPath(sessionId);
    if (!filePath) return null;
    try {
      return await fs.promises.readFile(filePath, 'utf-8');
    } catch (e) {
      // Non-fatal — file may not exist
      return null;
    }
  }

  async _deleteScrollbackFromDisk(sessionId) {
    const filePath = this._scrollbackPath(sessionId);
    if (!filePath) return;
    try {
      await fs.promises.unlink(filePath);
    } catch (e) {
      // Non-fatal — file may not exist
    }
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
      saveTimer: null,
    };

    ptyProcess.onData((data) => {
      entry.scrollback += data;
      if (entry.scrollback.length > SCROLLBACK_LIMIT) {
        entry.scrollback = entry.scrollback.slice(-SCROLLBACK_LIMIT);
      }
      if (onData) onData(data);

      // Debounced save to disk
      if (!entry.saveTimer) {
        entry.saveTimer = setTimeout(() => {
          this._saveScrollbackToDisk(sessionId, entry.scrollback).catch(() => {});
          entry.saveTimer = null;
        }, SCROLLBACK_SAVE_INTERVAL);
      }
    });

    ptyProcess.onExit(({ exitCode }) => {
      // Flush any pending save and do a final write
      if (entry.saveTimer) clearTimeout(entry.saveTimer);
      this._saveScrollbackToDisk(sessionId, entry.scrollback).catch(() => {});

      // Preserve scrollback so re-attaching shows previous output
      this.deadScrollback.set(sessionId, entry.scrollback);
      // Cap dead scrollback entries to prevent unbounded memory growth
      if (this.deadScrollback.size > 50) {
        const oldest = this.deadScrollback.keys().next().value;
        this.deadScrollback.delete(oldest);
      }
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

  async getScrollback(sessionId) {
    const entry = this.terminals.get(sessionId);
    if (entry) return entry.scrollback;
    const dead = this.deadScrollback.get(sessionId);
    if (dead) return dead;
    return (await this._loadScrollbackFromDisk(sessionId)) || null;
  }

  kill(sessionId) {
    const entry = this.terminals.get(sessionId);
    if (entry) {
      if (entry.saveTimer) clearTimeout(entry.saveTimer);
      try {
        entry.pty.kill();
      } catch (e) {
        // Already dead
      }
      this.terminals.delete(sessionId);
    }
    this.deadScrollback.delete(sessionId);
    this._deleteScrollbackFromDisk(sessionId).catch(() => {});
  }

  killAll() {
    for (const [id] of this.terminals) {
      this.kill(id);
    }
  }
}
