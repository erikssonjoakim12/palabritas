# Feedback round 3 (2026-11-04)

The user's notes after beating gym 2, for the next session. Gym 2 itself is done: Líder Petra now brings only
Tinajón 21 and Petroglifón 22.

## 1. Leaders stand apart from their gym trainers

A leader shouldn't bring the same Palabritas at the same levels as the trainers in their own gym. Fix the
trainers, not the leaders, so the leaders keep the teams the user already knows:

| Gym | Leader | Overlap to remove |
|---|---|---|
| 4, Don Tizón | Chocoyote 27, Cohetón 28, Brasaurio 32 | Malabarista Ricky's Cohetón 26, Fritanguero Neno's Chocoyote 26: give them Chispita / Chocoyito and other volcano Palabritas instead |
| 5, Ortiga | Dardito 36, Hojarasco 37, Ranojón 37, Oropelón 39 | Yerbero Chepe's Dardito 33 and Hojarasco 33: Pestañita, Hojadillo, Ranojito (the young forms) instead |
| 6, Esperanza | Duende 40, Polilluna 41, Quetzalón 41, Carablanca 43 | Barista Joel's Carablanca 37: Carablanquita at 25 and below can't be used (37 is above its evolution), so another Psíquico (Perezosito, Hojaluna) |

Also check gyms 1 and 3 the same way (Paloma, Marina). Test: `npm test -- data gym gym2 gym5 gym6` (whichever exist).

## 2. Rematches grow slowly

Now: a rematch trainer comes back one level under your strongest Palabrita, at most 8 above the first battle
(game/rematch.ts). The user finds that too strong, too fast: they get close to the gym leaders, so the gyms stop
feeling special.

The plan (the user suggested "at most 2 levels between meetings"; this keeps that and adds a ceiling):
- **Each rematch at most +2 levels over the last one** (not over the first battle). The save remembers each
  rematch trainer's last level, not only the day: `G.save.rematch[id] = { day, level }` (a migration turns
  today's plain day strings into `{ day, level: first-battle level }`).
- **A ceiling under the next leader:** never more than the next unbeaten leader's ace minus 6 (by medals:
  Paloma 12, Petra 22, Marina 25, Tizón 32, Ortiga 39, Esperanza 43, gym 7 50; past the last built gym, no
  ceiling beyond +2 a time). So a region's rematches grow with you, but the gym still feels like a step up.
- Never below the first battle's levels, and still never above your strongest Palabrita − 1.
- Evolving as they grow stays.
- Test: extend tests/rematch.test.mjs (two rematches on different days: +2, then +2 more; the ceiling).
