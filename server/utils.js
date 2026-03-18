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

// Buffer size constants
export const SCROLLBACK_LIMIT = 100000;    // 100KB per terminal session
export const STATUS_BUFFER_LIMIT = 4000;   // For status detection in server
export const ORCHESTRATOR_BUFFER_LIMIT = 8000; // For orchestrator analysis
