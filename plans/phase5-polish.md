# Phase 5 — polish

**Goal:** part two feels finished. Do this after phase 4.

1. **A full playthrough test.** Write `tests/journey.test.mjs`. It chains the region tests' checkpoints:
   - one save per medal;
   - each leg plays its key moments, with fast settings (wild encounters off through `currentMap()` while
     walking).
   - It mostly proves the story order holds together: gates, flags, warps.
2. **Pace check:** run `node tools/sim.mjs`, extended to report answers needed from level 12 to 31 for a team
   of 4. Compare with PLAN_GYMS_2-4.md §7.
   - If a region needs much more than its trainers + quests + one pass of wild battles + 25% extra, lower that
     region's levels by a step: no more than 2 levels.
   - Note the numbers in ROADMAP.md.
3. **The art page:**
   - the Palabrita list sorted by family (`DEX_ORDER`);
   - a "Night" section with the night maps;
   - the World view showing the whole loop.
   - Make an **art brief** file for the user, `art-src/ART_BRIEF.md`: every placeholder Palabrita with its
     Look line, in the priority order of palabritas.md §6, ready to paste into their ChatGPT prompt. Write it
     as a reader-facing file, not into a `.txt` (the user's own `.txt` notes stay theirs).
4. **Docs:**
   - ROADMAP.md: phases 1–5 marked ✓, the gym table's levels as built.
   - LEARNING_PLAN.md: the A2 core is in for 21–35.
   - CLAUDE.md: any new recipes learned while building (e.g. night maps, currents, gates on muted maps).
5. **A last look for leftovers:**
   - `grep` for temporary messages («Terminaste la segunda parte» must appear only after gym 4);
   - unused objects, looks or tiles;
   - TODO comments.
6. **Deploy:** push; check the GitHub Pages build passes.
