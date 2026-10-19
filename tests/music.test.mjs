// Music (silent: the test browser is muted): each place plays its song (a building plays the song of the town
// you came from), battles play theirs, the music drops to a whisper during a word challenge and goes silent for
// listening, and the Música setting turns it off.
import { start, sleep } from './lib.mjs';

const t = await start('music');
const music = () => t.game(() => window.__game.bgm.musicState());

await t.fromSave({ map: 'limon', x: 11, y: 8, dir: 'down', party: [['mordiscon', 30]] });
await sleep(300);
t.check('Villa Limón plays its own song', (await music()).playing === 'limon', await music());
await t.warp('centro_limon', 4, 6, 'up');
await sleep(200);
t.check('a Palacentro plays the Palacentro song', (await music()).playing === 'centro');
await t.warp('casa_lupe', 4, 5, 'up');
await sleep(200);
t.check('a house plays the song of its town', (await music()).playing === 'limon');

// A wild battle: its song, then a whisper while answering.
await t.warp('ruta1', 9, 10, 'up');
await t.wild('gusanito', 3);
await t.play({ until: (u) => !!u.challenge && !u.challenge.result });
const inChallenge = await music();
t.check('a wild battle plays the battle song', inChallenge.playing === 'salvaje', inChallenge);
t.check('the music is a whisper during a word challenge', inChallenge.duck <= 0.12, inChallenge.duck);
await t.play();
// Spoken lines hold it down until they end (in tests, speech is stubbed: until its fallback timer).
const back = await t.page.waitForFunction(() => window.__game.bgm.musicState().duck === 1, { timeout: 8000 }).then(() => true, () => false);
t.check('after the battle the music comes back up', back, await music());

// A listening challenge (the haunted lamp whispers): silence.
await t.fromSave({ map: 'cuarto_embrujado', x: 3, y: 2, dir: 'up', party: [['mordiscon', 30]] });
await t.press('z');
await t.play({ until: (u) => u.challenge?.mode === 'listen' && !u.challenge.result });
t.check('the music is silent while you listen', (await music()).duck === 0, await music());
await t.play();

// The Música setting.
await t.game(() => {
  window.__game.G.save.settings.music = false;
  window.__game.bgm.musicSettingChanged();
});
t.check('with Música off, nothing plays', (await music()).playing === null);
await t.end();
