import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(root, "public", "icons");

const palette = {
  ink: [23, 26, 23, 255],
  paper: [246, 247, 240, 255],
  edge: [15, 127, 134, 255],
  quant: [159, 29, 52, 255],
  white: [255, 255, 255, 255]
};

await Promise.all([
  writeIcon("icon-192.png", 192, 0.12),
  writeIcon("icon-512.png", 512, 0.12),
  writeIcon("maskable-512.png", 512, 0.22)
]);

async function writeIcon(fileName, size, paddingRatio) {
  const pixels = new Uint8Array(size * size * 4);
  fillRect(pixels, size, 0, 0, size, size, palette.ink);

  const pad = Math.round(size * paddingRatio);
  fillRect(pixels, size, pad, pad, size - pad * 2, size - pad * 2, palette.paper);

  const railWidth = Math.max(6, Math.round(size * 0.045));
  fillRect(pixels, size, pad, pad, railWidth, size - pad * 2, palette.edge);
  fillRect(pixels, size, size - pad - railWidth, pad, railWidth, size - pad * 2, palette.quant);

  const scale = size / 512;
  drawP(pixels, size, scale, palette.ink);
  drawW(pixels, size, scale, palette.ink);

  await writeFile(join(outputDir, fileName), encodePng(size, size, pixels));
}

function drawP(pixels, size, scale, color) {
  const x = 142 * scale;
  const y = 148 * scale;
  const stem = 42 * scale;
  const width = 116 * scale;
  const top = 42 * scale;
  const middle = 38 * scale;

  fillRect(pixels, size, x, y, stem, 216 * scale, color);
  fillRect(pixels, size, x, y, width, top, color);
  fillRect(pixels, size, x + width - stem, y, stem, 120 * scale, color);
  fillRect(pixels, size, x, y + 104 * scale, width, middle, color);
}

function drawW(pixels, size, scale, color) {
  const y = 148 * scale;
  const left = 274 * scale;
  const stroke = 38 * scale;
  const height = 216 * scale;
  const depth = 58 * scale;

  fillRect(pixels, size, left, y, stroke, height, color);
  fillRect(pixels, size, left + 62 * scale, y + depth, stroke, height - depth, color);
  fillRect(pixels, size, left + 124 * scale, y, stroke, height, color);
  fillRect(pixels, size, left + 32 * scale, y + height - stroke, 70 * scale, stroke, color);
  fillRect(pixels, size, left + 94 * scale, y + height - stroke, 68 * scale, stroke, color);
}

function fillRect(pixels, size, x, y, width, height, color) {
  const x0 = clamp(Math.round(x), 0, size);
  const y0 = clamp(Math.round(y), 0, size);
  const x1 = clamp(Math.round(x + width), 0, size);
  const y1 = clamp(Math.round(y + height), 0, size);

  for (let row = y0; row < y1; row += 1) {
    for (let col = x0; col < x1; col += 1) {
      const index = (row * size + col) * 4;
      pixels[index] = color[0];
      pixels[index + 1] = color[1];
      pixels[index + 2] = color[2];
      pixels[index + 3] = color[3];
    }
  }
}

function encodePng(width, height, rgba) {
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);

  for (let y = 0; y < height; y += 1) {
    raw[y * stride] = 0;
    Buffer.from(rgba.buffer, y * width * 4, width * 4).copy(raw, y * stride + 1);
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", Buffer.concat([uint32(width), uint32(height), Buffer.from([8, 6, 0, 0, 0])])),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  return Buffer.concat([uint32(data.length), typeBuffer, data, uint32(crc32(Buffer.concat([typeBuffer, data])))]);
}

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0, 0);
  return buffer;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
