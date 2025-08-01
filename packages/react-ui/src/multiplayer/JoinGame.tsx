// packages/react/src/multiplayer/JoinGame.tsx
import React, { useState, useCallback } from "react";
import { PublicKey, LAMPORTS_PER_SOL }  from "@solana/web3.js";
import { IdlAccounts }                  from "@coral-xyz/anchor";
import { useMultiplayer }               from "gamba-react-v2";
import type { Multiplayer }             from "@gamba-labs/multiplayer-sdk";

import { Button }     from "../components/Button";
import { WagerInput } from "../components/WagerInput";
import { TextInput }  from "../components/TextInput";

export interface JoinGameProps {
  /** the on‐chain game account PDA */
  pubkey          : PublicKey;
  /** decoded Anchor account for that PDA */
  account         : IdlAccounts<Multiplayer>["game"];
  /** optional referrer address */
  creatorAddress? : PublicKey;
  /** override the fee in basis points (defaults to 0 ⇒ no fee) */
  creatorFeeBps?  : number;
  /** show the “Name (opt.)” field */
  enableMetadata? : boolean;
  /** callback after a successful TX */
  onTx?           : () => void;
}

export default function JoinGame({
  pubkey,
  account,
  creatorAddress,
  creatorFeeBps  = 0,
  enableMetadata = false,
  onTx,
}: JoinGameProps) {
  const { join } = useMultiplayer();

  // 👇 store lamports directly
  const [lamports,   setLamports]   = useState<number>(account.wager.toNumber());
  const [metadata,   setMetadata]   = useState<string>("");
  const [busy,       setBusy]       = useState<boolean>(false);

  const handle = useCallback(async () => {
    setBusy(true);
    try {
      if (lamports <= 0) {
        throw new Error("Please enter a wager above 0");
      }

      await join({
        gameAccount   : pubkey,
        mint          : account.mint,
        wager         : lamports,           // pass a JS number of lamports
        creatorAddress,
        creatorFeeBps,
        ...(enableMetadata && metadata.trim()
          ? { metadata: metadata.trim() }
          : {}),
      });

      onTx?.();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }, [
    join,
    pubkey,
    account.mint,
    lamports,
    metadata,
    enableMetadata,
    creatorAddress,
    creatorFeeBps,
    onTx,
  ]);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <WagerInput
        value={lamports}
        onChange={setLamports}
        disabled={busy}
      />

      {enableMetadata && (
        <TextInput
          placeholder="Name (opt.)"
          maxLength={10}
          value={metadata}
          onChange={setMetadata}
          disabled={busy}
          style={{ width: 100 }}
        />
      )}

      <Button main disabled={busy} onClick={handle}>
        {busy ? "Joining…" : "Join"}
      </Button>
    </div>
  );
}
