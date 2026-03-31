// Shared utilities

const DEFAULT_PROTECTED_AGENT_COMMANDS = ['codex', 'openai'];

export function parseBoolean(value, defaultValue = false) {
  if (value == null || value === '') return defaultValue;
  return /^(1|true|yes|on)$/i.test(String(value).trim());
}

export function parseCsv(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export function normalizeCommandName(command = '') {
  const trimmed = String(command || '').trim();
  if (!trimmed) return '';
  const base = trimmed.split(/\s+/)[0] || '';
  const withoutPath = base.split(/[\\/]/).pop() || '';
  return withoutPath.toLowerCase();
}

export function getProtectedAgentCommands(env = process.env) {
  const configured = parseCsv(env.PROTECTED_AGENT_COMMANDS).map(cmd => cmd.toLowerCase());
  return configured.length > 0 ? configured : DEFAULT_PROTECTED_AGENT_COMMANDS;
}

export function getDefaultSessionCommand(env = process.env) {
  return String(env.DEFAULT_SESSION_COMMAND || 'claude').trim() || 'claude';
}

export function classifyCommand(command, env = process.env) {
  const baseCommand = normalizeCommandName(command);
  const protectedCommands = getProtectedAgentCommands(env);
  const sessionType = protectedCommands.includes(baseCommand) ? 'protected_agent' : 'generic_terminal';
  const knownSafeCommands = new Set([
    'claude',
    'codex',
    'openai',
    'bash',
    'sh',
    'zsh',
    'fish',
    'npm',
    'pnpm',
    'yarn',
    'node',
    'python',
    'python3',
    'git',
    'gh',
  ]);

  return {
    baseCommand,
    sessionType,
    unsafeCommand: baseCommand ? !knownSafeCommands.has(baseCommand) : false,
  };
}

export function buildSafeModeConfig(env = process.env) {
  const safeMode = parseBoolean(env.OPENAI_SAFE_MODE, true);
  const host = env.HOST || (safeMode ? '127.0.0.1' : '0.0.0.0');
  const allowUnsafeRemote = parseBoolean(env.ALLOW_UNSAFE_REMOTE, false);
  const allowedOrigins = parseCsv(env.ALLOWED_ORIGINS);
  const protectedAgentCommands = getProtectedAgentCommands(env);
  const defaultSessionCommand = getDefaultSessionCommand(env);
  const inferredLocalOrigins = [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:3456',
    'http://localhost:3456',
  ];

  const effectiveOrigins = allowedOrigins.length > 0
    ? allowedOrigins
    : (safeMode ? inferredLocalOrigins : []);

  if (safeMode) {
    if (host !== '127.0.0.1' && !allowUnsafeRemote) {
      throw new Error(`OPENAI_SAFE_MODE forbids HOST=${host}. Use HOST=127.0.0.1 or set ALLOW_UNSAFE_REMOTE=true.`);
    }
    if (effectiveOrigins.includes('*')) {
      throw new Error('OPENAI_SAFE_MODE forbids ALLOWED_ORIGINS=*; provide explicit origins instead.');
    }
  }

  return {
    safeMode,
    host,
    allowUnsafeRemote,
    allowedOrigins: effectiveOrigins,
    protectedAgentCommands,
    defaultSessionCommand,
  };
}

// Strip ANSI escape sequences from terminal output
export function stripAnsi(str) {
  return str
    .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')   // CSI sequences (colors, cursor)
    .replace(/\x1b\][^\x07]*\x07/g, '')        // OSC sequences (title, hyperlinks)
    .replace(/\x1b\[\?[0-9;]*[a-zA-Z]/g, '')   // Private mode sequences
    .replace(/\x1b[()][A-Z0-9]/g, '')           // Character set selection
    .replace(/\x1b=/g, '')                       // Application keypad
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '') // Control chars (keep \n \r \t)
    .trim();
}

// Extract OSC (Operating System Command) sequences before ANSI stripping
// These are \x1b]0;...\x07 sequences that set the terminal title
export function extractOSC(str) {
  const matches = [];
  const re = /\x1b\]0;([^\x07]*)\x07/g;
  let match;
  while ((match = re.exec(str)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

// Claude Code terminal title prefixes (from screens/REPL.tsx)
// When Claude is busy, the title animates between these two braille chars (960ms interval)
export const TITLE_BUSY_PREFIXES = ['⠂', '⠐'];
// When Claude is idle/waiting, the title uses this static prefix
export const TITLE_IDLE_PREFIX = '✳';

// Capitalize the first letter of a string
export function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// Buffer size constants
export const SCROLLBACK_LIMIT = 100000;    // 100KB per terminal session
export const STATUS_BUFFER_LIMIT = 4000;   // For status detection in server
export const ORCHESTRATOR_BUFFER_LIMIT = 8000; // For orchestrator analysis
