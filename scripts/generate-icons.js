import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal PNG encoder with Node.js built-in zlib
function createPng(width, height, r, g, b, innerR, innerG, innerB) {
  // Raw RGBA image data: (width * 4 + 1 filter byte) per row
  const rowLength = width * 4 + 1;
  const rawData = Buffer.alloc(rowLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dist = Math.hypot(x - cx, y - cy);

      if (dist <= radius) {
        // Inner circle / logo color (Teal / Emerald gradient)
        rawData[pixelOffset] = innerR;
        rawData[pixelOffset + 1] = innerG;
        rawData[pixelOffset + 2] = innerB;
        rawData[pixelOffset + 3] = 255;
      } else {
        // Background color (Slate dark)
        rawData[pixelOffset] = r;
        rawData[pixelOffset + 1] = g;
        rawData[pixelOffset + 2] = b;
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crcBuf = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(crcBuf);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// CRC32 implementation
function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }

  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// 192x192
const pwa192 = createPng(192, 192, 15, 23, 42, 16, 185, 129);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

// 512x512
const pwa512 = createPng(512, 512, 15, 23, 42, 16, 185, 129);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

// 512x512 maskable (with 15% safe zone margin)
const pwaMaskable = createPng(512, 512, 10, 15, 30, 52, 211, 153);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable);

// Apple touch icon (180x180)
const appleIcon = createPng(180, 180, 15, 23, 42, 16, 185, 129);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// Icon SVG
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#0f172a" />
  <circle cx="256" cy="256" r="160" fill="url(#grad)" />
  <path d="M200 260 L240 300 L320 210" stroke="#0f172a" stroke-width="36" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);

console.log('PWA icons successfully generated in /public !');
