/*───────────────────────────────────────────────────────────────
  @gamba-labs/multiplayer-sdk – Public API barrel
────────────────────────────────────────────────────────────────*/

/** ─ Core constants & helpers ─ */
export * from "./constants.js";           // IDL, PROGRAM_ID, WRAPPED_SOL_MINT, getProgram
export { dumpIx } from "./utils/ix-debug.js";

/** ─ Error decoding ─ */
export * from "./errors.js";

/** ─ Instructions ─ */
export * from "./instructions/gamba-config.js";
export * from "./instructions/create-game.js";
export * from "./instructions/distribute.js";
export * from "./instructions/join-game.js";
export * from "./instructions/leave-game.js";
export * from "./instructions/select-winners.js";

/** ─ Fetch helpers ─ */
export * from "./fetch.js";

/** ─ Events (still single file for now) ─ */
export * from "./events.js";

/** ─ IDL & Types ─ */
export type { Multiplayer } from "./types/multiplayer.js";
/* (IDL itself is already exported via `constants.ts`) */
