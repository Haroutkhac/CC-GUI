import './types.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { REGIONS } from '../shared/constants.js';

export class Store {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = { projects: {}, sessions: {} };
    this._saveTimer = null;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
      }
    } catch (e) {
      console.warn('Failed to load store from primary file:', e.message);
    }

    // If primary was missing or failed to load, try the backup
    const isDefault = Object.keys(this.data.projects).length === 0
      && Object.keys(this.data.sessions).length === 0;
    if (isDefault) {
      const bakPath = this.filePath + '.bak';
      try {
        if (fs.existsSync(bakPath)) {
          console.warn('Falling back to backup file:', bakPath);
          this.data = JSON.parse(fs.readFileSync(bakPath, 'utf-8'));
          console.warn('Successfully restored data from backup.');
        }
      } catch (e2) {
        console.error('Failed to load store from backup:', e2.message);
      }
    }
  }

  save() {
    // Debounce writes to prevent race conditions from rapid updates
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      try {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // Keep a backup of the current file before overwriting
        try {
          if (fs.existsSync(this.filePath)) {
            fs.copyFileSync(this.filePath, this.filePath + '.bak');
          }
        } catch (backupErr) {
          console.warn('Failed to create backup (continuing with save):', backupErr.message);
        }

        // Atomic write: write to temp file, then rename into place
        const tmpPath = this.filePath + '.tmp';
        fs.writeFileSync(tmpPath, JSON.stringify(this.data, null, 2));
        fs.renameSync(tmpPath, this.filePath);
      } catch (e) {
        console.error('Failed to save store:', e);
      }
    }, 100);
  }

  /** @returns {Project[]} */
  getProjects() { return Object.values(this.data.projects); }

  /**
   * @param {string} id
   * @returns {Project|null}
   */
  getProject(id) { return this.data.projects[id] || null; }

  /**
   * @param {string} name
   * @param {string} projectPath
   * @returns {Project}
   */
  createProject(name, projectPath) {
    const id = uuid();
    const projectCount = Object.keys(this.data.projects).length;
    const region = REGIONS[projectCount % REGIONS.length];

    const project = {
      id,
      name,
      path: projectPath,
      region: region.name,
      starters: region.starters,
      createdAt: new Date().toISOString(),
    };
    this.data.projects[id] = project;
    this.save();
    return project;
  }

  deleteProject(id) {
    delete this.data.projects[id];
    for (const [sid, session] of Object.entries(this.data.sessions)) {
      if (session.projectId === id) delete this.data.sessions[sid];
    }
    this.save();
  }

  /** @returns {Session[]} */
  getSessions() { return Object.values(this.data.sessions); }

  /**
   * @param {string} id
   * @returns {Session|null}
   */
  getSession(id) { return this.data.sessions[id] || null; }

  /**
   * @param {string} projectId
   * @returns {Session[]}
   */
  getSessionsByProject(projectId) {
    return Object.values(this.data.sessions).filter(s => s.projectId === projectId);
  }

  /**
   * @param {string} projectId
   * @param {string} name
   * @param {string} [command]
   * @returns {Session|null}
   */
  createSession(projectId, name, command) {
    const id = uuid();
    const project = this.data.projects[projectId];
    if (!project) return null;

    // Pick a starter from this project's region
    const existingSessions = this.getSessionsByProject(projectId);
    const starterIdx = existingSessions.length % project.starters.length;
    const starter = project.starters[starterIdx];

    const session = {
      id,
      projectId,
      name,
      command: command || 'claude',
      status: 'idle',
      starter,
      claudeSessionId: null, // set when Claude CLI is spawned with --session-id
      createdAt: new Date().toISOString(),
    };
    this.data.sessions[id] = session;
    this.save();
    return session;
  }

  /**
   * @param {string} id
   * @param {Partial<Session>} updates
   * @returns {Session|null}
   */
  updateSession(id, updates) {
    if (!this.data.sessions[id]) return null;
    Object.assign(this.data.sessions[id], updates);
    this.save();
    return this.data.sessions[id];
  }

  deleteSession(id) {
    delete this.data.sessions[id];
    this.save();
  }
}
