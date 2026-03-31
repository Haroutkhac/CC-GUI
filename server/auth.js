import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const AUTH_DIR = path.join(os.homedir(), '.cc-gui');
const TOKEN_PATH = path.join(AUTH_DIR, 'auth-token');

/**
 * Load or generate the auth token.
 * On first launch, generates a random token and saves to ~/.cc-gui/auth-token.
 * Returns the token string.
 */
export function loadOrCreateToken() {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      const token = fs.readFileSync(TOKEN_PATH, 'utf-8').trim();
      if (token.length >= 64) return token;
    }
  } catch {}

  // Generate new token
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const token = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(TOKEN_PATH, token, { mode: 0o600 }); // owner-only read/write
  return token;
}

/**
 * Express middleware that checks Authorization: Bearer <token> on /api/* routes.
 * Skips favicon, non-API routes, and the auth-token endpoint.
 */
export function authMiddleware(token) {
  return (req, res, next) => {
    // Skip non-API routes (static files, favicon)
    if (!req.path.startsWith('/api/')) return next();

    // Skip the token endpoint (chicken-and-egg: need token to get token)
    if (req.path === '/api/auth-token') return next();

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Pass Authorization: Bearer <token>' });
    }

    const provided = authHeader.slice(7);
    try {
      if (!crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(token))) {
        return res.status(403).json({ error: 'Invalid token' });
      }
    } catch {
      return res.status(403).json({ error: 'Invalid token' });
    }

    next();
  };
}

/**
 * Socket.IO middleware that checks socket.handshake.auth.token.
 */
export function socketAuthMiddleware(token) {
  return (socket, next) => {
    const provided = socket.handshake.auth?.token;
    if (!provided || typeof provided !== 'string') {
      return next(new Error('Authentication required'));
    }

    try {
      if (!crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(token))) {
        return next(new Error('Invalid token'));
      }
    } catch {
      return next(new Error('Invalid token'));
    }

    next();
  };
}
