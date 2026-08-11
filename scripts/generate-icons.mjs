/**
 * PWA icon generator — zero dependencies.
 * Draws a gold compass mark on the brand dark background and writes
 * standard PNG files (192, 512, 180 apple-touch-icon, maskable 512)
 * using only Node's built-in zlib.
 *
 * Usage: node scripts/generate-icons.mjs
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'icons');

// ---- tiny PNG encoder ----
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---- drawing ----
const BG = [12, 12, 12];       // #0c0c0c
const GOLD = [232, 193, 90];   // brand gold
const GOLD_DARK = [198, 158, 60];

function drawIcon(size) {
  const px = Buffer.alloc(size * size * 4);
  const c = size / 2;
  const ringOuter = size * 0.37;
  const ringThickness = size * 0.05;
  const ringInner = ringOuter - ringThickness;
  const centerR = size * 0.075;
  const tickR1 = ringInner - size * 0.045;
  const tickR2 = ringInner - size * 0.012;
  const TICK_ANGLE = 0.16;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - c;
      const dy = y + 0.5 - c;
      const dist = Math.hypot(dx, dy);
      const idx = (y * size + x) * 4;
      let color = BG;

      if (dist <= ringOuter && dist >= ringInner) {
        color = GOLD;
      } else if (dist <= centerR) {
        color = GOLD;
      } else if (dist <= tickR2 && dist >= tickR1) {
        const angle = Math.atan2(dy, dx);
        for (const base of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
          let diff = Math.abs(angle - base);
          if (diff > Math.PI) diff = 2 * Math.PI - diff;
          if (diff <= TICK_ANGLE) color = GOLD_DARK;
        }
      }

      px[idx] = color[0];
      px[idx + 1] = color[1];
      px[idx + 2] = color[2];
      px[idx + 3] = 255;
    }
  }
  return encodePNG(size, size, px);
}

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'maskable-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }
];

for (const { name, size } of targets) {
  const png = drawIcon(size);
  writeFileSync(join(OUT_DIR, name), png);
  console.log(`✓ ${name} (${size}x${size}, ${(png.length / 1024).toFixed(1)} KB)`);
}
console.log('Icons written to public/icons/');
