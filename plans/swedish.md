# Learning Spanish through Swedish (the user, 2026-11-11)

Today the game teaches Spanish through English: every line has English behind the EN button, and the challenges
show English (choose the meaning, write the Spanish for this). The plan: let the player pick **English or Svenska**
when starting a new game, and switch at any time in START → AJUSTES. The Spanish stays the same. Only the helper
language changes.

## Status

- ✓ **The code** (2026-11-11): the setting and its choice at a new game, TRADUCCIÓN in AJUSTES, the SV button,
  challenges, the team screen and dictionary, Sam (who explains the game) and the FAQ in Swedish; `tools/sv.mjs` and
  `tests/swedish.test.mjs`.
- ✓ **Shared text**: menus, battles, the Palacentro, the shop, field moves, the school, the Palabridex, tiles, the FAQ.
- Next: dialogue for regions 1–4 and their signs, then the word lists in level order (core first), then regions 5–8.
- Later: a Swedish column in the dictionary page.

How some text is keyed, learned while building: a line is keyed by its Spanish; text with no Spanish (the FAQ, Sam,
what someone acts out on a muted map, a prompt's hint) by its English; a challenge label holding its own translation
('¿Qué significa? · What does it mean?') by the whole label.

An earlier estimate (2026-10-25) was put on hold. Since then regions 6–8 and the themes up to level 50 have grown the
text by about a third, so the numbers below are recounted.

## What gets translated

| What | Entries | English words | Where |
|---|---|---|---|
| Word lists (core and 41 themes, levels 2–50) | ~7,400 | ~48,000 | `src/data/content/*.ts` |
| Dialogue (NPCs, quests, trainers, Lucas, leaders, school) | ~1,100 | ~15,000 (with the rest below) | `src/world/*.ts`, `flows.ts` |
| Everything else (Palabridex 103 entries, items, signs, tiles' look texts, battle messages, menus, tips, grading reasons) | ~500 | | `species.ts`, `items.ts`, `maps/`, `battle.ts`, `ui/` |
| **Total** | **~9,000** | **~63,000** | |

About 80 lines are built while playing (`` `${name} learned ${move}!` ``). They can't be looked up by their text, so
they get their Swedish next to the English (see below).

## How it works

**The setting:** `G.save.settings.gloss: 'en' | 'sv'`, default `'en'` (a migration gives old saves `'en'`).
Changing it changes nothing about progress: mastery is about the Spanish, so switching mid-game is safe.

**Where the Swedish lives:** separate files, `src/data/sv/` (one per theme, plus dialogue per region), keyed by the
**Spanish** text:

```ts
export const perro: Record<string, string> = {
  'el perro': 'hunden',
  'Mi perro come mucho': 'Min hund äter mycket',
};
```

- The English files stay untouched and readable. Translating from the Spanish (with the English beside it as a check)
  gives more natural Swedish than translating the English.
- The files are a **separate chunk, loaded only when Svenska is chosen**: English players download nothing extra.
- A missing line falls back to English, so a half-translated game still works, just mixed.

**One lookup, at a few doors.** Nearly all English goes through a handful of places. Each gets one function,
`gloss(es, en)`, which returns the Swedish when it's chosen and there is one, and the English otherwise:
- `say()` and `ask()` (textbox.ts and menu.ts): every line of dialogue and every sign, without touching the ~1,100
  call sites;
- the challenge (challenge.ts): the meaning to choose, the prompt for writing and speaking, the answer line;
- the word lists in the dictionary, the team screen and the Palabridex (`item.en` in about 25 places);
- the ~15 labels written as 'Escríbelo en español · Write it in Spanish', which become one `bi(es, en)` helper.

**The EN button** becomes **SV** in Swedish (same place, same behavior).

**Lines built while playing** (~80, mostly in battle.ts and flows.ts) get an `sv` next to their `en`:
`say(es, { en: \`${n} learned...\`, sv: \`${n} lärde sig...\` })`.

**Choosing the right meaning.** The "choose" challenge shows the right meaning and three wrong ones. In Swedish, two
different Spanish words can share a translation where English kept them apart, or the other way round (*tú* and
*usted* are both "du"; *ser* and *estar* are both "vara"). So:
- the wrong options are picked by their Swedish when Swedish is on (one line in `distractors()`);
- like the English, the Swedish disambiguates where needed: *usted* = "du (artigt)";
- the data test checks that two different Spanish items with the same English also share their Swedish, and flags
  new collisions.

The player never types Swedish or English: answers are always Spanish. So grading (check.ts) doesn't change, and
neither does the voice (speech is Spanish only).

**Choosing it:**
- **New game:** the first screen after NUEVA PARTIDA is two buttons, **English** and **Svenska**, before the
  professor speaks. A phone set to Swedish starts with Svenska selected (the user). Whatever you pick is kept in the save and never changes by itself, whatever the phone says, until you change it in AJUSTES.
- **While playing:** START → AJUSTES gets a line **TRADUCCIÓN: English / Svenska** (the user). Switching loads the Swedish (well under
  a second) and the next line shown is in Swedish.

**Dev pages:** the dictionary (`/palabras.html`) gets a Swedish column and a coverage count per list, so missing
lines are easy to find.

**Tests:**
- `npm test -- data`:
  - every Swedish key exists in the Spanish (catches lines left behind when the Spanish changes);
  - every line is covered, once Swedish is complete;
  - the Swedish collisions described above.
- A new `swedish` browser test:
  - choose Svenska at the start, play the first lines and a battle, and check the SV button and the challenge show
    Swedish;
  - switch back to English in AJUSTES;
  - check that an old save opens in English.

## Impact

**Code:** small and contained. About 1 session.
- About 10 files change: textbox, menu, challenge, learning (`distractors`), party, startmenu (AJUSTES and the
  dictionary), title (the choice), state (the setting and migration), content index (loading), and the data test.
- The ~80 built-at-runtime lines are spread over ~15 files.
- No change to maps, battles, learning or saves beyond the one setting. Nothing that exists breaks.

**Translation:** the real work. About 63,000 words, translated from the Spanish, in level order so Swedish is
playable early:
1. Menus, battle messages, the Palabridex, items, signs, and dialogue for regions 1–4: about 1 session.
2. Word lists up to level ~25 (enough to play to gym 4): about 1–2 sessions.
3. Dialogue for regions 5–8, and the word lists to level 50: about 3–4 sessions.

In all, about **6–7 sessions** with the code included. Swedish is good to play to gym 4 after about 3. It works in
between too, falling back to English where the Swedish isn't there yet.

**From then on:** every new line of dialogue and every new word needs its Swedish too. That's about 15% more work on
each future feature. The data test catches anything forgotten.

**Performance:**
- English players download nothing extra: the Swedish is its own chunk.
- Swedish players download it once: about 700 KB (the Spanish keys plus the Swedish), about 200 KB compressed (the game is about 1.5 MB today). The
  service worker keeps it for offline play, like the rest of the game.
- Memory: about 9,000 short strings, around 1–2 MB on the phone.
- Speed: one lookup in a table per line shown. Nothing per frame, so the map, battles and animations are unaffected.

**Risks:**
- *Mixed languages* while the translation is incomplete, for a tester further on than the Swedish. Mitigation:
  translate in level order, and show "Svenska (beta)" until it's complete.
- *Drift:* the Spanish of a line is edited and its Swedish is orphaned. The data test catches this, and the English
  shows meanwhile.
- *Translation quality:* phrases that only work in English. A few lines explain English-specific points, such as
  "(the language)" or "you (plural)", and get Swedish of their own. The user reviews samples.
