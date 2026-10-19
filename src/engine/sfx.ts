// Tiny square-wave sound effects, Game Boy style. No audio files needed.

let ac: AudioContext | null = null;

/** The one audio context (sound effects and music share it). */
export function audioContext(): AudioContext | null {
  if (!ac) {
    try {
      ac = new AudioContext();
    } catch {
      ac = null;
    }
  }
  return ac;
}

export function unlockAudio() {
  if (!ac) {
    try {
      ac = new AudioContext();
    } catch {
      ac = null;
    }
  }
  if (ac && ac.state === 'suspended') ac.resume();
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'square', vol = 0.06) {
  if (!ac) return;
  const t = ac.currentTime + start;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function seq(notes: [number, number][], step = 0.09, type: OscillatorType = 'square', vol = 0.06) {
  notes.forEach(([f, len], i) => tone(f, i * step, step * len, type, vol));
}

export type Sfx =
  | 'blip' | 'select' | 'bump' | 'door' | 'hit' | 'super' | 'weak' | 'miss'
  | 'faint' | 'levelup' | 'heal' | 'right' | 'perfect' | 'wrong' | 'throw'
  | 'shake' | 'caught' | 'encounter' | 'badge' | 'alert' | 'jump';

export function sfx(name: Sfx) {
  if (!ac) return;
  switch (name) {
    case 'blip': return tone(1200, 0, 0.03, 'square', 0.03);
    case 'jump': return seq([[300, 1], [450, 1], [600, 1], [450, 1]], 0.04, 'square', 0.04);
    case 'select': return seq([[880, 1], [1320, 1]], 0.04, 'square', 0.04);
    case 'bump': return tone(110, 0, 0.08, 'square', 0.05);
    case 'door': return seq([[300, 1], [200, 1], [150, 2]], 0.05, 'triangle', 0.08);
    case 'hit': return seq([[200, 1], [120, 1], [80, 2]], 0.04, 'sawtooth', 0.06);
    case 'super': return seq([[300, 1], [150, 1], [300, 1], [100, 3]], 0.04, 'sawtooth', 0.07);
    case 'weak': return seq([[160, 1], [120, 2]], 0.05, 'triangle', 0.08);
    case 'miss': return seq([[400, 1], [300, 1]], 0.06, 'triangle', 0.06);
    case 'faint': return seq([[400, 1], [350, 1], [300, 1], [250, 1], [200, 1], [150, 3]], 0.07, 'square', 0.05);
    case 'levelup': return seq([[523, 1], [659, 1], [784, 1], [1047, 3]], 0.09);
    case 'heal': return seq([[784, 1], [659, 1], [784, 1], [1047, 2], [988, 1], [1047, 4]], 0.11, 'square', 0.04);
    case 'right': return seq([[880, 1], [1175, 2]], 0.07);
    case 'perfect': return seq([[784, 1], [988, 1], [1175, 1], [1568, 3]], 0.06);
    case 'wrong': return seq([[220, 2], [185, 3]], 0.1, 'square', 0.05);
    case 'throw': return seq([[600, 1], [900, 1], [1200, 1]], 0.05, 'triangle', 0.08);
    case 'shake': return seq([[180, 1], [140, 1]], 0.05, 'square', 0.04);
    case 'caught': return seq([[523, 1], [659, 1], [784, 1], [659, 1], [784, 1], [1047, 4]], 0.1);
    case 'encounter': return seq([[440, 1], [466, 1], [440, 1], [466, 1], [440, 1], [523, 3]], 0.05, 'square', 0.05);
    case 'badge': return seq([[523, 2], [523, 1], [523, 1], [698, 2], [880, 2], [1047, 4]], 0.11);
    case 'alert': return seq([[1047, 1], [1319, 2]], 0.06);
  }
}
