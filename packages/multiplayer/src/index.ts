/*───────────────────────────────────────────────────────────────
  @gamba-labs/multiplayer-sdk – Public API barrel
────────────────────────────────────────────────────────────────*/

/** ─ Core constants & helpers ─ */
export * from "./constants.js"; 

/** ─ Error decoding ─ */
export * from "./errors.js";

/** ─ Instructions ─ */
export * from "./instructions/gamba-config.js";
export * from "./instructions/create-game.js";
export * from "./instructions/distribute-native.js";
export * from "./instructions/distribute-spl.js";
export * from "./instructions/join-game.js";
export * from "./instructions/leave-game.js";
export * from "./instructions/select-winners.js";

/** ─ Fetch helpers ─ */
export * from "./fetch.js";

/** ─ Events  ─ */
export * from "./events.js";

/** ─ PDAs & address helpers ─ */
export * from "./utils/pda";

/** ─ IDL & Types ─ */
export type { Multiplayer } from "./types/multiplayer.js";
/* (IDL itself is already exported via `constants.ts`) */
