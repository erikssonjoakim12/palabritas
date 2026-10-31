import { sfx } from '../engine/sfx';
import { frames } from '../engine/loop';
import type { Dir } from '../engine/input';
import { G, flag, setFlag, newSave, type SaveData } from '../game/state';
import { pickRandom } from '../game/random';
import { newMon } from '../game/mon';
import { TILES } from '../art/tiles';
import { FOG } from '../style/colors';
import { info } from '../ui/textbox';
import {
  currentMap, loadMap, placeNpc, refreshNpcs, walkNpc, walkNpcTo, approachPlayer, scriptedStep, fadeOut, fadeIn, setFollower,
  fogView, player, DX, DY, OPP, type ScriptFn, type ScriptCtx, type NpcRT,
} from './world';
import { MAPS, type Line } from './maps';
import { inFog } from './maps/region6';
import { lines, as, fight, droppedMoney } from './flows';

/*
  Region 6 (planned: plans/cadejos.md). So far only the fog outside the gym 6 city, played as a demo
  (?demo=niebla, title.ts). Doña Rosa's grandson is lost in the fog. The black dog (Cadenegro) leads you deeper,
  patch by patch, along the one real road through it; stray from it and the fog shuffles you somewhere else. At the
  end of its road it leaves you, lost; you find Tomás on your own, follow where the fog grows lighter, and the white
  dog (Cadeblanco) leads you both out. Once he's home the fog lifts and the patches settle into that road.
*/

/** The people of the fog. */
const ABUELA = 'Doña Rosa';
const NINO = 'Tomás';

// ---------- The fog walk ----------

/** Outside the fog: the trail to the city, where the walk starts and ends. */
const OUT = 'niebla_borde';
/** The patches the fog shuffles you through when you stray (maps/region6.ts). */
const PATCHES = ['niebla1', 'niebla2', 'niebla3', 'niebla4', 'niebla5', 'niebla6'];
const CLEARING = 'niebla_claro';
/**
 * The real road through the fog, patch by patch: where the black dog leads you (the user: its way is fixed, only
 * straying is random), and what the patches settle into once the fog lifts. Two lost trainers stand on it.
 */
const ROAD: { patch: string; exit: Dir; lost?: string }[] = [
  { patch: 'niebla1', exit: 'up' },
  { patch: 'niebla3', exit: 'right' },
  { patch: 'niebla2', exit: 'up', lost: 'excursionista_rodrigo' },
  { patch: 'niebla4', exit: 'left' },
  { patch: 'niebla6', exit: 'left' },
  { patch: 'niebla5', exit: 'up', lost: 'espeleologo_ismael' },
  { patch: 'niebla1', exit: 'left' },
  { patch: 'niebla2', exit: 'up' }, // the black dog leaves you here
];
/** The side you come into a patch of the road from. */
const roadEntry = (step: number): Dir => (step ? OPP[ROAD[step - 1].exit] : 'down');

/**
 * Patches you wander alone before the clearing, how much lighter the fog must get before the white dog comes, and how
 * many patches it leads you through to the way out.
 */
const BLIND = 3;
const LIGHT = 4;
const WHITE = 3;

type Phase = 'dog' | 'blind' | 'light' | 'white';
const walk = {
  phase: 'dog' as Phase,
  /** Where you are on the ROAD, and whether you're on it at all (straying takes you off it; the dog finds you). */
  step: 0,
  onRoad: true,
  /** Patches walked since the dog left you (blind) or since the white dog came (white), and how many lead on. */
  count: 0,
  blindTo: BLIND,
  /** How much lighter the fog has got (light): the right way adds one, any other way takes one away. */
  clarity: 0,
  /** The way the dog leads, or the fog thins, in this patch. */
  exit: 'up' as Dir,
  /** The white dog has come up to you. */
  met: false,
};

const lifted = () => flag('tomasEnCasa');

const SIDES: Dir[] = ['up', 'down', 'left', 'right'];
/** The open tiles along one edge of a patch. */
function opening(id: string, side: Dir): [number, number][] {
  const m = MAPS[id];
  const [w, h] = [m.rows[0].length, m.rows.length];
  const edge: [number, number][] =
    side === 'up' || side === 'down'
      ? Array.from({ length: w }, (_, x) => [x, side === 'up' ? 0 : h - 1])
      : Array.from({ length: h }, (_, y) => [side === 'left' ? 0 : w - 1, y]);
  return edge.filter(([x, y]) => !TILES[m.rows[y][x]].solid);
}
const opens = (id: string, side: Dir) => opening(id, side).length > 0;
/** The middle of a patch's opening on one side: where you come in, and where the dogs leave. */
const gap = (id: string, side: Dir) => {
  const o = opening(id, side);
  return o[o.length >> 1];
};

/** Where walking off this patch's edge (way `d`) takes you, as the walk moves on; null: nowhere (a bump). */
function leave(d: Dir): string | null {
  const here = currentMap().id;
  const elsewhere = () => pickRandom(PATCHES.filter((id) => id !== here && opens(id, OPP[d])));
  if (lifted()) {
    if (d === ROAD[walk.step].exit) return walk.step + 1 < ROAD.length ? ROAD[++walk.step].patch : null;
    if (d === roadEntry(walk.step)) return walk.step ? ROAD[--walk.step].patch : OUT;
    return null;
  }
  switch (walk.phase) {
    case 'dog':
      if (d !== walk.exit) {
        walk.onRoad = false;
        return elsewhere();
      }
      // Following the dog: on along the road, or back onto it where it found you.
      if (walk.onRoad && walk.step === ROAD.length - 1) {
        lost();
        return elsewhere();
      }
      if (walk.onRoad) walk.step++;
      walk.onRoad = true;
      return ROAD[walk.step].patch;
    case 'blind':
      return ++walk.count >= walk.blindTo ? CLEARING : elsewhere();
    case 'light':
      walk.clarity = d === walk.exit ? walk.clarity + 1 : Math.max(0, walk.clarity - 1);
      if (walk.clarity >= LIGHT) Object.assign(walk, { phase: 'white', count: 0, met: false });
      return elsewhere();
    case 'white':
      if (d === walk.exit && walk.met && ++walk.count >= WHITE) return OUT;
      return elsewhere();
  }
}

/** Into the next patch: the fog closes in (a gray fade) and opens on somewhere new, a step in from its edge. */
async function enterPatch(to: string, d: Dir) {
  // You come in on the side you were heading from; when that side is closed, where the road does (back onto it), or
  // from the fog at the top of the trail (out of it, whichever way the white dog went).
  let side = OPP[d];
  if (!opens(to, side)) side = to === OUT ? 'up' : roadEntry(walk.step);
  const [x, y] = gap(to, side);
  await fadeOut(10, FOG.fade);
  loadMap(to, x, y, OPP[side]);
  arrange(side);
  await fadeIn(10, FOG.fade);
  await scriptedStep(OPP[side]);
}

/** Who is in the patch you just walked into, and how far you see there. */
function arrange(entry: Dir) {
  inFog.clear();
  const id = currentMap().id;
  const sides = SIDES.filter((s) => s !== entry && opens(id, s));
  if (id !== OUT && !lifted()) {
    if (walk.phase === 'dog') {
      walk.exit = walk.onRoad ? ROAD[walk.step].exit : pickRandom(sides);
      waitAtExit('cadenegro');
      const someone = walk.onRoad && ROAD[walk.step].lost;
      if (someone) inFog.add(someone);
    } else if (walk.phase !== 'blind') {
      walk.exit = pickRandom(sides);
      if (walk.phase === 'white') waitAtExit('cadeblanco');
    }
    if (id === CLEARING && !G.save.follower) inFog.add('tomas_niebla');
  }
  refreshNpcs();
  view();
}

/** A dog waits a little way in from the side it leaves by, facing you. */
function waitAtExit(id: string) {
  const [gx, gy] = gap(currentMap().id, walk.exit);
  const [x, y] = [gx - DX[walk.exit] * 2, gy - DY[walk.exit] * 2];
  inFog.add(id);
  placeNpc(id, x, y, player.x < x ? 'left' : 'right');
}

/** How far you see: a little while the black dog leads or you wander, more as the fog thins, far once the white dog leads. */
function view() {
  const thin = walk.phase === 'light' ? walk.clarity : 0;
  Object.assign(fogView, {
    radius: walk.phase === 'white' ? 64 + walk.count * 24 : 34 + thin * 8,
    lean: walk.phase === 'light' || walk.phase === 'white' ? walk.exit : null,
    leanBy: 12 + thin * 4,
  });
}

/** The black dog's road ends: it's gone, and you're on your own. */
function lost() {
  inFog.delete('cadenegro');
  Object.assign(walk, { phase: 'blind', count: 0, blindTo: BLIND });
  view();
}

/** Walking off a patch's edge (world.ts, a fog 'patch'). */
async function fogEdge(c: ScriptCtx) {
  const d = c.data!.dir as Dir;
  const to = leave(d);
  if (!to) return sfx('bump');
  await enterPatch(to, d);
  if (to === OUT && G.save.follower) {
    setFlag('nieblaSalida');
    refreshNpcs();
    await lines(['¡Salieron de la niebla!', 'You made it out of the fog!']);
    await as('tomas', ['¡Mira! El perro blanco nos está esperando.', 'Look! The white dog is waiting for us.']);
  }
}

/** The top of the trail: into the fog (once Doña Rosa has asked you), along the road once it has lifted. */
async function nieblaEntrar() {
  if (G.save.follower) {
    await as('tomas', ['¡No, no! Yo no vuelvo a la niebla. ¡Mi abuela está aquí!', 'No, no! I’m not going back into the fog. My grandma is right here!']);
    return scriptedStep('down');
  }
  if (!flag('nieblaBusqueda')) {
    await lines(['La niebla es tan espesa que no se ve nada. Mejor no entrar.', 'The fog is so thick you can’t see a thing. Better not go in.']);
    return scriptedStep('down');
  }
  Object.assign(walk, { phase: 'dog', step: 0, onRoad: true, count: 0, blindTo: BLIND, clarity: 0, met: false });
  await enterPatch(ROAD[0].patch, 'up');
  if (!flag('nieblaAdentro')) {
    setFlag('nieblaAdentro');
    await info('La niebla es tan espesa que casi no te ves los pies.', { en: 'The fog is so thick you can hardly see your own feet.' });
  }
}

/** Where the fog walk is (for tests): its phase, the way on, and (once lifted) the road's way on from here. */
export const fogWalkState = () => ({ ...walk, roadExit: lifted() && walk.step + 1 < ROAD.length ? ROAD[walk.step].exit : null });

// ---------- The dogs ----------

/** Cadenegro, when you come near: it trots off the way it wants you to go, until its road ends. */
async function cadenegro(c: ScriptCtx) {
  if (walk.phase !== 'dog') return;
  if (!flag('cadenegroVisto')) {
    setFlag('cadenegroVisto');
    await lines(
      ['Entre la niebla brillan dos ojos rojos...', 'Two red eyes glow in the fog...'],
      ['Es un perro negro, enorme. Arrastra una cadena por el suelo.', 'It’s a black dog, a huge one. It drags a chain along the ground.'],
      ['Te mira... y se va trotando. Parece que quiere que lo sigas.', 'It looks at you... and trots off. It seems to want you to follow it.'],
    );
  }
  if (walk.onRoad && walk.step === ROAD.length - 1) return leavesYou(c.npc!);
  sfx('shake'); // its chain
  await walkNpc('cadenegro', [walk.exit, walk.exit], { speed: 1.5 });
  inFog.delete('cadenegro');
}

/** The end of the black dog's road: it turns, its eyes glow, and it's gone. */
async function leavesYou(n: NpcRT) {
  n.dir = player.x < n.x ? 'left' : 'right';
  await frames(30);
  await lines(['El perro negro se da vuelta. Sus ojos rojos brillan...', 'The black dog turns around. Its red eyes glow...']);
  lost();
  refreshNpcs();
  sfx('miss');
  await lines(
    ['...y desaparece en la niebla.', '...and it vanishes into the fog.'],
    [`Ya no sabes por dónde viniste. ¿Dónde estará ${NINO}?`, `You no longer know which way you came. Where can ${NINO} be?`],
  );
}

/** Cadeblanco in the fog: the first time it comes up to you, then it leads you out, patch by patch. */
async function cadeblanco() {
  if (walk.phase !== 'white') return;
  if (!walk.met) {
    walk.met = true;
    await approachPlayer('cadeblanco');
    await lines(
      ['De la niebla sale un perro blanco. Brilla un poco, como la luna.', 'A white dog comes out of the fog. It glows a little, like the moon.'],
      ['Por eso la niebla estaba más clara...', 'That’s why the fog was getting lighter...'],
    );
    await as('tomas', ['¿Otro perro? Este no me da miedo.', 'Another dog? This one doesn’t scare me.']);
    await lines(['El perro blanco camina despacio. Quiere que lo sigan.', 'The white dog walks slowly. It wants you to follow it.']);
  }
  const [x, y] = gap(currentMap().id, walk.exit);
  await walkNpcTo('cadeblanco', x, y);
  inFog.delete('cadeblanco');
}

/** Cadeblanco waiting outside the fog: pet it, and it goes back in. */
async function cadeblancoBorde() {
  await lines(['Acaricias al perro blanco. Mueve la cola, contento.', 'You pet the white dog. It wags its tail, happy.']);
  setFlag('cadeblancoAcariciado');
  await lines(['Luego se da vuelta... y vuelve a la niebla.', 'Then it turns around... and goes back into the fog.']);
  await walkNpcTo('cadeblanco_borde', 5, 0);
}

// ---------- Tomás and his grandmother ----------

/** Tomás in the clearing: he comes with you, and the fog starts to thin one way. */
async function tomasNiebla(c: ScriptCtx) {
  await lines(
    ['¡Ah! ¿Quién eres? ... ¿Te mandó mi abuela?', 'Ah! Who are you? ... Did my grandma send you?'],
    ['Seguí a un perro negro y me perdí. ¡Tenía mucho miedo!', 'I followed a black dog and got lost. I was so scared!'],
    ['¿Me llevas con mi abuela? ¡Voy contigo!', 'Will you take me to my grandma? I’m coming with you!'],
  );
  setFlag('tomasHallado');
  inFog.delete('tomas_niebla');
  setFollower({ look: 'tomas', script: 'tomasSigue' }, [c.npc!.x, c.npc!.y]);
  refreshNpcs();
  await info(`${NINO} te sigue.`, { en: `${NINO} follows you.` });
  Object.assign(walk, { phase: 'light', clarity: 0, exit: pickRandom(SIDES) });
  view();
  await info('Mira... por un lado, la niebla parece un poco más clara.', { en: 'Look... on one side, the fog seems a little lighter.' });
}

/**
 * Fainting in the fog once Tomás is with you: you wake up in his clearing, healed, with him beside you (the user:
 * more natural than the Palacentro), and the fog thins one way again. Before you find him, you wake up as usual.
 */
async function despertarNiebla(c: ScriptCtx) {
  if (!G.save.follower) return false;
  await info('Todo se pone negro...', { en: 'Everything goes black...' });
  const lost = c.data?.lost as number;
  if (lost) await droppedMoney(lost);
  await fadeOut(24, FOG.fade);
  loadMap(CLEARING, 5, 5, 'down');
  setFollower(G.save.follower, [6, 5]);
  Object.assign(walk, { phase: 'light', clarity: 0 });
  arrange('up');
  await fadeIn(24, FOG.fade);
  await info(`Despiertas en el claro. ${NINO} está a tu lado.`, { en: `You wake up in the clearing. ${NINO} is beside you.` });
  await as('tomas', ['¡Despertaste! No te dejé sol{o/a} ni un momento.', 'You’re awake! I didn’t leave you alone for a moment.']);
  await info('Descansaste un rato: tus Palabritas se recuperaron.', { en: 'You rested a while: your Palabritas recovered.' });
  return true;
}

/** Tomás, following you (or home again). */
async function tomasSigue() {
  const line: Line = lifted()
    ? ['Ya no voy a seguir perros negros. ¡Te lo prometo!', 'I won’t follow black dogs anymore. I promise!']
    : currentMap().id === OUT
      ? ['¡Ahí está mi abuela!', 'There’s my grandma!']
      : walk.phase === 'white'
        ? ['Ese perro blanco brilla como la luna. ¡Sigámoslo!', 'That white dog glows like the moon. Let’s follow it!']
        : walk.clarity > 0
          ? ['¡Por aquí la niebla está más clara! Sigue así.', 'The fog is lighter this way! Keep going.']
          : ['Tengo frío... ¿Por dónde está más clara la niebla?', 'I’m cold... Which way is the fog lighter?'];
  await as('tomas', line);
}

/** Doña Rosa asks you to find her grandson: how to know him, and part of her grandmother's warning. */
const SEARCH: Line[] = [
  [`¡Ay, por favor, ayúdame! Soy ${ABUELA}. Mi nieto ${NINO} fue a buscar hongos esta mañana... y todavía no ha vuelto.`, `Oh, please, help me! I’m ${ABUELA}. My grandson ${NINO} went to look for mushrooms this morning... and he still hasn’t come back.`],
  ['Se metió en la niebla. Yo ya no puedo caminar tan lejos.', 'He went into the fog. I can’t walk that far anymore.'],
  ['Es fácil reconocerlo: tiene diez años y lleva gorra y camisa anaranjadas.', 'He’s easy to recognize: he’s ten, and he wears an orange cap and an orange shirt.'],
  ['Ah, y una cosa más. Mi abuela siempre decía: si en la niebla ves un perro negro... ¡no lo sigas!', 'Oh, and one more thing. My grandmother always said: if you see a black dog in the fog... don’t follow it!'],
  ['Decía algo más, pero ya no me acuerdo...', 'She said something else, but I don’t remember anymore...'],
];

async function abuelaNiebla() {
  if (lifted()) {
    return lines(
      [`Gracias otra vez, {name}. ${NINO} ya está en casa.`, `Thank you again, {name}. ${NINO} is home now.`],
      ['Un perro negro y un perro blanco... Mi abuela contaba algo de los dos. ¿Qué era?', 'A black dog and a white dog... My grandmother told something about the two of them. What was it?'],
    );
  }
  if (G.save.follower) return reunion();
  if (flag('nieblaBusqueda')) return lines([`Por favor, encuentra a ${NINO}. Lleva gorra y camisa anaranjadas.`, `Please find ${NINO}. He wears an orange cap and shirt.`]);
  setFlag('nieblaBusqueda');
  return lines(...SEARCH);
}

/** Tomás is home: his grandmother remembers a little more, and the fog lifts. */
async function reunion() {
  await as('tomas', ['¡Abuela! ¡Abuela!', 'Grandma! Grandma!']);
  setFollower(null);
  setFlag('tomasEnCasa');
  refreshNpcs();
  await lines([`¡${NINO}! ¡Mi niño! ¿Dónde estabas?`, `${NINO}! My boy! Where were you?`]);
  await as('tomas', ['Seguí a un perro negro y me perdí. ¡Pero {name} me encontró, y un perro blanco nos sacó de la niebla!', 'I followed a black dog and got lost. But {name} found me, and a white dog led us out of the fog!']);
  await lines(
    ['¿Un perro blanco? Mi abuela también hablaba de un perro blanco... pero no me acuerdo qué decía.', 'A white dog? My grandmother talked about a white dog too... but I don’t remember what she said.'],
    ['Gracias, {name}. Nunca voy a olvidar lo que hiciste.', 'Thank you, {name}. I’ll never forget what you did.'],
  );
  await info('Mira: ¡la niebla se está levantando!', { en: 'Look: the fog is lifting!' });
  if (G.demo) {
    await info('¡Fin de la demo! Gracias por jugar.', { en: 'The end of the demo! Thanks for playing.' });
    await info('Ahora el camino en la niebla es siempre el mismo: el que siguió el perro negro. Puedes caminarlo si quieres.', { en: 'Now the road through the fog is always the same: the one the black dog took. You can walk it if you like.' });
    await info('Para jugar otra vez, vuelve a abrir la página.', { en: 'To play again, reload the page.' });
  }
}

// ---------- The demo (?demo=niebla) ----------

/**
 * The fog demo (title.ts): your name, look and settings (when there's a game on this device), a team around level 34,
 * at the edge of the fog. Nothing is saved (G.demo), so the real game stays as it was.
 */
export function startFogDemo(real: SaveData | null) {
  G.demo = true;
  G.save = Object.assign(newSave(), {
    name: real?.name ?? 'Tú',
    gender: real?.gender ?? 'boy',
    settings: real?.settings ?? newSave().settings,
    map: OUT,
    x: 5,
    y: 9,
    dir: 'up' as Dir,
    party: ([['nubarron', 35], ['hamburgueson', 34], ['murcielon', 33], ['torovenado', 33]] as const).map(([sp, level]) => newMon(sp, level)),
    bag: { pocion: 5, superpocion: 2, palabola: 10 },
    heal: { map: OUT, x: 5, y: 9 },
  });
  Object.assign(G.save.flags, { starter: true, metCeiba: true, defenseTip: true });
}

/** The demo begins: what it is, then Doña Rosa asks for your help. */
async function nieblaDemo() {
  await info('DEMO: la niebla. Nada de lo que pasa aquí se guarda: tu partida está segura.', { en: 'DEMO: the fog. Nothing that happens here is saved: your real game is safe.' });
  await info('Tu equipo está entre los niveles 33 y 35, y tienes Pociones y Palabolas.', { en: 'Your team is between levels 33 and 35, and you have Potions and Palabolas.' });
  setFlag('nieblaBusqueda');
  await as('granny', ...SEARCH);
}

// ---------- Everyone's scripts, and the lost trainers ----------

export const REGION6: Record<string, ScriptFn> = {
  __fogEdge: fogEdge,
  nieblaEntrar,
  nieblaDemo,
  cadenegro,
  cadeblanco,
  cadeblancoBorde,
  tomasNiebla,
  tomasSigue,
  despertarNiebla,
  abuela_niebla: abuelaNiebla,
  excursionista_rodrigo: fight(
    'excursionista_rodrigo',
    ['¡Por fin alguien! Llevo horas caminando en círculos... ¡Peleemos, así no tengo miedo!', 'Finally, someone! I’ve been walking in circles for hours... Let’s battle, so I’m not scared!'],
    ['Ganaste... y yo sigo perdido.', 'You won... and I’m still lost.'],
    ['¿Viste un perro negro? Lo seguí y ahora no sé dónde estoy.', 'Did you see a black dog? I followed it and now I don’t know where I am.'],
  ),
  espeleologo_ismael: fight(
    'espeleologo_ismael',
    [`¿${NINO}? No, me llamo Ismael. ¡Y esto es un casco, no una gorra! Pero ya que estás aquí... ¡peleemos!`, `${NINO}? No, my name is Ismael. And this is a helmet, not a cap! But since you’re here... let’s battle!`],
    ['Las cuevas son oscuras, pero esta niebla es peor.', 'Caves are dark, but this fog is worse.'],
    ['Busca a alguien con gorra, no con casco. ¡Suerte!', 'Look for someone with a cap, not a helmet. Good luck!'],
  ),
};
