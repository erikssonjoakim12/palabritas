# Palabritas

A Game Boy Color–style monster-taming RPG where your creatures level up by **you** learning
Spanish (Latin American). Play it at https://erikssonjoakim12.github.io/palabritas/ (every push to `main` deploys).

How it works: [GAME_DESIGN.md](GAME_DESIGN.md) · where it's going: [ROADMAP.md](ROADMAP.md) · the Spanish:
[LEARNING_PLAN.md](LEARNING_PLAN.md) · notes, rules and recipes for building it: [CLAUDE.md](CLAUDE.md).

## Run it

```sh
npm install
npm run dev        # http://localhost:5173 on this computer (keyboard: arrows, Z = A, X = B, Enter = START)
npm test           # every browser test (silent)
```

## Play on your Android phone

The microphone only works on secure (HTTPS) pages, so use the phone server:

1. Computer and phone on the **same Wi-Fi**.
2. Double-click **Palabritas** on the desktop (or `Palabritas.bat` here, or run `npm run phone`).
   A window opens with a QR code. Keep it open while you play.
   (If Windows asks whether Node may use the network, allow it for the type of network you're on.)
3. Scan the QR code with the phone camera and open it in **Chrome**. You'll get a certificate
   warning because the certificate is self-signed: tap **Advanced → Proceed**.
4. Allow the microphone when the first 🎤 challenge asks.
5. Optional: Chrome menu ⋮ → **Add to Home screen** to launch it like an app.

Progress is saved in the phone's browser (autosaves on doors, battles and conversations; START → GUARDAR also
works). To move a game to another device, START → GUARDAR → Exportar archivo saves a file, and the title screen
(IMPORTAR, or START → AJUSTES → Importar partida) loads it.

## The other pages

Published next to the game, and run locally with:

| | |
|---|---|
| `npm run art` | `art.html`: every Palabrita, portrait, sprite, tile and map, and the stitched world |
| `npm run words` | `palabras.html`: every word and phrase, its lists and levels, and who teaches it |
| `npm run music` | `musica.html`: every song and jingle, with voices to mute |

## Project layout

```
src/
  engine/         screen, input, the frame loop, sound effects
  game/           save state and migrations, mastery and spaced repetition, Palabritas' stats, the bag
  data/           Palabritas, types, trainers, items, songs; data/content/: the Spanish (core list, themes, topics)
  world/          the overworld engine, maps (world/maps/, one file per region), scripts and quests
  battle/         battles, catching, trainer defense
  ui/             text box, menus, challenges, team and details, START menu, town map
  lang/           answer checking (accents, typos), numbers, voice and microphone
  audio/          the music player and the game's music
  style/          the look: every color, and the tile, people and Palabrita art as rows of characters
  art/            drawing: tiles, sprites, portraits, placeholder Palabritas, lights
  dev/            the art, words and music pages
tests/            browser tests (silent)
tools/            screenshots, art conversion, pace and performance checks (all silent)
```

## Changing the look

All visual style lives in `src/style/` (modeled on Pokémon Gold/Silver's daytime GBC palettes):

- `colors.ts`: every color, grouped into 4-color palettes. Roof colors per town, clothing colors.
- `tiles.ts`: 16×16 tile art as text (digits pick palette colors, `.` is transparent).
- `people.ts`: heads, bodies, and which character wears what (`LOOKS`). Overworld objects.
- `palabritas.ts`: the Palabritas' front and back art.

Each town picks its ground and roof color in its map (`ground: 'town'`, `roof: 'green'`).
Walking and running speed are `WALK_FRAMES` and `RUN_FRAMES` in `src/world/world.ts`. UI text-box colors are the
CSS variables at the top of `src/style.css`.

The app icon is our mascot Aguacatito, drawn from the game's own sprite on the art page. After changing it, run
`node tools/icons.mjs .` to save both PNGs into `public/` (the tools use a dev server on port 5181:
`npx vite --port 5181`, or set `PALABRITAS_URL` to yours).
