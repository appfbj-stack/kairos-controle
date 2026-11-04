import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Function to generate a valid PNG file in pure Node.js without heavy native deps
function createPng(width, height, drawFn) {
  // RGBA buffer with 1 filter byte per scanline
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(calculateCrc(crcPayload), 0);

  return Buffer.concat([lenBuf, crcPayload, crcBuf]);
}

// CRC32 implementation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function calculateCrc(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Painter for industrial construction stock badge
function paintIndustrialIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background dark navy / slate #0f172a
  let r = 15, g = 23, b = 42, a = 255;

  const maxRadius = w * (isMaskable ? 0.38 : 0.44);

  // Outer border amber ring
  if (dist >= maxRadius - 6 && dist <= maxRadius) {
    return [245, 158, 11, 255]; // Amber #f59e0b
  }

  // Inner ring
  if (dist < maxRadius - 6 && dist > maxRadius - 14) {
    return [30, 41, 59, 255]; // Slate-800
  }

  // Inside circle
  if (dist <= maxRadius - 14) {
    // 4 quadrants:
    // Top-left: Electrical (yellow spark)
    // Top-right: Mechanical (silver gear)
    // Bottom-left: Welding (orange flame)
    // Bottom-right: Plumbing (cyan water / pipe)
    const innerRadius = w * 0.12;

    // Center badge (amber circle with box)
    if (dist <= innerRadius) {
      if (dist >= innerRadius - 3) return [255, 255, 255, 255];
      // Inside center badge
      const nx = dx / innerRadius;
      const ny = dy / innerRadius;
      if (Math.abs(nx) < 0.55 && Math.abs(ny) < 0.55) {
        return [255, 255, 255, 255];
      }
      return [217, 119, 6, 255]; // Dark amber
    }

    // Quadrant dividers
    if (Math.abs(dx) < 2 || Math.abs(dy) < 2) {
      return [51, 65, 85, 255]; // divider line
    }

    if (dx < 0 && dy < 0) {
      // Top-left: Eletrica (Yellow)
      // Draw lightning bolt
      const lx = dx + w * 0.22;
      const ly = dy + h * 0.22;
      if (Math.abs(lx + ly * 0.5) < w * 0.05 && dist < maxRadius * 0.75) {
        return [234, 179, 8, 255]; // Gold/Yellow #eab308
      }
      return [23, 37, 84, 255]; // Deep Blue
    } else if (dx >= 0 && dy < 0) {
      // Top-right: Mecânica (Steel Grey)
      const gx = dx - w * 0.22;
      const gy = dy + h * 0.22;
      const gdist = Math.sqrt(gx * gx + gy * gy);
      if (gdist > w * 0.04 && gdist < w * 0.09) {
        return [148, 163, 184, 255]; // Slate-400
      }
      return [30, 41, 59, 255];
    } else if (dx < 0 && dy >= 0) {
      // Bottom-left: Solda (Orange Flame)
      const fx = dx + w * 0.22;
      const fy = dy - h * 0.22;
      const fdist = Math.sqrt(fx * fx + fy * fy);
      if (fdist < w * 0.08) {
        return [249, 115, 22, 255]; // Orange #f97316
      }
      return [39, 39, 42, 255];
    } else {
      // Bottom-right: Hidraulica / Encanamento (Cyan Blue)
      const px = dx - w * 0.22;
      const py = dy - h * 0.22;
      const pdist = Math.sqrt(px * px + py * py);
      if (pdist < w * 0.08) {
        return [56, 189, 248, 255]; // Sky-400 #38bdf8
      }
      return [12, 74, 110, 255];
    }
  }

  return [r, g, b, a];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PNG icons for PWA...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, (x, y, w, h) => paintIndustrialIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, (x, y, w, h) => paintIndustrialIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, (x, y, w, h) => paintIndustrialIcon(x, y, w, h, true)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, (x, y, w, h) => paintIndustrialIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(64, 64, (x, y, w, h) => paintIndustrialIcon(x, y, w, h, false)));
console.log('PNG Icons generated successfully.');
