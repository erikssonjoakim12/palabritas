// What tests and tools set on the page (tools/browser.mjs, tests/lib.mjs), and what the game shows them.
export {};

declare global {
  /** Tests: "today" on a fixed date (YYYY-MM-DD). */
  var __today: string | undefined;
  /** Tests: a fixed hour of the day, for day and night (19.5 = half past seven). */
  var __hour: number | undefined;
  /** Tests: people who wander stay put, so tests find them where the map says. */
  var __still: boolean | undefined;
  /** Dev builds: the game's modules, for tests (main.ts). */
  var __game: Record<string, unknown> | undefined;
  /** Dev builds: the challenge on screen, so tests can read the question (ui/challenge.ts). */
  var __challenge: unknown;
}
