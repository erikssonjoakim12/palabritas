# Build plans: gyms 2–4

The overview, with the why and the decisions, is [PLAN_GYMS_2-4.md](../PLAN_GYMS_2-4.md). These files are the
detailed specs to build from. **One phase per session:** start a session with "Build phase N from
plans/", and it reads:

1. [CLAUDE.md](../CLAUDE.md): rules, where things are, recipes, tests.
2. [PLAN_GYMS_2-4.md](../PLAN_GYMS_2-4.md): the big picture (skim).
3. The phase file below, plus the shared files it points to.

| Phase | File | Ends with |
|---|---|---|
| 1–3 | built ✓ (their specs were removed: the code is the truth, and git history has them) | the groundwork, the pine highlands (Medalla Barro), the Pacific coast (Medalla Ola) |
| 4 | built ✓ ([phase4-region4.md](phase4-region4.md), kept for its decisions) | volcanoes and dry forest: playable to the Medalla Chispa |
| 5 | [phase5-polish.md](phase5-polish.md) | a full playthrough test, the pace check, docs, the art brief |

**Shared:**
- [palabritas.md](palabritas.md): region 4's Palabritas, ready to paste.
- [content.md](content.md): region 4's themes and school topics.

**What the specs promise:**
- Every map in them was **drawn and checked** before it was written down: every way in and out is reachable
  (ledges count as one-way), trainers marked "in the way" can't be walked past, seams line up with
  neighboring maps, and the gym 3 currents were simulated.
- Paste the rows as they are. If a map has to change, run `npm test -- maps` after.
- Dialogue is given in Spanish and English. Keep the Spanish; small wording fixes are fine.
- Spanish content follows content.md's rules; `npm test -- data` checks it.
- When something in a spec is unclear or wrong, decide sensibly, and note it in the commit message.
  Decisions the user should hear about go in the final message of the session.

**Every phase:**
- Commit after each numbered section with `npm test` green.
- Push at the end.
- Mark the phase ✓ in ROADMAP.md.
