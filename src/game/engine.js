import {
  drawPlayer, drawPokemonWithStatus, drawTable, drawFloorTile, drawWallTile,
  drawBookshelf, drawPlant, drawRug, drawLabel, drawPokemonName,
  drawDoormat, drawSign,
} from './sprites.js';

const TILE = 16;
const STEP_DURATION = 150; // ms to move one tile

const FLOOR = 0;
const WALL_TOP = 1;
const WALL_BOT = 2;
const TABLE = 3;
const BOOKSHELF = 4;
const PLANT = 5;
const RUG = 6;
const DOORMAT = 7;
const SIGN = 8;

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scale = 3;
    this.tileSize = TILE * this.scale;

    // Player - grid-snapped
    this.player = {
      tileX: 8, tileY: 10,     // current tile
      pixelX: 8, pixelY: 10,   // visual position (for smooth interpolation)
      targetX: 8, targetY: 10, // move target
      direction: 'down',
      frame: 0,
      moving: false,
      moveStart: 0,
    };

    this.keys = {};
    this.keyBuffer = null; // buffered direction for responsive controls

    // World
    this.projects = [];
    this.sessions = [];
    this.tablePositions = [];
    this.npcPositions = [];

    // Map
    this.mapWidth = 20;
    this.mapHeight = 18;
    this.map = this.generateBaseMap();

    // Camera
    this.camera = { x: 0, y: 0 };

    // Interaction
    this.nearbyNPC = null;
    this.nearbyTable = null;
    this.onInteract = null;
    this.onTableInteract = null;

    // Animation
    this.lastTime = performance.now();
    this.running = true;
    this.loop = this.loop.bind(this);

    this.setupInput();
  }

  generateBaseMap() {
    const w = this.mapWidth;
    const h = this.mapHeight;
    const map = [];

    for (let y = 0; y < h; y++) {
      const row = [];
      for (let x = 0; x < w; x++) {
        if (y <= 1) {
          row.push(WALL_TOP);
        } else if (y === 2) {
          row.push(WALL_BOT);
        } else if (x === 0 || x === w - 1) {
          row.push(WALL_BOT);
        } else if (y === h - 1) {
          if (x === Math.floor(w / 2) - 1 || x === Math.floor(w / 2)) {
            row.push(DOORMAT);
          } else {
            row.push(WALL_BOT);
          }
        } else {
          row.push(FLOOR);
        }
      }
      map.push(row);
    }

    // Decorations
    map[2][2] = BOOKSHELF;
    map[2][3] = BOOKSHELF;
    map[2][w - 3] = BOOKSHELF;
    map[2][w - 4] = BOOKSHELF;
    map[2][Math.floor(w / 2)] = SIGN;

    map[3][1] = PLANT;
    map[3][w - 2] = PLANT;
    map[h - 2][1] = PLANT;
    map[h - 2][w - 2] = PLANT;

    return map;
  }

  updateWorld(projects, sessions) {
    this.projects = projects || [];
    this.sessions = sessions || [];
    this.tablePositions = [];
    this.npcPositions = [];
    this._labelWidths = {};

    // Reset map
    this.map = this.generateBaseMap();

    const tablesPerRow = 3;
    const tableSpacingX = 6;
    const tableSpacingY = 5;
    const startX = 3;
    const startY = 5;

    const numProjects = this.projects.length;
    const rowsNeeded = Math.ceil(numProjects / tablesPerRow);
    const neededHeight = startY + rowsNeeded * tableSpacingY + 4;
    const neededWidth = startX + tablesPerRow * tableSpacingX + 3;

    if (neededHeight > this.mapHeight || neededWidth > this.mapWidth) {
      this.mapWidth = Math.max(this.mapWidth, neededWidth);
      this.mapHeight = Math.max(this.mapHeight, neededHeight);
      this.map = this.generateBaseMap();
    }

    this.projects.forEach((project, idx) => {
      const col = idx % tablesPerRow;
      const row = Math.floor(idx / tablesPerRow);
      const tx = startX + col * tableSpacingX;
      const ty = startY + row * tableSpacingY;

      if (ty < this.mapHeight - 1 && tx < this.mapWidth - 1) {
        this.map[ty][tx] = TABLE;
        this.tablePositions.push({
          projectId: project.id,
          x: tx, y: ty,
          name: project.name,
          region: project.region || 'Kanto',
        });

        const projectSessions = this.sessions.filter(s => s.projectId === project.id);
        projectSessions.forEach((session, sIdx) => {
          let nx, ny, labelSide;
          // Seat Pokemon around the table like chairs
          // labelSide tells renderer which side to put the name tag
          switch (sIdx % 4) {
            case 0: nx = tx; ny = ty + 1; labelSide = 'below'; break;     // below table
            case 1: nx = tx + 1; ny = ty; labelSide = 'right'; break;     // right of table
            case 2: nx = tx - 1; ny = ty; labelSide = 'left'; break;      // left of table
            case 3: nx = tx; ny = ty - 1; labelSide = 'above'; break;     // above table (under project label)
          }
          if (ny >= 3 && ny < this.mapHeight - 1 && nx >= 1 && nx < this.mapWidth - 1) {
            this.npcPositions.push({
              sessionId: session.id,
              x: nx, y: ny,
              starter: session.starter || 'bulbasaur',
              status: session.status || 'idle',
              name: session.name,
              labelSide,
            });
          }
        });

        // Rug around table
        for (let dy = -1; dy <= 2; dy++) {
          for (let dx = -1; dx <= 2; dx++) {
            const ry = ty + dy;
            const rx = tx + dx;
            if (ry >= 3 && ry < this.mapHeight - 1 && rx >= 1 && rx < this.mapWidth - 1) {
              if (this.map[ry][rx] === FLOOR) {
                this.map[ry][rx] = RUG;
              }
            }
          }
        }
      }
    });
  }

  setupInput() {
    const isTyping = () => {
      const el = document.activeElement;
      return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    };

    const handleKeyDown = (e) => {
      // Don't capture keys when typing in form inputs
      if (isTyping()) return;

      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)) {
        e.preventDefault();
      }
      this.keys[e.key] = true;

      // Interaction keys
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'z') {
        e.preventDefault();
        if (this.nearbyNPC) {
          this.onInteract?.(this.nearbyNPC.sessionId);
        } else if (this.nearbyTable) {
          this.onTableInteract?.(this.nearbyTable.projectId);
        }
      }
    };

    const handleKeyUp = (e) => {
      if (isTyping()) return;
      this.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Click/tap interactions
    const handlePointer = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
      const py = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
      if (px === undefined) return;

      const worldX = (px + this.camera.x) / this.tileSize;
      const worldY = (py + this.camera.y) / this.tileSize;

      // Check NPC click
      for (const npc of this.npcPositions) {
        if (Math.abs(worldX - npc.x - 0.5) < 1 && Math.abs(worldY - npc.y - 0.5) < 1) {
          this.onInteract?.(npc.sessionId);
          return;
        }
      }

      // Check table click
      for (const table of this.tablePositions) {
        if (Math.abs(worldX - table.x - 0.5) < 1 && Math.abs(worldY - table.y - 0.5) < 1) {
          this.onTableInteract?.(table.projectId);
          return;
        }
      }

      // Click-to-move: walk toward clicked tile
      this._clickTarget = { x: Math.floor(worldX), y: Math.floor(worldY) };
    };

    this.canvas.addEventListener('click', handlePointer);
    const handleTouch = (e) => { e.preventDefault(); handlePointer(e); };
    this.canvas.addEventListener('touchstart', handleTouch, { passive: false });

    this._cleanup = () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      this.canvas.removeEventListener('click', handlePointer);
      this.canvas.removeEventListener('touchstart', handleTouch);
    };
  }

  getDirection() {
    if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) return 'up';
    if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) return 'down';
    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) return 'left';
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) return 'right';
    return null;
  }

  isWalkable(x, y) {
    if (x < 1 || x >= this.mapWidth - 1 || y < 3 || y >= this.mapHeight - 1) return false;
    const tile = this.map[y]?.[x];
    if (tile === WALL_TOP || tile === WALL_BOT || tile === TABLE || tile === BOOKSHELF || tile === PLANT) return false;
    for (const npc of this.npcPositions) {
      if (npc.x === x && npc.y === y) return false;
    }
    return true;
  }

  update(now) {
    const p = this.player;

    if (p.moving) {
      // Animate movement
      const elapsed = now - p.moveStart;
      const t = Math.min(1, elapsed / STEP_DURATION);

      p.pixelX = p.tileX + (p.targetX - p.tileX) * t;
      p.pixelY = p.tileY + (p.targetY - p.tileY) * t;

      if (t >= 1) {
        // Arrived
        p.tileX = p.targetX;
        p.tileY = p.targetY;
        p.pixelX = p.tileX;
        p.pixelY = p.tileY;
        p.moving = false;
        p.frame = 0;
      } else {
        // Walk animation
        p.frame = Math.floor(t * 4) % 2 === 0 ? 1 : 2;
      }
    }

    if (!p.moving) {
      let dir = this.getDirection();

      // Click-to-move
      if (!dir && this._clickTarget) {
        const dx = this._clickTarget.x - p.tileX;
        const dy = this._clickTarget.y - p.tileY;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
          this._clickTarget = null;
        } else if (Math.abs(dx) >= Math.abs(dy)) {
          dir = dx > 0 ? 'right' : 'left';
        } else {
          dir = dy > 0 ? 'down' : 'up';
        }
      }

      if (dir) {
        p.direction = dir;
        let nx = p.tileX, ny = p.tileY;
        if (dir === 'up') ny--;
        else if (dir === 'down') ny++;
        else if (dir === 'left') nx--;
        else if (dir === 'right') nx++;

        if (this.isWalkable(nx, ny)) {
          p.targetX = nx;
          p.targetY = ny;
          p.moving = true;
          p.moveStart = now;
          p.frame = 1;
        } else {
          // Can't walk - clear click target if hitting wall
          if (this._clickTarget) this._clickTarget = null;
        }
      }
    }

    // Detect nearby entities
    this.nearbyNPC = null;
    this.nearbyTable = null;

    const facingX = p.tileX + (p.direction === 'left' ? -1 : p.direction === 'right' ? 1 : 0);
    const facingY = p.tileY + (p.direction === 'up' ? -1 : p.direction === 'down' ? 1 : 0);

    for (const npc of this.npcPositions) {
      if (npc.x === facingX && npc.y === facingY) {
        this.nearbyNPC = npc;
        break;
      }
      // Also check adjacent
      if (Math.abs(npc.x - p.tileX) + Math.abs(npc.y - p.tileY) <= 1) {
        this.nearbyNPC = npc;
      }
    }

    for (const table of this.tablePositions) {
      if (table.x === facingX && table.y === facingY) {
        this.nearbyTable = table;
        break;
      }
      if (Math.abs(table.x - p.tileX) + Math.abs(table.y - p.tileY) <= 1) {
        this.nearbyTable = table;
      }
    }

    // Camera - snap to player, smooth follow
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const targetCamX = p.pixelX * this.tileSize - canvasW / 2 + this.tileSize / 2;
    const targetCamY = p.pixelY * this.tileSize - canvasH / 2 + this.tileSize / 2;

    this.camera.x += (targetCamX - this.camera.x) * 0.15;
    this.camera.y += (targetCamY - this.camera.y) * 0.15;

    const worldW = this.mapWidth * this.tileSize;
    const worldH = this.mapHeight * this.tileSize;
    this.camera.x = Math.max(0, Math.min(worldW - canvasW, this.camera.x));
    this.camera.y = Math.max(0, Math.min(worldH - canvasH, this.camera.y));
  }

  render() {
    const { ctx, canvas, camera, tileSize } = this;
    const s = this.scale;

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

    // Visible tile range
    const startCol = Math.max(0, Math.floor(camera.x / tileSize) - 1);
    const endCol = Math.min(this.mapWidth, Math.ceil((camera.x + canvas.width) / tileSize) + 1);
    const startRow = Math.max(0, Math.floor(camera.y / tileSize) - 1);
    const endRow = Math.min(this.mapHeight, Math.ceil((camera.y + canvas.height) / tileSize) + 1);

    // Draw tiles
    for (let y = startRow; y < endRow; y++) {
      for (let x = startCol; x < endCol; x++) {
        const tile = this.map[y]?.[x];
        const px = x * tileSize;
        const py = y * tileSize;

        switch (tile) {
          case FLOOR: drawFloorTile(ctx, px, py, s, (x + y) % 2); break;
          case WALL_TOP: drawWallTile(ctx, px, py, s, true); break;
          case WALL_BOT: drawWallTile(ctx, px, py, s, false); break;
          case TABLE:
            drawFloorTile(ctx, px, py, s, 0);
            drawTable(ctx, px, py, s);
            break;
          case BOOKSHELF:
            drawWallTile(ctx, px, py, s, false);
            drawBookshelf(ctx, px, py, s);
            break;
          case PLANT: drawPlant(ctx, px, py, s); break;
          case RUG: drawRug(ctx, px, py, s); break;
          case DOORMAT: drawDoormat(ctx, px, py, s); break;
          case SIGN:
            drawWallTile(ctx, px, py, s, false);
            drawSign(ctx, px, py, s);
            break;
        }
      }
    }

    // Collect all entities for Y-sort rendering
    const entities = [];

    // NPCs
    for (const npc of this.npcPositions) {
      entities.push({ type: 'npc', y: npc.y, data: npc });
    }

    // Player
    entities.push({
      type: 'player',
      y: this.player.pixelY,
      data: this.player,
    });

    // Sort by Y for proper overlap
    entities.sort((a, b) => a.y - b.y);

    for (const entity of entities) {
      if (entity.type === 'npc') {
        const npc = entity.data;
        const px = npc.x * tileSize;
        const py = npc.y * tileSize;
        drawPokemonWithStatus(ctx, px, py, npc.starter, npc.status, s);
      } else if (entity.type === 'player') {
        const p = entity.data;
        drawPlayer(ctx, p.pixelX * tileSize, p.pixelY * tileSize, p.direction, p.frame, s);
      }
    }

    // Project name labels above tables
    if (this.tablePositions.length > 0) {
      const fontSize = 5 * s;
      const pad = 3 * s;
      const lh = fontSize + pad * 2;
      ctx.save();
      ctx.font = `${fontSize}px "Press Start 2P", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const table of this.tablePositions) {
        const label = table.name || 'Project';
        // Cache measureText result per label
        if (!this._labelWidths) this._labelWidths = {};
        if (this._labelWidths[label] === undefined) {
          this._labelWidths[label] = ctx.measureText(label).width;
        }
        const lw = this._labelWidths[label] + pad * 2;
        const px = table.x * tileSize;
        const py = table.y * tileSize;
        const cx = px + tileSize / 2;
        const cy = py - 8 * s;
        ctx.fillStyle = 'rgba(56, 56, 56, 0.85)';
        ctx.fillRect(Math.round(cx - lw / 2), Math.round(cy - lh / 2), Math.round(lw), Math.round(lh));
        ctx.fillStyle = '#F8F8F0';
        ctx.fillText(label, cx, cy);
      }
      ctx.restore();
    }

    ctx.restore();

    // Interaction prompt (Pokemon-style bottom bar)
    if (this.nearbyNPC) {
      this.drawPromptBox(`Press ENTER to talk to ${this.nearbyNPC.name}`);
    } else if (this.nearbyTable && !this.nearbyNPC) {
      this.drawPromptBox(`Press ENTER for ${this.nearbyTable.name}`);
    }
  }

  drawPromptBox(text) {
    const { ctx, canvas } = this;
    ctx.imageSmoothingEnabled = true;

    const padding = 12;
    const fontSize = 10;
    const boxH = fontSize + padding * 2;
    const boxW = canvas.width - 32;
    const x = 16;
    const y = canvas.height - boxH - 16;

    // Pokemon-style white box with dark border
    ctx.fillStyle = '#F8F8F0';
    ctx.fillRect(x, y, boxW, boxH);

    // Dark border (3px)
    ctx.strokeStyle = '#383838';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, boxW, boxH);

    // Inner highlight
    ctx.strokeStyle = '#E0D8C8';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4, y + 4, boxW - 8, boxH - 8);

    // Text
    ctx.fillStyle = '#383838';
    ctx.font = `${fontSize}px "Press Start 2P", monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + padding, y + boxH / 2);

    // Blinking arrow
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillText('\u25BC', x + boxW - padding - 10, y + boxH / 2);
    }

    ctx.imageSmoothingEnabled = false;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    if (rect.width < 600) {
      this.scale = 2;
    } else {
      this.scale = 3;
    }
    this.tileSize = TILE * this.scale;
  }

  loop(time) {
    if (!this.running) return;
    this.update(time);
    this.render();
    requestAnimationFrame(this.loop);
  }

  start() {
    this.running = true;
    this.resize();
    requestAnimationFrame(this.loop);
  }

  stop() { this.running = false; }

  destroy() {
    this.running = false;
    this._clickTarget = null;
    this.keys = {};
    this._cleanup?.();
  }
}
