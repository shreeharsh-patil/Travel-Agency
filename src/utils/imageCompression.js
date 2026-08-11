/**
 * Client-side image compression for review photo uploads.
 * Decodes a chosen file, scales it down to a sane dimension, and re-encodes
 * it as a compressed JPEG data URL — typically 10–20× smaller than the
 * original phone photo, so reviews stay light for the DB and the network.
 *
 * Modern browsers apply EXIF orientation automatically when decoding via
 * <img>, so portrait phone photos are exported the right way up.
 */

const DEFAULT_OPTIONS = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.72,
  maxBytes: 500 * 1024 // 500 KB cap per image
};

export async function compressImageFile(file, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (JPG, PNG, WebP).');
  }
  // Guard against giant files that would be fully decoded into memory.
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('That photo is too large (max 15 MB).');
  }

  let img;
  try {
    img = await decodeImage(file);
  } catch {
    throw new Error('Could not read that image. Please try another file.');
  }

  // Preserve aspect ratio, but never upscale.
  const scale = Math.min(1, opts.maxWidth / img.width, opts.maxHeight / img.height);
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser.');

  // White backdrop so transparent PNGs don't turn black.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // Re-encode as JPEG, stepping quality down if the cap is exceeded.
  let quality = opts.quality;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  while (estimateBytes(dataUrl) > opts.maxBytes && quality > 0.35) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  return {
    dataUrl,
    width,
    height,
    bytes: estimateBytes(dataUrl)
  };
}

function decodeImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    const cleanup = () => {
      img.onload = null;
      img.onerror = null;
      URL.revokeObjectURL(url);
    };
    img.onload = () => {
      cleanup();
      resolve(img);
    };
    img.onerror = () => {
      cleanup();
      reject(new Error('Image decode failed'));
    };
    img.src = url;
  });
}

/** Exact decoded byte size of a base64 data URL (accounts for = padding). */
export function estimateBytes(dataUrl) {
  const comma = dataUrl.indexOf(',');
  const b64 = comma === -1 ? dataUrl : dataUrl.slice(comma + 1);
  const padding = (b64.match(/=+$/) || [''])[0].length;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}
