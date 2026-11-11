// The Swedish translation (plans/swedish.md): finds every line the game shows with English, by reading the source,
// and compares it with the Swedish in src/data/sv/.
//
//   node tools/sv.mjs                 coverage per source file, Swedish left behind, lines built while playing
//   node tools/sv.mjs todo <file>     the lines of one source file still missing Swedish (e.g. src/world/region1.ts)
//
// A line is found where the code pairs Spanish with English:
// say('…', { en: '…' }) and anything else called with an `en` option, ['es', 'en'] pairs, { es, en } objects,
// promptText/chooseText(label, en), word lists ('es | other = en'), and the FAQ (English only: keyed by itself).
// Template strings made of constants (`RUTA 10. Al norte: ${TOWN6}`) are worked out; those with values only known
// while playing (a Palabrita's name) can't be looked up by their text and carry their Swedish inline (`sv:`).
import { parseAst } from 'rolldown/parseAst';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const rel = (f) => relative(ROOT, f).replace(/\\/g, '/');

function files(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith('.ts') && !p.endsWith('.d.ts') ? [p] : [];
  });
}

const parsed = new Map();
const parse = (f) => {
  if (!parsed.has(f)) parsed.set(f, parseAst(readFileSync(f, 'utf8'), { lang: 'ts' }, f));
  return parsed.get(f);
};

function walk(node, visit, parent) {
  if (!node || typeof node.type !== 'string') return;
  visit(node, parent);
  for (const v of Object.values(node)) {
    if (Array.isArray(v)) for (const c of v) walk(c, visit, node);
    else if (v && typeof v === 'object' && typeof v.type === 'string') walk(v, visit, node);
  }
}

// Constant strings, by name, from every file (a name defined twice with different text is left unknown).
const CONSTS = new Map();
const AMBIGUOUS = new Set();

/** The text of a string-ish expression, or undefined if it depends on something only known while playing. */
function text(n) {
  if (!n) return undefined;
  if (n.type === 'Literal' && typeof n.value === 'string') return n.value;
  if (n.type === 'TemplateLiteral') {
    let s = '';
    for (let i = 0; i < n.quasis.length; i++) {
      s += n.quasis[i].value.cooked;
      if (i < n.expressions.length) {
        const v = text(n.expressions[i]);
        if (v === undefined) return undefined;
        s += v;
      }
    }
    return s;
  }
  if (n.type === 'BinaryExpression' && n.operator === '+') {
    const [a, b] = [text(n.left), text(n.right)];
    return a === undefined || b === undefined ? undefined : a + b;
  }
  if (n.type === 'Identifier' && !AMBIGUOUS.has(n.name)) return CONSTS.get(n.name);
  if (n.type === 'CallExpression' && n.callee.property?.name === 'toUpperCase' && !n.arguments.length) return text(n.callee.object)?.toUpperCase();
  if (n.type === 'TSAsExpression' || n.type === 'TSSatisfiesExpression' || n.type === 'ParenthesizedExpression') return text(n.expression);
  return undefined;
}
const isStringish = (n) => n && (n.type === 'Literal' ? typeof n.value === 'string' : n.type === 'TemplateLiteral');
const prop = (obj, name) => obj.properties?.find((p) => p.type === 'Property' && (p.key?.name ?? p.key?.value) === name);

// Not shown in the game: the dev pages, the songs' names (the music page), the items' English (the bag shows their Spanish).
const SOURCES = files(join(ROOT, 'src')).filter((f) => !/[\\/](dev|data[\\/]sv)[\\/]|data[\\/](music|items)\.ts$/.test(f));
const SV_FILES = files(join(ROOT, 'src/data/sv')).filter((f) => !f.endsWith('index.ts'));

function collectConsts() {
  for (let round = 0; round < 4; round++) {
    for (const f of [...SOURCES, ...SV_FILES])
      walk(parse(f), (n) => {
        if (n.type !== 'VariableDeclarator' || n.id?.type !== 'Identifier' || !n.init) return;
        const v = text(n.init);
        if (v === undefined) return;
        const had = CONSTS.get(n.id.name);
        if (had !== undefined && had !== v) AMBIGUOUS.add(n.id.name);
        CONSTS.set(n.id.name, v);
      });
  }
}

/** Every line with English in the source: { file, line, es, en, sv? (inline), dynamic }. */
export function sourceLines() {
  collectConsts();
  const out = [];
  for (const f of SOURCES) {
    const src = readFileSync(f, 'utf8');
    const lineOf = (n) => src.slice(0, n.start).split('\n').length;
    const add = (n, esN, enN, svN, kind) => {
      const en = text(enN);
      // Helpers passing a line along (say(es, { en })) aren't lines: only text written here counts.
      if (en === undefined && !isStringish(enN) && enN?.type !== 'ConditionalExpression') return;
      // «…» says nothing: what's acted out is keyed by its English (ui/textbox.ts).
      const es = esN && !/^[…. ]*$/.test(text(esN) ?? '-') ? text(esN) : en;
      out.push({ file: rel(f), line: lineOf(n), es, en: en ?? src.slice(enN.start, enN.end), sv: svN ? text(svN) ?? src.slice(svN.start, svN.end) : undefined, dynamic: es === undefined || en === undefined, kind });
    };
    const content = /src[\\/]data[\\/]content[\\/]/.test(f);
    walk(parse(f), (n, parent) => {
      if (content) {
        // Word lists: 'el perro | el can = the dog'. The shown Spanish is the first form.
        const s = isStringish(n) && parent?.type === 'ArrayExpression' ? text(n) : undefined;
        const eq = s?.lastIndexOf(' = ') ?? -1;
        if (eq > 0) out.push({ file: rel(f), line: lineOf(n), es: s.slice(0, eq).split('|')[0].trim(), en: s.slice(eq + 3).trim(), kind: 'word' });
        if (n.type === 'ObjectExpression' && prop(n, 'name') && prop(n, 'en')) add(n, prop(n, 'name').value, prop(n, 'en').value, prop(n, 'sv')?.value, 'theme');
        return;
      }
      if (n.type === 'CallExpression') {
        const callee = n.callee.name ?? n.callee.property?.name;
        if (callee === 'glossLabel') for (const v of strings(n.arguments[0])) add(v, v, v, undefined, 'label');
        const opts = n.arguments.find((a) => a.type === 'ObjectExpression' && prop(a, 'en'));
        if (opts && n.arguments[0] !== opts) add(n, n.arguments[0], prop(opts, 'en').value, prop(opts, 'sv')?.value, 'say');
        // gloss(es, en, sv?) and gift(id, n, es, en). Prompts' hints (promptText(label, en)...) are keyed by their English.
        const at = { gloss: 0, gift: 2 }[callee];
        if (at !== undefined && n.arguments.length >= at + 2) add(n, n.arguments[at], n.arguments[at + 1], callee === 'gloss' ? n.arguments[2] : undefined, 'call');
        if (['promptText', 'chooseText', 'question', 'untilRight'].includes(callee) && n.arguments.length >= 2) add(n.arguments[1], null, n.arguments[1], undefined, 'hint');
        // Text in the player's own language (Sam explaining the game in English): keyed by its English.
        if (callee === 'native') for (const v of strings(n.arguments[0])) add(v, null, v, undefined, 'native');
        if (callee === 'sayOrMime' && n.arguments.length >= 2) add(n.arguments[1], null, n.arguments[1], undefined, 'mime');
      } else if (n.type === 'ObjectExpression') {
        // { es, en } (signs, the Palabridex...), and { name, en } (items, themes).
        const es = prop(n, 'es') ?? prop(n, 'name'), en = prop(n, 'en');
        if (es && en && isStringishOrConst(es.value) && parent?.type !== 'CallExpression') add(n, es.value, en.value, prop(n, 'sv')?.value, 'object');
        // Challenge labels holding their own translation, keyed by themselves (labelSv when built while playing).
        const label = prop(n, 'label');
        for (const v of label ? strings(label.value) : []) if (/ · |«/.test(text(v) ?? src.slice(v.start, v.end))) add(v, v, v, prop(n, 'labelSv')?.value, 'label');
        const q = prop(n, 'q'), a = prop(n, 'a');
        if (q && a && /faq\.ts$/.test(f)) for (const p of [q, a]) add(p, null, p.value, undefined, 'faq');
      } else if (n.type === 'ArrayExpression' && [2, 3].includes(n.elements.length) && n.elements.every(isStringishOrConst)) {
        // ['es', 'en'] lines (and ['es', 'en', 'sv'] when built while playing). Choices (['Sí', 'No']) are given to menu() or ask(): those aren't pairs.
        if (parent?.type === 'CallExpression' && ['menu', 'ask'].includes(parent.callee.name)) return;
        // A mime with its Swedish (sayOrMime(line, [en, sv])) is done already.
        if (parent?.type === 'CallExpression' && parent.callee.name === 'sayOrMime' && parent.arguments[1] === n) return;
        // Not pairs either: art rows and colors (no words), two Spanish options (Spanish letters in the second).
        const [a, b] = n.elements.map((e) => text(e) ?? src.slice(e.start, e.end));
        // And menu choices in capitals (['NUEVA PARTIDA', 'IMPORTAR']), or a default (choices = ['Sí', 'No']).
        if (/^#|^[^a-z]*$|^[a-z_0-9]+$/i.test(a) || /[áéíóúñ¿¡]/i.test(b) || /^[^a-z]*$/.test(b) || parent?.type === 'AssignmentPattern') return;
        // Two names (types: ['Psíquico', 'Lucha']).
        if ([a, b].every((x) => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/.test(x))) return;
        // Two Spanish options (['la mesa', 'el zapato']).
        if (/^(el|la|los|las|un|una) /.test(b)) return;
        // A third element is a line's Swedish only when it's built while playing (static Swedish is in src/data/sv/).
        const sv = n.elements[2];
        if (sv && !(sv.type === 'TemplateLiteral' && sv.expressions.length)) return;
        add(n, n.elements[0], n.elements[1], sv, 'pair');
      }
    });
  }
  return out;
}
/** The strings an expression can be: 'a', x ?? 'a', c ? 'a' : 'b'. */
const strings = (n) =>
  !n ? [] : isStringish(n) ? [n] : n.type === 'ConditionalExpression' ? [...strings(n.consequent), ...strings(n.alternate)] : n.type === 'LogicalExpression' ? strings(n.right) : n.type === 'ParenthesizedExpression' ? strings(n.expression) : [];
const isStringishOrConst = (n) => isStringish(n) || (n?.type === 'Identifier' && CONSTS.has(n.name));

/** The Swedish in src/data/sv/: { es → { sv, file } }. */
export function swedish() {
  if (!CONSTS.size) collectConsts();
  const out = new Map();
  for (const f of SV_FILES)
    walk(parse(f), (n) => {
      if (n.type !== 'Property') return;
      const key = n.computed ? text(n.key) : n.key.type === 'Literal' ? n.key.value : n.key.name;
      const sv = text(n.value);
      if (key !== undefined && sv !== undefined) out.set(key, { sv, file: rel(f) });
    });
  return out;
}

export function report() {
  const lines = sourceLines();
  const sv = swedish();
  const known = new Set(lines.filter((l) => !l.dynamic).map((l) => l.es));
  const orphans = [...sv.keys()].filter((k) => !known.has(k));
  // Different Spanish, different English, the same Swedish: the Swedish lost a difference the English kept.
  const bySv = new Map();
  for (const l of lines) {
    const s = l.dynamic ? undefined : sv.get(l.es)?.sv;
    if (!s) continue;
    const list = bySv.get(s) ?? [];
    if (!list.some((o) => o.es === l.es)) list.push(l);
    bySv.set(s, list);
  }
  const collisions = [...bySv].filter(([, ls]) => ls.some((l) => l.kind === 'word') && new Set(ls.map((l) => l.en)).size > 1);
  // The same Spanish meaning two things (a word and a prompt's hint): it can have only one Swedish.
  const byEs = new Map();
  for (const l of lines.filter((x) => !x.dynamic)) byEs.set(l.es, (byEs.get(l.es) ?? new Set()).add(l.en));
  const clashes = [...byEs].filter(([, ens]) => ens.size > 1).map(([es, ens]) => `${es}: ${[...ens].join(' / ')}`);
  return { lines, sv, orphans, collisions, clashes };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { lines, sv, orphans, collisions, clashes } = report();
  const has = (l) => !!l.sv || (!l.dynamic && sv.has(l.es));
  const [cmd, which] = process.argv.slice(2);
  if (cmd === 'todo') {
    const seen = new Set();
    for (const l of lines.filter((x) => x.file === which && !has(x))) {
      if (!l.dynamic && seen.has(l.es)) continue;
      seen.add(l.es);
      console.log(l.dynamic ? `// ${l.file}:${l.line} (built while playing: add sv inline) ${l.en}` : `  ${JSON.stringify(l.es)}: '', // ${l.en}`);
    }
  } else {
    const byFile = new Map();
    for (const l of lines) {
      const s = byFile.get(l.file) ?? { n: 0, done: 0, dyn: 0 };
      s.n++;
      if (has(l)) s.done++;
      if (l.dynamic && !l.sv) s.dyn++;
      byFile.set(l.file, s);
    }
    let [n, done] = [0, 0];
    for (const [f, s] of [...byFile].sort()) {
      n += s.n;
      done += s.done;
      console.log(`${String(Math.round((100 * s.done) / s.n)).padStart(3)}%  ${String(s.done).padStart(4)}/${String(s.n).padEnd(4)} ${f}${s.dyn ? `  (${s.dyn} built while playing)` : ''}`);
    }
    console.log(`\n${done}/${n} lines in Swedish (${Math.round((100 * done) / n)}%)`);
    if (orphans.length) console.log(`\nSwedish whose Spanish is gone (${orphans.length}):\n  ${orphans.join('\n  ')}`);
    if (clashes.length) console.log(`\nThe same Spanish with different English (${clashes.length}):\n  ${clashes.join('\n  ')}`);
    if (collisions.length) console.log(`\nThe same Swedish for different meanings (${collisions.length}):\n  ${collisions.map(([s, ls]) => `${s}: ${ls.map((l) => `${l.es} (${l.en})`).join(' / ')}`).join('\n  ')}`);
  }
}
