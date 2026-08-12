import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(root, "public", "icons");

const palette = {
  canvas: [245, 245, 247, 255],
  blue: [0, 113, 227, 255],
  white: [255, 255, 255, 255]
};

await Promise.all([
  writeIcon("icon-192.png", 192, 0.06),
  writeIcon("icon-512.png", 512, 0.06),
  writeIcon("maskable-512.png", 512, 0.18)
]);

async function writeIcon(fileName, size, paddingRatio) {
  const pixels = new Uint8Array(size * size * 4);
  fillRect(pixels, size, 0, 0, size, size, palette.canvas);

  const pad = Math.round(size * paddingRatio);
  const surfaceSize = size - pad * 2;
  fillRoundedRect(
    pixels,
    size,
    pad,
    pad,
    surfaceSize,
    surfaceSize,
    surfaceSize * 0.24,
    palette.blue
  );

  drawMonogram(pixels, size, pad, surfaceSize, palette.white);

  await writeFile(join(outputDir, fileName), encodePng(size, size, pixels));
}

function drawMonogram(pixels, size, pad, surfaceSize, color) {
  const glyphHeight = surfaceSize * 0.4;
  const stroke = surfaceSize * 0.072;
  const gap = surfaceSize * 0.075;
  const pWidth = surfaceSize * 0.235;
  const wWidth = surfaceSize * 0.31;
  const totalWidth = pWidth + gap + wWidth;
  const x = pad + (surfaceSize - totalWidth) / 2;
  const y = pad + (surfaceSize - glyphHeight) / 2;

  fillRect(pixels, size, x, y, stroke, glyphHeight, color);
  fillRect(pixels, size, x, y, pWidth, stroke, color);
  fillRect(pixels, size, x + pWidth - stroke, y, stroke, glyphHeight * 0.56, color);
  fillRect(pixels, size, x, y + glyphHeight * 0.48, pWidth, stroke, color);

  const wX = x + pWidth + gap;
  fillRect(pixels, size, wX, y, stroke, glyphHeight, color);
  fillRect(pixels, size, wX + wWidth - stroke, y, stroke, glyphHeight, color);
  fillRect(pixels, size, wX + (wWidth - stroke) / 2, y + glyphHeight * 0.34, stroke, glyphHeight * 0.66, color);
  fillRect(pixels, size, wX, y + glyphHeight - stroke, wWidth, stroke, color);
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

function fillRoundedRect(pixels, size, x, y, width, height, radius, color) {
  const x0 = clamp(Math.round(x), 0, size);
  const y0 = clamp(Math.round(y), 0, size);
  const x1 = clamp(Math.round(x + width), 0, size);
  const y1 = clamp(Math.round(y + height), 0, size);
  const roundedRadius = Math.min(radius, width / 2, height / 2);
  const leftCenter = x + roundedRadius;
  const rightCenter = x + width - roundedRadius;
  const topCenter = y + roundedRadius;
  const bottomCenter = y + height - roundedRadius;

  for (let row = y0; row < y1; row += 1) {
    for (let col = x0; col < x1; col += 1) {
      const pointX = col + 0.5;
      const pointY = row + 0.5;
      const nearestX = clamp(pointX, leftCenter, rightCenter);
      const nearestY = clamp(pointY, topCenter, bottomCenter);
      const distance = Math.hypot(pointX - nearestX, pointY - nearestY);

      if (distance <= roundedRadius) {
        const index = (row * size + col) * 4;
        pixels[index] = color[0];
        pixels[index + 1] = color[1];
        pixels[index + 2] = color[2];
        pixels[index + 3] = color[3];
      }
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
