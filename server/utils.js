// Shared utilities

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

// Capitalize the first letter of a string
export function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// Buffer size constants
export const SCROLLBACK_LIMIT = 100000;    // 100KB per terminal session
export const STATUS_BUFFER_LIMIT = 4000;   // For status detection in server
export const ORCHESTRATOR_BUFFER_LIMIT = 8000; // For orchestrator analysis
