import { authFetch } from '../authFetch.js';

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

// Uploads an image blob to the server and returns the saved file path,
// or null if the upload failed.
export async function uploadImageBlob(blob, mimeType) {
  const data = await blobToBase64(blob);
  const res = await authFetch('/api/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, mimeType }),
  });
  if (!res.ok) return null;
  const { path } = await res.json();
  return path;
}

// Reads the system clipboard. If it contains an image, uploads it and
// returns its server-side path. Otherwise returns the clipboard text
// (or empty string). Returns null if the clipboard API is unavailable.
export async function readClipboardForTerminal() {
  if (!navigator.clipboard?.read) {
    if (navigator.clipboard?.readText) {
      return { kind: 'text', value: await navigator.clipboard.readText() };
    }
    return null;
  }
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const imageType = item.types.find((t) => t.startsWith('image/'));
      if (imageType) {
        const blob = await item.getType(imageType);
        const path = await uploadImageBlob(blob, imageType);
        return path ? { kind: 'image', value: path } : null;
      }
    }
    return { kind: 'text', value: await navigator.clipboard.readText() };
  } catch {
    if (navigator.clipboard.readText) {
      return { kind: 'text', value: await navigator.clipboard.readText() };
    }
    return null;
  }
}
