import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';

const REGIONS = [
  { name: 'Kanto', starters: ['bulbasaur', 'charmander', 'squirtle'] },
  { name: 'Johto', starters: ['chikorita', 'cyndaquil', 'totodile'] },
  { name: 'Hoenn', starters: ['treecko', 'torchic', 'mudkip'] },
  { name: 'Sinnoh', starters: ['turtwig', 'chimchar', 'piplup'] },
  { name: 'Unova', starters: ['snivy', 'tepig', 'oshawott'] },
  { name: 'Kalos', starters: ['chespin', 'fennekin', 'froakie'] },
  { name: 'Alola', starters: ['rowlet', 'litten', 'popplio'] },
  { name: 'Galar', starters: ['grookey', 'scorbunny', 'sobble'] },
];

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
      console.error('Failed to load store:', e);
    }
  }

  save() {
    // Debounce writes to prevent race conditions from rapid updates
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      try {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
      } catch (e) {
        console.error('Failed to save store:', e);
      }
    }, 100);
  }

  getProjects() { return Object.values(this.data.projects); }
  getProject(id) { return this.data.projects[id] || null; }

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

  getSessions() { return Object.values(this.data.sessions); }
  getSession(id) { return this.data.sessions[id] || null; }
  getSessionsByProject(projectId) {
    return Object.values(this.data.sessions).filter(s => s.projectId === projectId);
  }

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
      createdAt: new Date().toISOString(),
    };
    this.data.sessions[id] = session;
    this.save();
    return session;
  }

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
