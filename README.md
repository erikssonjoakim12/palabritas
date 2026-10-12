# Palabritas

A Game Boy Color–style monster-taming RPG where your creatures level up by **you** learning
Spanish (Latin American). See [GAME_DESIGN.md](GAME_DESIGN.md) for how it works.

## Run it

```sh
npm install
npm run dev        # http://localhost:5173 on this computer (keyboard: arrows, Z = A, X = B, Enter = START)
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

To play anywhere (offline, real app install), the `dist/` folder from `npm run build` can be hosted on any
static HTTPS host (GitHub Pages, Netlify, Cloudflare Pages).

Progress is saved in the phone's browser (autosaves on doors, battles and conversations; START → GUARDAR also works).

## Project layout

```
src/
  data/content/   Spanish content per theme, one tier per level ("es | alt = en")
  data/           creatures, type chart, trainers
  game/           save state, spaced repetition & loyalty, stats & leveling
  world/          maps (ASCII), overworld engine, NPC scripts & quests
  battle/         battles, catching, trainer defense
  ui/             text box, menus, challenge panel, party/details, START menu
  lang/           answer checking (accents/typos), numbers, voice & mic
  art/            all pixel art, drawn in code
```

Adding words: edit a file in `src/data/content/`. Adding a map: add it to `src/world/maps.ts`.

## Changing the look

All visual style lives in `src/style/` (modeled on Pokémon Gold/Silver's daytime GBC palettes):

- `colors.ts`: every color, grouped into 4-color palettes. Roof colors per town, clothing colors.
- `tiles.ts`: 16×16 tile art as text (digits pick palette colors, `.` is transparent).
- `people.ts`: heads, bodies, and which character wears what (`LOOKS`). Overworld objects.

Each town picks its ground and roof color in `maps.ts` (`ground: 'town'`, `roof: 'green'`).
Walking speed is `WALK_SPEED` in `src/world/world.ts`. UI text-box colors are the CSS
variables at the top of `src/style.css`.
