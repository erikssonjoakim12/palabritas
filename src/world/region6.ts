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
  currentMap, loadMap, placeNpc, refreshNpcs, walkNpcTo, approachPlayer, scriptedStep, fadeOut, fadeIn, setFollower, npcById,
  fogView, player, DX, DY, OPP, type ScriptFn, type ScriptCtx, type NpcRT,
} from './world';
import { MAPS, type Line } from './maps';
import { inFog, PATCH, CELLS, ROAD, BACK, CLEARING, ENTRY, wayTo, type Cell } from './maps/region6';
import { lines, as, fight, droppedMoney } from './flows';

/*
  Region 6 (planned: plans/cadejos.md). So far only the fog outside the gym 6 city, played as a demo
  (?demo=niebla, title.ts). Doña Rosa's grandson is lost on the Cerro de la Niebla (maps/region6.ts). The black dog
  (Cadenegro) leads you up its road, patch by patch, waiting twice in each; stray from it and the fog shuffles you
  about until it finds you again, 2–3 patches later. At the end of its road it leaves you, lost; you find Tomás on
  your own, follow where the fog grows lighter (the way back, fixed from the start), and the white dog (Cadeblanco)
  leads you both out. Once he's home the fog lifts and the mountain is an open route.
*/

/** The people of the fog. */
const ABUELA = 'Doña Rosa';
const NINO = 'Tomás';

// ---------- The fog walk ----------

const MOUNTAIN = 'cerro_niebla';
/** Outside the fog: the trail to the city, where the walk starts and ends. */
const OUT = 'niebla_borde';
/**
 * Patches you wander alone before the clearing, and the patch of the way back where the white dog comes (the fog
 * has thinned enough by then).
 */
const BLIND = 4;
const WHITE_AT = 4;

type Phase = 'dog' | 'blind' | 'light' | 'white';
const walk = {
  phase: 'dog' as Phase,
  /** Where you are on the ROAD (the black dog's) or the way BACK, and whether you're on it at all. */
  step: 0,
  onWay: true,
  /** Off the black dog's road: patches until it finds you again (the user: 2–3). */
  lostFor: 0,
  /** Patches walked alone since the black dog left you. */
  count: 0,
  /** The way the dog leads, or the fog thins, in this patch. */
  exit: 'up' as Dir,
  /** Where the dog waits in this patch: halfway, then by the way out; and which of them it's at. */
  spots: [] as [number, number][],
  at: 0,
  /** The white dog has come up to you. */
  met: false,
};

const lifted = () => flag('tomasEnCasa');
const same = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1];
const cellOf = (x: number, y: number): Cell => [Math.floor(x / PATCH.w), Math.floor(y / PATCH.h)];
const here = () => cellOf(player.x, player.y);
const open = (x: number, y: number) => {
  const rows = MAPS[MOUNTAIN].rows;
  return y >= 0 && y < rows.length && x >= 0 && x < rows[0].length && !TILES[rows[y][x]].solid;
};

const SIDES: Dir[] = ['up', 'down', 'left', 'right'];
/** The open tiles along one edge of a patch: its way through on that side, if it has one. */
function opening([c, r]: Cell, side: Dir): [number, number][] {
  const [x0, y0, w, h] = [c * PATCH.w, r * PATCH.h, PATCH.w, PATCH.h];
  const edge: [number, number][] =
    side === 'up' || side === 'down'
      ? Array.from({ length: w }, (_, i) => [x0 + i, side === 'up' ? y0 : y0 + h - 1])
      : Array.from({ length: h }, (_, i) => [side === 'left' ? x0 : x0 + w - 1, y0 + i]);
  return edge.filter(([x, y]) => open(x, y));
}
const sidesOf = (cell: Cell) => SIDES.filter((s) => opening(cell, s).length);
/** The middle of a patch's way through on one side: where you come in, and where the dogs leave. */
const gap = (cell: Cell, side: Dir) => {
  const o = opening(cell, side);
  return o[o.length >> 1];
};
/** Where walking out of this patch (way `d`) takes you, as the walk moves on: a patch, out of the fog, or nowhere. */
function leave(d: Dir): Cell | 'out' | null {
  const cell = here();
  // Lost: any other patch you could come into from that side (never the clearing before it's time).
  const astray = () => pickRandom(CELLS.filter((c) => !same(c, cell) && !same(c, CLEARING) && opening(c, OPP[d]).length));
  if (lifted()) return d === 'down' && same(cell, ENTRY) ? 'out' : null; // only the mountain's own edge comes here then
  switch (walk.phase) {
    case 'dog': {
      // The first patch is still the edge of the fog: back the way you came is back out (the user).
      if (walk.onWay && walk.step === 0 && d === 'down') return 'out';
      const leads = walk.onWay || walk.lostFor === 0;
      if (!leads || d !== walk.exit) {
        walk.lostFor = leads ? 2 + Math.floor(Math.random() * 2) : walk.lostFor - 1;
        walk.onWay = false;
        return astray();
      }
      if (walk.onWay) {
        if (walk.step === ROAD.length - 1) {
          lost();
          return astray();
        }
        walk.step++;
      }
      walk.onWay = true; // back where it found you, or on along its road
      return ROAD[walk.step];
    }
    case 'blind':
      return ++walk.count >= BLIND ? CLEARING : astray();
    default: {
      // The way back: the lighter fog leads along it, and from wherever you strayed back onto it.
      if (d !== walk.exit) {
        walk.onWay = false;
        return astray();
      }
      if (!walk.onWay) {
        walk.onWay = true;
        return BACK[walk.step];
      }
      if (walk.step === BACK.length - 1) return 'out';
      walk.step++;
      if (walk.step >= WHITE_AT && walk.phase === 'light') Object.assign(walk, { phase: 'white', met: false });
      return BACK[walk.step];
    }
  }
}

/** Into the next patch: the fog closes in (a gray fade) and opens a step inside somewhere else. */
async function enter(cell: Cell, d: Dir) {
  const sides = sidesOf(cell);
  const side = sides.includes(OPP[d]) ? OPP[d] : sides[0];
  const [x, y] = gap(cell, side);
  await fadeOut(10, FOG.fade);
  loadMap(MOUNTAIN, x, y, OPP[side]);
  arrange(side);
  await fadeIn(10, FOG.fade);
  await scriptedStep(OPP[side]);
}

/** Who is in the patch you just walked into, and how far you see there. */
function arrange(entry: Dir) {
  inFog.clear();
  if (!lifted()) {
    const others = sidesOf(here()).filter((s) => s !== entry);
    const anyWay = () => (others.length ? pickRandom(others) : entry);
    if (walk.phase === 'dog') {
      walk.exit = walk.onWay ? (walk.step < ROAD.length - 1 ? wayTo(ROAD[walk.step], ROAD[walk.step + 1]) : 'up') : anyWay();
      if (walk.onWay || walk.lostFor === 0) waits('cadenegro', entry);
    } else if (walk.phase !== 'blind') {
      walk.exit = walk.onWay ? (walk.step < BACK.length - 1 ? wayTo(BACK[walk.step], BACK[walk.step + 1]) : 'down') : anyWay();
      if (walk.phase === 'white') waits('cadeblanco', entry);
    }
  }
  refreshNpcs();
  view();
}

/** The shortest way between two spots inside this patch (tiles only: where a dog waits halfway). */
function wayInside(from: [number, number], to: [number, number]): [number, number][] {
  const cell = here();
  const prev = new Map<string, [number, number] | null>([[from + '', null]]);
  const queue = [from];
  while (queue.length) {
    const [x, y] = queue.shift()!;
    if (x === to[0] && y === to[1]) break;
    for (const d of SIDES) {
      const n: [number, number] = [x + DX[d], y + DY[d]];
      if (prev.has(n + '') || !open(...n) || !same(cellOf(...n), cell)) continue;
      prev.set(n + '', [x, y]);
      queue.push(n);
    }
  }
  const path: [number, number][] = [];
  for (let p: [number, number] | null | undefined = to; p; p = prev.get(p + '')) path.unshift(p);
  return path;
}

/** Which way someone at (x, y) faces to look at you. */
const towardYou = (x: number, y: number): Dir =>
  Math.abs(player.x - x) >= Math.abs(player.y - y) ? (player.x < x ? 'left' : 'right') : player.y < y ? 'up' : 'down';

/** A dog waits for you: halfway across the patch, then a little way in from the side it leaves by. */
function waits(id: string, entry: Dir) {
  const cell = here();
  const [ex, ey] = gap(cell, walk.exit);
  const out: [number, number] = [ex - DX[walk.exit] * 2, ey - DY[walk.exit] * 2];
  const way = wayInside(gap(cell, entry), out);
  walk.spots = [way.length > 10 ? way[way.length >> 1] : out, out];
  walk.at = walk.spots[0] === out ? 1 : 0;
  inFog.add(id);
  const [x, y] = walk.spots[walk.at];
  placeNpc(id, x, y, towardYou(x, y));
}

/** A dog you came near: it looks at you, then runs on to its next spot, or out of the patch the way it leads. */
async function runsOn(id: string, speed: number) {
  const n = npcById(id)!;
  n.dir = towardYou(n.x, n.y);
  await frames(12);
  if (walk.at === 0) {
    walk.at = 1;
    await walkNpcTo(id, ...walk.spots[1], { speed });
    n.dir = towardYou(n.x, n.y);
    return;
  }
  await walkNpcTo(id, ...gap(here(), walk.exit), { speed });
  inFog.delete(id);
  refreshNpcs();
}

/** How far you see: a little while the black dog leads or you wander, more as the way back clears, far with the white dog. */
function view() {
  const back = walk.phase === 'light' || walk.phase === 'white';
  Object.assign(fogView, {
    radius: walk.phase === 'white' ? 72 + (walk.step - WHITE_AT) * 20 : back && walk.onWay ? 38 + walk.step * 6 : 34,
    lean: back ? walk.exit : null,
    leanBy: back ? 12 + walk.step * 2 : 0,
  });
}

/** The black dog's road ends: it's gone, and you're on your own. */
function lost() {
  inFog.delete('cadenegro');
  Object.assign(walk, { phase: 'blind', count: 0 });
  view();
}

/** Walking out of a patch of the fog (world.ts), or off the mountain at the bottom of the trail. */
async function fogEdge(c: ScriptCtx) {
  const d = c.data!.dir as Dir;
  const to = leave(d);
  if (!to) return sfx('bump');
  if (to !== 'out') return enter(to, d);
  await fadeOut(10, FOG.fade);
  loadMap(OUT, 6, 0, 'down');
  inFog.clear();
  await fadeIn(10, FOG.fade);
  await scriptedStep('down');
  if (G.save.follower) {
    setFlag('nieblaSalida');
    refreshNpcs();
    await lines(['¡Salieron de la niebla!', 'You made it out of the fog!']);
    await as('tomas', ['¡Mira! El perro blanco nos está esperando.', 'Look! The white dog is waiting for us.']);
  }
}

/** The top of the trail: into the fog (once Doña Rosa has asked you), or onto the open mountain once it has lifted. */
async function nieblaEntrar() {
  if (G.save.follower) {
    await as('tomas', ['¡No, no! Yo no vuelvo a la niebla. ¡Mi abuela está aquí!', 'No, no! I’m not going back into the fog. My grandma is right here!']);
    return scriptedStep('down');
  }
  if (!flag('nieblaBusqueda')) {
    await lines(['La niebla es tan espesa que no se ve nada. Mejor no entrar.', 'The fog is so thick you can’t see a thing. Better not go in.']);
    return scriptedStep('down');
  }
  Object.assign(walk, { phase: 'dog', step: 0, onWay: true, lostFor: 0, count: 0, met: false });
  await enter(ENTRY, 'up');
  if (!flag('nieblaAdentro')) {
    setFlag('nieblaAdentro');
    await info('La niebla es tan espesa que casi no te ves los pies.', { en: 'The fog is so thick you can hardly see your own feet.' });
  }
}

/** Where the fog walk is (for tests): its state, the patch you're in, and that patch's ways through. */
export const fogWalkState = () => ({ ...walk, cell: here(), gaps: Object.fromEntries(sidesOf(here()).map((s) => [s, gap(here(), s)])) });

/** Put the fog walk at a step of the black dog's road or the way back, in that patch (for tests). */
export function fogJump(phase: Phase, step: number) {
  const way = phase === 'dog' ? ROAD : BACK;
  const entry = step ? wayTo(way[step], way[step - 1]) : 'down';
  Object.assign(walk, { phase, step, onWay: true, lostFor: 0, count: 0, met: false });
  loadMap(MOUNTAIN, ...gap(way[step], entry), OPP[entry]);
  arrange(entry);
}

// ---------- The dogs ----------

/** Cadenegro, when you come near: it runs on, twice a patch, the way it wants you to go, until its road ends. */
async function cadenegro() {
  if (walk.phase !== 'dog') return;
  if (!flag('cadenegroVisto')) {
    setFlag('cadenegroVisto');
    await lines(
      ['Entre la niebla brillan dos ojos rojos...', 'Two red eyes glow in the fog...'],
      ['Es un perro negro, enorme. Arrastra una cadena por el suelo.', 'It’s a black dog, a huge one. It drags a chain along the ground.'],
      ['Te mira... y se va corriendo. Parece que quiere que lo sigas.', 'It looks at you... and runs off. It seems to want you to follow it.'],
    );
  }
  if (walk.onWay && walk.step === ROAD.length - 1) return leavesYou(npcById('cadenegro')!);
  sfx('shake'); // its chain
  await runsOn('cadenegro', 2);
}

/** The end of the black dog's road: it turns, its eyes glow, and it's gone. */
async function leavesYou(n: NpcRT) {
  n.dir = towardYou(n.x, n.y);
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

/** Cadeblanco in the fog: the first time it comes up to you, then it leads you out, patch by patch, unhurried. */
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
  await runsOn('cadeblanco', 1);
}

/** Cadeblanco waiting outside the fog: pet it, and it goes back in. */
async function cadeblancoBorde() {
  await lines(['Acaricias al perro blanco. Mueve la cola, contento.', 'You pet the white dog. It wags its tail, happy.']);
  setFlag('cadeblancoAcariciado');
  await lines(['Luego se da vuelta... y vuelve a la niebla.', 'Then it turns around... and goes back into the fog.']);
  await walkNpcTo('cadeblanco_borde', 5, 0);
}

// ---------- Tomás and his grandmother ----------

/** On the way back with Tomás: from his clearing, where the fog is a little lighter one way. */
function wayBack() {
  Object.assign(walk, { phase: 'light', step: 0, onWay: true });
  arrange('down');
}

/** Tomás in the clearing: he comes with you, and the fog starts to thin one way. */
async function tomasNiebla(c: ScriptCtx) {
  await lines(
    ['¡Ah! ¿Quién eres? ... ¿Te mandó mi abuela?', 'Ah! Who are you? ... Did my grandma send you?'],
    ['Seguí a un perro negro y me perdí. ¡Tenía mucho miedo!', 'I followed a black dog and got lost. I was so scared!'],
    ['¿Me llevas con mi abuela? ¡Voy contigo!', 'Will you take me to my grandma? I’m coming with you!'],
  );
  setFlag('tomasHallado');
  setFollower({ look: 'tomas', script: 'tomasSigue' }, [c.npc!.x, c.npc!.y]);
  wayBack();
  await info(`${NINO} te sigue.`, { en: `${NINO} follows you.` });
  await info('Mira... por un lado, la niebla parece un poco más clara.', { en: 'Look... on one side, the fog seems a little lighter.' });
}

/**
 * Fainting in the fog once Tomás is with you: you wake up in his clearing, healed, with him beside you (the user:
 * more natural than the Palacentro), and the way back starts over. Before you find him, you wake up as usual.
 */
async function despertarNiebla(c: ScriptCtx) {
  if (!G.save.follower) return false;
  await info('Todo se pone negro...', { en: 'Everything goes black...' });
  const dropped = c.data?.lost as number;
  if (dropped) await droppedMoney(dropped);
  await fadeOut(24, FOG.fade);
  const spot = { x: CLEARING[0] * PATCH.w + 5, y: CLEARING[1] * PATCH.h + 7 }; // where you found him
  loadMap(MOUNTAIN, spot.x, spot.y, 'down');
  setFollower(G.save.follower, [spot.x + 1, spot.y]);
  wayBack();
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
        : walk.onWay && walk.step > 0
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
    await info('Sin la niebla, el cerro es un camino abierto. Puedes subir al prado junto al claro, si quieres.', { en: 'Without the fog, the hill is an open route. You can climb to the meadow by the clearing, if you like.' });
    await info('Para jugar otra vez, vuelve a abrir la página.', { en: 'To play again, reload the page.' });
  }
}

/** An old man at the trail: the rare Palabrita in the meadow up by the clearing. */
const donLencho = (): Promise<void> =>
  lifted()
    ? lines(['¡Se fue la niebla! Sube al prado junto al claro, arriba del cerro. A lo mejor ves al Puercoespín.', 'The fog is gone! Climb to the meadow by the clearing, at the top of the hill. Maybe you’ll see the Puercoespín.'])
    : lines(
        ['Allá arriba, junto al claro, hay un prado donde vive un Puercoespín. Dicen que sus púas curan.', 'Up there, by the clearing, there’s a meadow where a Puercoespín lives. They say its spines heal.'],
        ['Pero con esta niebla, nadie sube.', 'But in this fog, nobody goes up.'],
      );

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
  don_lencho: donLencho,
  campista_lorena: fight(
    'campista_lorena',
    ['¡Qué susto! Pensé que eras un fantasma. Mi tienda está por aquí... creo. ¡Peleemos!', 'What a fright! I thought you were a ghost. My tent is around here... I think. Let’s battle!'],
    ['Perdí... y sigo sin encontrar mi tienda.', 'I lost... and I still can’t find my tent.'],
    ['Si ves una tienda verde, ¡avísame!', 'If you see a green tent, let me know!'],
  ),
  excursionista_rodrigo: fight(
    'excursionista_rodrigo',
    ['¡Por fin alguien! Llevo horas caminando en círculos... ¡Peleemos, así no tengo miedo!', 'Finally, someone! I’ve been walking in circles for hours... Let’s battle, so I’m not scared!'],
    ['Ganaste... y yo sigo perdido.', 'You won... and I’m still lost.'],
    ['¿Viste un perro negro? Lo seguí y ahora no sé dónde estoy.', 'Did you see a black dog? I followed it and now I don’t know where I am.'],
  ),
  lenador_abel: fight(
    'lenador_abel',
    ['He cortado leña en este cerro toda mi vida, ¡y nunca he visto una niebla así!', 'I’ve cut firewood on this hill all my life, and I’ve never seen fog like this!'],
    ['¡Qué fuerte eres! Más fuerte que un roble.', 'How strong you are! Stronger than an oak.'],
    ['Si oyes cadenas en la niebla, no mires atrás.', 'If you hear chains in the fog, don’t look back.'],
  ),
  espeleologo_ismael: fight(
    'espeleologo_ismael',
    [`¿${NINO}? No, me llamo Ismael. ¡Y esto es un casco, no una gorra! Pero ya que estás aquí... ¡peleemos!`, `${NINO}? No, my name is Ismael. And this is a helmet, not a cap! But since you’re here... let’s battle!`],
    ['Las cuevas son oscuras, pero esta niebla es peor.', 'Caves are dark, but this fog is worse.'],
    ['Busca a alguien con gorra, no con casco. ¡Suerte!', 'Look for someone with a cap, not a helmet. Good luck!'],
  ),
  observadora_marta: fight(
    'observadora_marta',
    ['Vine a ver un quetzal, pero con esta niebla no veo ni mis binoculares. ¡Peleemos!', 'I came to see a quetzal, but in this fog I can’t even see my binoculars. Let’s battle!'],
    ['Bueno, por lo menos vi a tus Palabritas.', 'Well, at least I saw your Palabritas.'],
    ['Dicen que los quetzales viven en estos cerros. ¡Algún día voy a ver uno!', 'They say quetzals live in these hills. Someday I’m going to see one!'],
  ),
  cafetalero_julio: fight(
    'cafetalero_julio',
    ['Salí a recoger café antes del amanecer... y ahora no encuentro el cafetal.', 'I went out to pick coffee before dawn... and now I can’t find the coffee farm.'],
    ['Ay, perdí la pelea y el camino.', 'Oh, I lost the battle and the way.'],
    ['Cuando se vaya la niebla, te invito a un café.', 'When the fog goes away, I’ll buy you a coffee.'],
  ),
  ciclista_kevin: fight(
    'ciclista_kevin',
    ['¡Frena, frena! Casi te atropello. ¡Con esta niebla no se ve nada!', 'Brake, brake! I almost ran you over. You can’t see a thing in this fog!'],
    ['Mejor camino con la bici a mi lado.', 'I’d better walk with my bike beside me.'],
    ['Ya no sé si estoy subiendo o bajando.', 'I don’t even know anymore if I’m going up or down.'],
  ),
  guardaparque_elena: fight(
    'guardaparque_elena',
    ['Soy guardaparque. Conozco este cerro... pero hoy la niebla me engaña.', 'I’m a park ranger. I know this hill... but today the fog is fooling me.'],
    ['Bien hecho. ¿Ves? Por allá la niebla está más clara.', 'Well done. See? Over there the fog is lighter.'],
    ['La niebla más clara siempre lleva hacia el pueblo.', 'The lighter fog always leads toward the village.'],
  ),
  musico_rafa: fight(
    'musico_rafa',
    ['Toco la guitarra para no tener miedo. ¿Bailamos... o peleamos?', 'I play the guitar so I’m not scared. Shall we dance... or battle?'],
    ['¡Qué ritmo tienes!', 'What rhythm you’ve got!'],
    ['La música me acompaña cuando estoy solo.', 'Music keeps me company when I’m alone.'],
  ),
  turista_paola: fight(
    'turista_paola',
    ['¡Ya casi llegamos al pueblo! ¿O no? ¡Una última pelea!', 'We’re almost at the village! Or not? One last battle!'],
    ['Ganaste. El pueblo está cerca, ¿verdad?', 'You won. The village is close, right?'],
    ['Cuando llegue a casa, me voy a tomar un chocolate caliente.', 'When I get home, I’m going to have a hot chocolate.'],
  ),
};
