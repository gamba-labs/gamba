// src/multiplayer/useGame.ts
import { useEffect, useState } from "react";
import type { AnchorProvider, IdlAccounts } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  getProgram,
  fetchPlayerMetadata,
  Multiplayer,
  deriveMetadataPda,
} from "@gamba-labs/multiplayer-sdk";
import { useGambaContext } from "../GambaProvider";

export interface GameWithMeta {
  game: IdlAccounts<Multiplayer>["game"] | null;
  metadata?: Record<string, string>;
}

/**
 * If `opts.fetchMetadata` is true, also loads the PlayerMetadataAccount
 * and exposes it as `metadata` (player→string map).
 */
export function useGame(
  pk: PublicKey | null,
  opts: { fetchMetadata?: boolean } = {}
): GameWithMeta {
  const { provider } = useGambaContext();
  const [game, setGame] = useState<IdlAccounts<Multiplayer>["game"] | null>(
    null
  );
  const [metadata, setMetadata] = useState<Record<string, string>>({});

  // 1) load & subscribe to the game account
  useEffect(() => {
    if (!provider || !pk) {
      setGame(null);
      if (opts.fetchMetadata) setMetadata({});
      return;
    }

    const anchorProv = provider.anchorProvider as AnchorProvider;
    const conn = anchorProv.connection;
    const program = getProgram(anchorProv);
    const coder = program.coder.accounts;

    // initial load
    conn
      .getAccountInfo(pk, "confirmed")
      .then((info) => {
        if (!info?.data) {
          setGame(null);
        } else {
          setGame(coder.decode("game", info.data) as any);
        }
      })
      .catch(() => setGame(null));

    // live subscribe
    const subId = conn.onAccountChange(
      pk,
      (info) => {
        if (!info?.data) {
          setGame(null);
        } else {
          try {
            setGame(coder.decode("game", info.data) as any);
          } catch {
            // ignore decode errors
          }
        }
      },
      "confirmed"
    );

    // cleanup (sync): swallow any errors
    return () => {
      conn.removeAccountChangeListener(subId).catch(console.error);
    };
  }, [provider, pk]);

  // 2) if requested, load & subscribe to the metadata PDA
  useEffect(() => {
    if (!opts.fetchMetadata || !provider || !game || !pk) {
      setMetadata({});
      return;
    }

    const anchorProv = provider.anchorProvider as AnchorProvider;
    const conn = anchorProv.connection;
    const gameSeed = game.gameSeed;
    const metaPda = deriveMetadataPda(pk);

    // initial fetch
    fetchPlayerMetadata(anchorProv, gameSeed)
      .then(setMetadata)
      .catch(console.error);

    // live subscribe
    const msub = conn.onAccountChange(
      metaPda,
      (info) => {
        if (info?.data) {
          fetchPlayerMetadata(anchorProv, gameSeed)
            .then(setMetadata)
            .catch(console.error);
        }
      },
      "confirmed"
    );

    // cleanup (sync): swallow any errors
    return () => {
      conn.removeAccountChangeListener(msub).catch(console.error);
    };
  }, [opts.fetchMetadata, provider, game, pk]);

  return opts.fetchMetadata ? { game, metadata } : { game };
}
