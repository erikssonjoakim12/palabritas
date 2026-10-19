import { MusicPlayer } from './music';
import { SONGS, MAP_MUSIC, BATTLE_MUSIC, SILENCIO_TRAINERS } from '../data/music';
import { MAPS, type MapDef } from '../world/maps';
import type { TrainerDef } from '../data/trainers';
import { audioContext, sfx, type Sfx } from '../engine/sfx';
import { G } from '../game/state';

/*
  The game's music. Three layers, the top one plays: the map's song, a battle's song over it, and a jingle or
  overlay over both (victory, a wild win, caught, a medal, evolution). When a layer ends, the music falls back
  to the one below. The Música setting turns it all off.

  Spanish comes first: while a word challenge is open the music drops to a whisper, and it goes silent for
  listening and speaking (the microphone must not hear it). It also drops while the game speaks Spanish aloud.
*/

const BY_ID = new Map(SONGS.map((s) => [s.id, s]));
const player = new MusicPlayer(audioContext);

let mapSong: string | null = null;
let battleSong: string | null = null;
/** A jingle (plays once, then gone) or an overlay that loops until cleared (victory, evolution). */
let overlay: { id: string; once: boolean } | null = null;

const enabled = () => G.save?.settings?.music !== false;

/** Play whatever should play now (or nothing). */
function refresh() {
  const want = !enabled() ? null : (overlay?.id ?? battleSong ?? mapSong);
  if (want === player.playing) return;
  if (!want) return player.stop();
  const song = BY_ID.get(want);
  if (!song) return player.stop();
  player.play(song, () => {
    // A jingle ended: back to the layer below.
    if (overlay?.id === want) overlay = null;
    refresh();
  });
}

/** The map's song (null: silence, e.g. a muted town). Re-entering the same song doesn't restart it. */
export function setMapMusic(id: string | null) {
  mapSong = id;
  refresh();
}

/** A battle's song, over the map's (null when the battle is over). A loop overlay (victory) ends with it. */
export function setBattleMusic(id: string | null) {
  battleSong = id;
  if (!id && overlay && !overlay.once) overlay = null;
  refresh();
}

/** A jingle that plays once (or an overlay that loops until clearOverlay), then the music below resumes. */
export function playOverlay(id: string, once = BY_ID.get(id)?.once ?? true) {
  overlay = { id, once };
  refresh();
}
export function clearOverlay() {
  overlay = null;
  refresh();
}

/** A map's song: listed in MAP_MUSIC, else by kind (Palacentro, gym), else where you came in from. */
export function musicFor(map: MapDef, seen = new Set<string>()): string | null {
  if (map.muted?.()) return null;
  if (MAP_MUSIC[map.id]) return MAP_MUSIC[map.id];
  if (map.id.startsWith('centro')) return 'centro';
  if (map.id === 'gimnasio' || map.id.startsWith('gym_')) return 'gimnasio';
  const from = map.exit && MAPS[map.exit.to];
  if (from && !seen.has(from.id)) return musicFor(from, seen.add(map.id));
  return mapSong;
}

/** A battle's song: gym leaders, Equipo Silencio, other trainers, or a wild Palabrita. */
export function battleMusicFor(trainer?: TrainerDef) {
  if (!trainer) return BATTLE_MUSIC.wild;
  if (trainer.name.startsWith('Líder')) return BATTLE_MUSIC.leader;
  if (SILENCIO_TRAINERS.test(trainer.id)) return BATTLE_MUSIC.silencio;
  return BATTLE_MUSIC.trainer;
}

/** A fanfare when the music is on; the short sound effect when it's off. */
export function fanfare(id: string, fallback: Sfx) {
  if (enabled()) playOverlay(id, true);
  else sfx(fallback);
}

/** What is playing and how loud (for tests). */
export const musicState = () => ({ playing: player.playing, duck: Math.min(1, ...[...holds].map((h) => h.level)) });

/** The Música setting changed. */
export const musicSettingChanged = () => refresh();

// ---------- Making room for Spanish ----------

/** How loud the music may be while each kind of Spanish is happening. */
export const DUCK = { challenge: 0.12, speaking: 0.3, silent: 0 };
const holds = new Set<{ level: number }>();
function applyDuck() {
  player.setDuck(Math.min(1, ...[...holds].map((h) => h.level)));
}
/** Lower the music to `level` (0-1) until the returned function is called. */
export function duck(level: number): () => void {
  const h = { level };
  holds.add(h);
  applyDuck();
  return () => {
    holds.delete(h);
    applyDuck();
  };
}
