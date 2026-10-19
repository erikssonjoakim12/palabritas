/*
  A Game Boy-style music player, made in code like the sound effects (no audio files). Four voices, like the
  Game Boy's channels: the melody (a square wave), the harmony (a thinner square wave, or a marimba for a
  Nicaraguan sound), the bass (the soft "wave" channel) and drums (noise).

  A song is a melody and a chord per bar (data/music.ts); the harmony, bass and drums are built from the chords
  in the song's style. Notes are written like 'A4:2' (the note and octave, then its length in steps; a step is
  a sixteenth note) and 'r:4' is a rest. Not in the game yet: the music page (musica.html) plays the samples.
*/

export type Style = 'walk' | 'calm' | 'battle' | 'son' | 'cave' | 'jingle';
export type Voice = 'melody' | 'harmony' | 'bass' | 'drums';
export type Timbre = 'pulse50' | 'pulse25' | 'pulse12' | 'marimba' | 'wave';

export interface Song {
  id: string;
  name: string;
  en: string;
  kind: 'route' | 'town' | 'place' | 'battle' | 'jingle';
  /** What it's meant to feel like (shown on the music page). */
  note: string;
  /** Beats per minute; a beat is `stepsPerBeat` steps (4 = quarter notes, 6 = dotted quarters for 6/8). */
  bpm: number;
  stepsPerBeat: number;
  /** Steps per bar: 16 for 4/4, 12 for 6/8. */
  barSteps: number;
  style: Style;
  melodyTimbre: Timbre;
  harmonyTimbre: Timbre;
  /** One chord per bar ('Em A' splits the bar in two). */
  chords: string[];
  /** One string of notes per bar. */
  melody: string[];
  /** Played once before the loop starts (battles: the run into the fight). */
  intro?: { chords: string[]; melody: string[] };
  /** Jingles play once (the default is to loop). */
  once?: boolean;
}

interface Note {
  step: number;
  len: number;
  /** A MIDI note number, or a drum. */
  pitch: number | 'k' | 's' | 'h';
}

const PITCH: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (name: string, octave: number) => {
  const m = name.match(/^([A-G])([#b]?)$/);
  if (!m) throw new Error(`Bad note: ${name}`);
  return 12 * (octave + 1) + PITCH[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
};
const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);

/** 'A4:2 C#5:4 r:2' → notes with their lengths (in steps). */
function parseNotes(text: string): { pitch: number | null; len: number }[] {
  return text
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const m = tok.match(/^(r|[A-G][#b]?)(\d)?:(\d+)$/);
      if (!m) throw new Error(`Bad note "${tok}"`);
      return { pitch: m[1] === 'r' ? null : midi(m[1], Number(m[2])), len: Number(m[3]) };
    });
}

const CHORD = /^([A-G][#b]?)(m7|maj7|m|7|dim)?$/;
const SHAPES: Record<string, number[]> = { '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], dim: [0, 3, 6] };
/** A chord's root and its notes as pitch classes above it. */
function parseChord(name: string) {
  const m = name.match(CHORD);
  if (!m) throw new Error(`Bad chord: ${name}`);
  return { root: midi(m[1], 0) - 12, shape: SHAPES[m[2] ?? ''] };
}

/** The accompaniment's patterns: each gives, for a chord, a cycle of [step length, pitch or drum]. */
type Pattern = (root: number, shape: number[]) => [number, number | 'k' | 's' | 'h' | null][];
const at = (root: number, octave: number, interval: number) => root + 12 * (octave + 1) + interval;
const third = (s: number[]) => s[1];
const fifth = (s: number[]) => s[2];

const STYLES: Record<Style, Record<Exclude<Voice, 'melody'>, Pattern>> = {
  // Routes: a walking bass (root, fifth), chords on the off-beats, a light beat.
  walk: {
    bass: (r, s) => [[4, at(r, 2, 0)], [4, at(r, 2, fifth(s))]],
    harmony: (r, s) => [[2, null], [2, at(r, 4, third(s))], [2, null], [2, at(r, 4, fifth(s))]],
    drums: () => [[2, 'k'], [2, 'h'], [2, 's'], [2, 'h']],
  },
  // Towns at home: long bass notes and a soft broken chord.
  calm: {
    bass: (r, s) => [[8, at(r, 2, 0)], [8, at(r, 2, fifth(s))]],
    harmony: (r, s) => [[2, at(r, 4, 0)], [2, at(r, 4, third(s))], [2, at(r, 4, fifth(s))], [2, at(r, 4, third(s))]],
    drums: () => [[4, 'h']],
  },
  // Battles: a driving bass jumping octaves, short chord stabs, a busy beat.
  battle: {
    bass: (r) => [[2, at(r, 2, 0)], [2, at(r, 3, 0)]],
    harmony: (r, s) => [[2, null], [1, at(r, 4, third(s))], [1, at(r, 4, fifth(s))]],
    drums: () => [[2, 'k'], [2, 'h'], [2, 's'], [1, 'h'], [1, 'k'], [2, 'k'], [2, 'h'], [2, 's'], [2, 'h']],
  },
  // Caves: a long low note, sparse echoing notes, no beat.
  cave: {
    bass: (r) => [[16, at(r, 2, 0)]],
    harmony: (r, s) => [[4, null], [2, at(r, 5, fifth(s))], [2, null], [4, at(r, 4, third(s))], [4, null]],
    drums: () => [[16, null]],
  },
  // Jingles: the chord held under the tune.
  jingle: {
    bass: (r) => [[16, at(r, 2, 0)]],
    harmony: (r, s) => [[16, at(r, 4, third(s))]],
    drums: () => [[16, null]],
  },
  // Son nica (6/8): the marimba rolls a broken chord up and down; the bass on the two big beats.
  son: {
    bass: (r, s) => [[6, at(r, 2, 0)], [6, at(r, 2, fifth(s))]],
    harmony: (r, s) => [[2, at(r, 4, 0)], [2, at(r, 4, third(s))], [2, at(r, 4, fifth(s))], [2, at(r, 5, 0)], [2, at(r, 4, fifth(s))], [2, at(r, 4, third(s))]],
    drums: () => [[2, 'k'], [2, 'h'], [2, 'h'], [2, 's'], [2, 'h'], [2, 'h']],
  },
};

/** Fill `len` steps with a pattern, cut at the end. */
function fill(pattern: [number, number | 'k' | 's' | 'h' | null][], start: number, len: number, out: Note[]) {
  for (let t = 0, i = 0; t < len; i++) {
    const [l, pitch] = pattern[i % pattern.length];
    const n = Math.min(l, len - t);
    if (pitch !== null) out.push({ step: start + t, len: n, pitch });
    t += n;
  }
}

/**
 * A song as notes per voice: the intro (if any), then the part that loops. `intro` is where the loop starts and
 * `steps` where it ends. Throws if a bar's melody doesn't fit the bar.
 */
export function arrange(song: Song): { voices: Record<Voice, Note[]>; intro: number; steps: number } {
  const voices: Record<Voice, Note[]> = { melody: [], harmony: [], bass: [], drums: [] };
  const intro = song.intro ? addBars(song, song.intro.chords, song.intro.melody, 0, voices, 'intro') : 0;
  const steps = addBars(song, song.chords, song.melody, intro, voices, 'bar');
  return { voices, intro, steps };
}

/** Bars of melody and chords into the voices, from `from` steps on; returns where they end. */
function addBars(song: Song, chordBars: string[], melody: string[], from: number, voices: Record<Voice, Note[]>, what: string) {
  if (melody.length !== chordBars.length) throw new Error(`${song.id}: ${melody.length} ${what}s of melody, ${chordBars.length} of chords`);
  melody.forEach((bar, b) => {
    const start = from + b * song.barSteps;
    let t = 0;
    for (const n of parseNotes(bar)) {
      if (n.pitch !== null) voices.melody.push({ step: start + t, len: n.len, pitch: n.pitch });
      t += n.len;
    }
    if (t !== song.barSteps) throw new Error(`${song.id}: ${what} ${b + 1} has ${t} steps, not ${song.barSteps}`);
    const chords = chordBars[b].split(' ');
    const part = song.barSteps / chords.length;
    chords.forEach((name, c) => {
      const { root, shape } = parseChord(name);
      for (const v of ['harmony', 'bass', 'drums'] as const) fill(STYLES[song.style][v](root, shape), start + c * part, part, voices[v]);
    });
  });
  return from + melody.length * song.barSteps;
}

// ---------- Sound ----------

/** A square wave with a given duty (the Game Boy's 12.5%, 25% and 50%), as a Fourier series. */
function pulseWave(ac: AudioContext, duty: number) {
  const n = 64;
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  for (let k = 1; k < n; k++) real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
  return ac.createPeriodicWave(real, imag);
}
/** The wave channel's soft, slightly hollow tone (the bass). */
function softWave(ac: AudioContext) {
  return ac.createPeriodicWave(new Float32Array([0, 1, 0.12, 0.06, 0.03]), new Float32Array(5));
}
/** A marimba-ish tone: the fundamental and a bright fourth harmonic, struck and fading. */
function marimbaWave(ac: AudioContext) {
  return ac.createPeriodicWave(new Float32Array([0, 1, 0, 0, 0.35, 0, 0, 0, 0.1]), new Float32Array(9));
}

const LEVEL: Record<Voice, number> = { melody: 0.11, harmony: 0.05, bass: 0.13, drums: 0.07 };
/** How far ahead notes are scheduled (seconds), and how often the scheduler runs (ms). */
const AHEAD = 0.25;
const TICK = 40;

export class MusicPlayer {
  private ac: AudioContext | null = null;
  private master: GainNode | null = null;
  private gains = {} as Record<Voice, GainNode>;
  private waves = new Map<Timbre, PeriodicWave>();
  private noise: AudioBuffer | null = null;
  private timer = 0;
  private muted = new Set<Voice>();
  private volume = 0.7;
  playing: string | null = null;

  private context() {
    this.ac ??= new AudioContext();
    if (this.ac.state === 'suspended') void this.ac.resume();
    return this.ac;
  }

  private wave(t: Timbre) {
    const ac = this.ac!;
    if (!this.waves.has(t)) {
      const w = t === 'wave' ? softWave(ac) : t === 'marimba' ? marimbaWave(ac) : pulseWave(ac, t === 'pulse50' ? 0.5 : t === 'pulse25' ? 0.25 : 0.125);
      this.waves.set(t, w);
    }
    return this.waves.get(t)!;
  }

  private noiseBuffer() {
    const ac = this.ac!;
    if (!this.noise) {
      this.noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return this.noise;
  }

  private tone(voice: Voice, timbre: Timbre, pitch: number, t: number, dur: number) {
    const ac = this.ac!;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.setPeriodicWave(this.wave(timbre));
    o.frequency.setValueAtTime(hz(pitch), t);
    const level = LEVEL[voice] * (timbre === 'marimba' ? 1.8 : 1);
    g.gain.setValueAtTime(level, t);
    if (timbre === 'marimba') {
      g.gain.exponentialRampToValueAtTime(0.001, t + Math.min(0.45, dur + 0.3));
    } else {
      g.gain.setTargetAtTime(level * 0.7, t + 0.02, 0.08);
      g.gain.setTargetAtTime(0, t + dur * 0.92, 0.015);
      // A little vibrato on long melody notes, like Gold/Silver.
      if (voice === 'melody' && dur > 0.35) {
        const lfo = ac.createOscillator();
        const depth = ac.createGain();
        lfo.frequency.value = 5.5;
        depth.gain.setValueAtTime(0, t);
        depth.gain.linearRampToValueAtTime(hz(pitch) * 0.008, t + 0.25);
        lfo.connect(depth).connect(o.frequency);
        lfo.start(t);
        lfo.stop(t + dur + 0.1);
      }
    }
    o.connect(g).connect(this.gains[voice]);
    o.start(t);
    o.stop(t + dur + 0.5);
  }

  private drum(kind: 'k' | 's' | 'h', t: number) {
    const ac = this.ac!;
    const g = ac.createGain();
    g.connect(this.gains.drums);
    if (kind === 'k') {
      // A kick: a short low thump falling in pitch.
      const o = ac.createOscillator();
      o.frequency.setValueAtTime(140, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.1);
      g.gain.setValueAtTime(LEVEL.drums * 2.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      o.connect(g);
      o.start(t);
      o.stop(t + 0.14);
      return;
    }
    const src = ac.createBufferSource();
    src.buffer = this.noiseBuffer();
    const filter = ac.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = kind === 's' ? 1200 : 6000;
    const len = kind === 's' ? 0.12 : 0.035;
    g.gain.setValueAtTime(LEVEL.drums * (kind === 's' ? 1.3 : 0.7), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    src.connect(filter).connect(g);
    src.start(t, Math.random() * 0.5);
    src.stop(t + len + 0.02);
  }

  /**
   * Play a song from the start: its intro once, then the loop until stop() or another play(). A jingle (`once`)
   * plays once and then calls `onEnd`.
   */
  play(song: Song, onEnd?: () => void) {
    this.stop();
    const ac = this.context();
    const { voices, intro, steps } = arrange(song);
    this.master = ac.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(ac.destination);
    for (const v of ['melody', 'harmony', 'bass', 'drums'] as Voice[]) {
      this.gains[v] = ac.createGain();
      this.gains[v].gain.value = this.muted.has(v) ? 0 : 1;
      this.gains[v].connect(this.master);
    }
    const step = 60 / song.bpm / song.stepsPerBeat;
    const timbre: Record<Voice, Timbre> = { melody: song.melodyTimbre, harmony: song.harmonyTimbre, bass: 'wave', drums: 'wave' };
    // Every note in time order, then scheduled a little ahead of the clock, loop after loop.
    const notes = (Object.entries(voices) as [Voice, Note[]][]).flatMap(([voice, ns]) => ns.map((n) => ({ ...n, voice }))).sort((a, b) => a.step - b.step);
    let start = ac.currentTime + 0.1;
    let i = 0;
    const loopFrom = notes.findIndex((n) => n.step >= intro);
    const end = start + steps * step;
    const schedule = () => {
      if (i === notes.length) {
        // A jingle: done once the last note has sounded.
        if (ac.currentTime > end) {
          this.stop();
          onEnd?.();
        }
        return;
      }
      while (i < notes.length && ac.currentTime + AHEAD > start + notes[i].step * step) {
        const n = notes[i];
        const t = start + n.step * step;
        if (typeof n.pitch === 'number') this.tone(n.voice, timbre[n.voice], n.pitch, t, n.len * step);
        else this.drum(n.pitch, t);
        if (++i === notes.length && !song.once) {
          // Loop: back to the first note after the intro, one loop later.
          i = loopFrom;
          start += (steps - intro) * step;
        }
      }
    };
    schedule();
    this.timer = window.setInterval(schedule, TICK);
    this.playing = song.id;
  }

  stop() {
    clearInterval(this.timer);
    this.master?.disconnect();
    this.master = null;
    this.playing = null;
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.master) this.master.gain.value = v;
  }

  setMuted(voice: Voice, muted: boolean) {
    if (muted) this.muted.add(voice);
    else this.muted.delete(voice);
    if (this.gains[voice]) this.gains[voice].gain.value = muted ? 0 : 1;
  }
}
