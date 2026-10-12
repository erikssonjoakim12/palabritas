export type Dir = 'up' | 'down' | 'left' | 'right';
export type Btn = Dir | 'A' | 'B' | 'START';
type Handler = (b: Btn) => void;

const isDir = (b: Btn): b is Dir => b === 'up' || b === 'down' || b === 'left' || b === 'right';

/**
 * Buttons come from the keyboard or the on-screen pad. UI code pushes a handler to
 * receive presses exclusively (top of stack wins); otherwise presses are queued for the
 * world to poll once per frame.
 */
class Input {
  private held = new Set<Btn>();
  private dirOrder: Dir[] = [];
  private just = new Set<Btn>();
  private handlers: Handler[] = [];

  down(b: Btn) {
    if (this.held.has(b)) return;
    this.held.add(b);
    if (isDir(b)) {
      this.dirOrder = this.dirOrder.filter((d) => d !== b);
      this.dirOrder.push(b);
    }
    const h = this.handlers[this.handlers.length - 1];
    if (h) h(b);
    else this.just.add(b);
  }

  up(b: Btn) {
    this.held.delete(b);
    if (isDir(b)) this.dirOrder = this.dirOrder.filter((d) => d !== b);
  }

  isHeld(b: Btn) {
    return this.held.has(b);
  }

  /** Most recently pressed direction that is still held. */
  dir(): Dir | null {
    return this.dirOrder.length ? this.dirOrder[this.dirOrder.length - 1] : null;
  }

  pressed(b: Btn) {
    return this.just.has(b);
  }

  endFrame() {
    this.just.clear();
  }

  clearPressed() {
    this.just.clear();
  }

  releaseAll() {
    this.held.clear();
    this.dirOrder = [];
  }

  /** Receive all presses until the returned function is called. */
  push(h: Handler): () => void {
    this.handlers.push(h);
    return () => {
      const i = this.handlers.lastIndexOf(h);
      if (i >= 0) this.handlers.splice(i, 1);
    };
  }
}

export const input = new Input();

const KEYS: Record<string, Btn> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
  z: 'A', ' ': 'A', j: 'A',
  x: 'B', Escape: 'B', k: 'B',
  Enter: 'START',
};

function isTyping(e: Event) {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
}

export function initInput() {
  window.addEventListener('keydown', (e) => {
    if (isTyping(e)) return;
    const b = KEYS[e.key] ?? KEYS[e.key.toLowerCase()];
    if (!b) return;
    e.preventDefault();
    input.down(b);
  });
  window.addEventListener('keyup', (e) => {
    const b = KEYS[e.key] ?? KEYS[e.key.toLowerCase()];
    if (b) input.up(b);
  });
  window.addEventListener('blur', () => input.releaseAll());

  // A / B / START buttons
  document.querySelectorAll<HTMLElement>('[data-btn]').forEach((el) => {
    const b = el.dataset.btn as Btn;
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      el.classList.add('down');
      input.down(b);
    });
    const release = () => {
      el.classList.remove('down');
      input.up(b);
    };
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  // D-pad: direction follows the finger so you can slide between directions.
  const pad = document.getElementById('dpad')!;
  let current: Dir | null = null;
  const setDir = (d: Dir | null) => {
    if (d === current) return;
    if (current) input.up(current);
    current = d;
    if (d) input.down(d);
  };
  const dirAt = (e: PointerEvent): Dir | null => {
    const r = pad.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < r.width * 0.1) return current;
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
  };
  pad.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    pad.setPointerCapture(e.pointerId);
    setDir(dirAt(e));
  });
  pad.addEventListener('pointermove', (e) => {
    if (current) setDir(dirAt(e));
  });
  const end = () => setDir(null);
  pad.addEventListener('pointerup', end);
  pad.addEventListener('pointercancel', end);
  pad.addEventListener('contextmenu', (e) => e.preventDefault());
}

/** Resolve with the next press of one of `btns`. */
export function waitFor(btns: Btn[]): Promise<Btn> {
  return new Promise((resolve) => {
    const pop = input.push((b) => {
      if (btns.includes(b)) {
        pop();
        resolve(b);
      }
    });
  });
}
