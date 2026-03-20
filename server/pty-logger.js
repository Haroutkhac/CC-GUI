import fs from 'fs';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export class PtyLogger {
  constructor() {
    this.enabled = process.env.PTY_RAW_LOG === '1';
    this.streams = new Map(); // sessionId -> { stream, size, filePath }
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
    this.closeAll();
  }

  log(sessionId, rawData) {
    if (!this.enabled) return;

    let entry = this.streams.get(sessionId);
    if (!entry) {
      const filePath = `/tmp/claude-pty-raw-${sessionId}.log`;
      const stream = fs.createWriteStream(filePath, { flags: 'a' });
      stream.on('error', () => {}); // swallow — logging is best-effort
      entry = { stream, size: 0, filePath };
      this.streams.set(sessionId, entry);
    }

    const line = `[${new Date().toISOString()}] ${JSON.stringify(rawData)}\n`;
    const lineSize = Buffer.byteLength(line);
    entry.size += lineSize;

    // Truncate and restart if exceeded max size
    if (entry.size > MAX_FILE_SIZE) {
      entry.stream.end();
      entry.stream = fs.createWriteStream(entry.filePath, { flags: 'w' });
      entry.stream.on('error', () => {}); // swallow — logging is best-effort
      entry.size = lineSize;
    }

    entry.stream.write(line);
  }

  close(sessionId) {
    const entry = this.streams.get(sessionId);
    if (entry) {
      entry.stream.end();
      this.streams.delete(sessionId);
    }
  }

  closeAll() {
    for (const sessionId of [...this.streams.keys()]) {
      this.close(sessionId);
    }
  }
}
