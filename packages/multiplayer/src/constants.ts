import { AnchorProvider, Program, utils as anchorUtils, web3 } from "@coral-xyz/anchor";
import rawIdl from "./idl/multiplayer.json" with { type: "json" };
import type { Multiplayer } from "./types/multiplayer.js";

export const IDL        = rawIdl as unknown as Multiplayer;
export const PROGRAM_ID = new web3.PublicKey(IDL.address);

export const WRAPPED_SOL_MINT = new web3.PublicKey(
  "So11111111111111111111111111111111111111112",
);

export const getProgram = (p: AnchorProvider) => new Program<Multiplayer>(IDL, p);

export function pda(seed: Uint8Array | Buffer | string[]) {
  return web3.PublicKey.findProgramAddressSync(
    Array.isArray(seed) ? seed.map(s => typeof s === "string" ? anchorUtils.bytes.utf8.encode(s) : s) : [seed],
    PROGRAM_ID,
  )[0];
}
