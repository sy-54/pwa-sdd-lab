// ホーム画面用アイコンを生成する（1回だけ実行して icons/ をコミットする）: tsx platform/scripts/make-icons.ts
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { crc32, deflateSync } from 'node:zlib';

function png(size: number, pixel: (x: number, y: number) => [number, number, number]): Buffer {
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) raw.set(pixel(x, y), y * (1 + size * 3) + 1 + x * 3);
  const chunk = (type: string, data: Buffer) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const out = Buffer.alloc(8 + body.length);
    out.writeUInt32BE(data.length, 0);
    body.copy(out, 4);
    out.writeUInt32BE(crc32(body), 4 + body.length);
    return out;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// 青地に、角丸の白いタイルを 2×2 で並べる
const BG: [number, number, number] = [10, 102, 216];
const TILES: [number, number, number][] = [[255, 255, 255], [190, 220, 255], [190, 220, 255], [255, 255, 255]];
function icon(size: number) {
  const margin = 0.2, gap = 0.07, tile = (1 - margin * 2 - gap) / 2, radius = tile * 0.24;
  return png(size, (px, py) => {
    const x = (px + 0.5) / size, y = (py + 0.5) / size;
    for (let i = 0; i < 4; i++) {
      const left = margin + (i % 2) * (tile + gap), top = margin + Math.floor(i / 2) * (tile + gap);
      const dx = Math.max(left + radius - x, 0, x - (left + tile - radius)), dy = Math.max(top + radius - y, 0, y - (top + tile - radius));
      if (x >= left && x <= left + tile && y >= top && y <= top + tile && dx * dx + dy * dy <= radius * radius) return TILES[i];
    }
    return BG;
  });
}
for (const size of [180, 512]) writeFileSync(join(import.meta.dirname, `../icons/icon-${size}.png`), icon(size));
console.log('icons/icon-180.png, icons/icon-512.png を生成');
