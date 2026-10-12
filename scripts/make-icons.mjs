// Generates public/icon-192.png and public/icon-512.png (a big pixel Esfera) without
// any image dependencies. Run with: npm run icons
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const ROWS = [
  '................',
  '.....oooooo.....',
  '...ooaaaaaaoo...',
  '..oaaaaaaaaaao..',
  '..ohaawwwwaaao..',
  '.ohaawwwwwwaaao.',
  '.ohaawwwwwwaaao.',
  '.oaaaawwwwaaaao.',
  '.oaaaawaaaaaabo.',
  '.oaaaaaaaaaabbo.',
  '..oaaaaaaaabbo..',
  '..obaaaaaabbbo..',
  '...oobbbbbboo...',
  '.....oooooo.....',
  '................',
  '................',
];
const PAL = { o: [24, 56, 56], a: [56, 192, 176], b: [32, 136, 120], h: [168, 240, 232], w: [255, 255, 255] };
const BG = [43, 35, 80];

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

function png(size) {
  const pad = Math.round(size * 0.12);
  const cell = (size - pad * 2) / 16;
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const gx = Math.floor((x - pad) / cell);
      const gy = Math.floor((y - pad + cell) / cell); // nudge down to center the ball
      const ch = gx >= 0 && gx < 16 && gy >= 0 && gy < 16 ? ROWS[gy][gx] : '.';
      const col = PAL[ch] ?? BG;
      raw.set(col, y * (size * 3 + 1) + 1 + x * 3);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [192, 512]) writeFileSync(new URL(`../public/icon-${size}.png`, import.meta.url), png(size));
console.log('icons written');
