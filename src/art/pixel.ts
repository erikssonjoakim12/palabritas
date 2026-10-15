export type Img = HTMLCanvasElement;
export type Palette = Record<string, string>;

export function makeCanvas(w: number, h: number): Img {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/** Build an image from rows of characters. Characters missing from the palette are transparent. */
export function fromRows(rows: string[], pal: Palette, name = '?'): Img {
  const h = rows.length;
  const w = rows[0].length;
  const c = makeCanvas(w, h);
  const g = c.getContext('2d')!;
  rows.forEach((row, y) => {
    if (row.length !== w) throw new Error(`Sprite ${name}: row ${y} has ${row.length} chars, expected ${w}`);
    for (let x = 0; x < w; x++) {
      const col = pal[row[x]];
      if (col) {
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    }
  });
  return c;
}

/** A copy without the fully transparent rows and columns around the drawing. */
export function trim(src: Img): Img {
  const { data, width, height } = src.getContext('2d')!.getImageData(0, 0, src.width, src.height);
  let [x0, y0, x1, y1] = [width, height, -1, -1];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!data[(y * width + x) * 4 + 3]) continue;
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
  }
  if (x1 < 0) return src;
  const c = makeCanvas(x1 - x0 + 1, y1 - y0 + 1);
  c.getContext('2d')!.drawImage(src, -x0, -y0);
  return c;
}

/** A left-right flipped copy. */
export function mirror(src: Img): Img {
  const c = makeCanvas(src.width, src.height);
  const g = c.getContext('2d')!;
  g.translate(src.width, 0);
  g.scale(-1, 1);
  g.drawImage(src, 0, 0);
  return c;
}

/**
 * A tiny rasterizer for drawing creatures from simple shapes with hard pixel edges
 * (no anti-aliasing), plus an automatic outline pass.
 */
export class Pix {
  private px: (string | null)[];
  constructor(public w: number, public h: number) {
    this.px = new Array(w * h).fill(null);
  }
  set(x: number, y: number, c: string | null) {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.px[y * this.w + x] = c;
    return this;
  }
  get(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.px[y * this.w + x];
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, c: string) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, c);
      }
    }
    return this;
  }
  rect(x: number, y: number, w: number, h: number, c: string) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
    return this;
  }
  poly(pts: [number, number][], c: string) {
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
        if (inPoly(x + 0.5, y + 0.5, pts)) this.set(x, y, c);
      }
    }
    return this;
  }
  line(x0: number, y0: number, x1: number, y1: number, c: string) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= steps; i++) this.set(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps, c);
    return this;
  }
  /** Small pattern stamped at (x, y): '1' pixels get color c. */
  stamp(x: number, y: number, rows: string[], c: string) {
    rows.forEach((r, j) => [...r].forEach((ch, i) => ch === '1' && this.set(x + i, y + j, c)));
    return this;
  }
  /** Outline every filled shape with a dark edge. */
  outline(c: string) {
    const add: [number, number][] = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.get(x, y)) continue;
        if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) add.push([x, y]);
      }
    }
    add.forEach(([x, y]) => this.set(x, y, c));
    return this;
  }
  toCanvas(): Img {
    const c = makeCanvas(this.w, this.h);
    const g = c.getContext('2d')!;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const col = this.px[y * this.w + x];
        if (col) {
          g.fillStyle = col;
          g.fillRect(x, y, 1, 1);
        }
      }
    }
    return c;
  }
}

function inPoly(x: number, y: number, pts: [number, number][]) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
