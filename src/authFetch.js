/**
 * Wrapper around fetch() that attaches the Authorization header from the
 * cached auth token in localStorage. Use for any /api/* calls outside of
 * the useSocket apiCall helper.
 */
export function authFetch(url, options = {}) {
  const token = localStorage.getItem('cc-gui-token');
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}
