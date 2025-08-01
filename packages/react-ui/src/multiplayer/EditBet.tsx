// packages/react/src/multiplayer/EditBet.tsx
import React, { useState, useCallback }    from "react";
import { PublicKey, LAMPORTS_PER_SOL }     from "@solana/web3.js";
import { BN, AnchorProvider, IdlAccounts }from "@coral-xyz/anchor";
import { useGambaContext, useMultiplayer } from "gamba-react-v2";
import type { Multiplayer }                from "@gamba-labs/multiplayer-sdk";
import { Button }                          from "../components/Button";
import { WagerInput }                      from "../components/WagerInput";

export interface EditBetProps {
  pubkey         : PublicKey;
  account        : IdlAccounts<Multiplayer>["game"];
  creatorAddress?: PublicKey;
  creatorFeeBps ?: number;
  onComplete?    : () => void;
}

export default function EditBet({
  pubkey,
  account,
  creatorAddress,
  creatorFeeBps = 0,
  onComplete,
}: EditBetProps) {
  const { provider: gambaProvider } = useGambaContext();
  const anchorProvider =
    (gambaProvider?.anchorProvider as AnchorProvider) || null;

  // **Always** call hooks; don’t return early
  const walletPk  = anchorProvider?.wallet.publicKey ?? null;
  const myEntry   = walletPk
    ? account.players.find(p => p.user.equals(walletPk))
    : null;
  const currentLp = myEntry?.wager.toNumber() ?? 0;

  const [inputSol, setInputSol] = useState(
    (currentLp / LAMPORTS_PER_SOL).toFixed(2)
  );
  const [busy, setBusy] = useState(false);

  const { editBet } = useMultiplayer();

  const desiredLp = Math.floor(parseFloat(inputSol) * LAMPORTS_PER_SOL) || 0;
  const newLp     = Math.max(desiredLp, currentLp);
  const canRaise  = !!anchorProvider && newLp > currentLp;

  const handle = useCallback(async () => {
    if (!anchorProvider) return;  // guard but after all hooks
    setBusy(true);
    try {
      const params: {
        gameAccount   : PublicKey;
        mint          : PublicKey;
        wager         : BN;
        creatorAddress?: PublicKey;
        creatorFeeBps?: number;
      } = {
        gameAccount: pubkey,
        mint:        account.mint,
        wager:       new BN(newLp),
      };

      if (creatorAddress && creatorFeeBps > 0) {
        params.creatorAddress = creatorAddress;
        params.creatorFeeBps  = creatorFeeBps;
      }

      await editBet(params);
      onComplete?.();
    } finally {
      setBusy(false);
    }
  }, [
    editBet,
    pubkey,
    account.mint,
    newLp,
    creatorAddress,
    creatorFeeBps,
    onComplete,
    anchorProvider,
  ]);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <WagerInput
        value={newLp}
        onChange={lp =>
          setInputSol(
            (Math.max(lp, currentLp) / LAMPORTS_PER_SOL).toFixed(2)
          )
        }
        disabled={busy || !anchorProvider}
      />
      <Button
        main
        disabled={!canRaise || busy}
        onClick={handle}
      >
        {busy ? "Increasing…" : "Increase Bet"}
      </Button>
    </div>
  );
}
