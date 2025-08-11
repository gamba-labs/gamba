// src/utils/pda.ts

import { Program, utils as anchorUtils, BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "../constants";

/** 
 * Derive the global config PDA for Gamba:
 * seeds = [ "GAMBA_STATE" ]
 */
export function deriveGambaState(): PublicKey {
  const [gambaState] = PublicKey.findProgramAddressSync(
    [anchorUtils.bytes.utf8.encode("GAMBA_STATE")],
    PROGRAM_ID
  );
  return gambaState;
}

/**
 * Derive the game PDA from YOUR seed:
 * seeds = [ "GAME", seed_le_bytes ]
 */
export function deriveGamePdaFromSeed(seed: BN | number): PublicKey {
  const buf = new BN(seed).toArrayLike(Buffer, "le", 8);
  const [pda] = PublicKey.findProgramAddressSync(
    [anchorUtils.bytes.utf8.encode("GAME"), buf],
    PROGRAM_ID
  );
  return pda;
}

/** 
 * Derive the metadata PDA for a given game:
 * seeds = [ "METADATA", gamePda ]
 */
export function deriveMetadataPda(gamePda: PublicKey): PublicKey {
  const [metaPda] = PublicKey.findProgramAddressSync(
    [anchorUtils.bytes.utf8.encode("METADATA"), gamePda.toBuffer()],
    PROGRAM_ID
  );
  return metaPda;
}

/**
 * Derive the escrow‐ATA PDA for a given game PDA:
 *   seeds = [ gamePda ]
 */
export function deriveEscrowPda(gamePda: PublicKey): PublicKey {
  const [escrowPda] = PublicKey.findProgramAddressSync(
    [gamePda.toBuffer()],
    PROGRAM_ID
  );
  return escrowPda;
}