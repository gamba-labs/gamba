// packages/react-ui/src/multiplayer/JoinGame.tsx
import React, { useState, useCallback } from "react";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { IdlAccounts } from "@coral-xyz/anchor";
import { useMultiplayer, useGambaProvider } from "gamba-react-v2";
import { useConnection } from "@solana/wallet-adapter-react";
import type { Multiplayer } from "@gamba-labs/multiplayer-sdk";

import { Button } from "../components/Button";
import { WagerInput } from "../components/WagerInput";
import { TextInput } from "../components/TextInput";

import { useReferral } from "../referral/useReferral";
import { makeReferralPlugin } from "../referral/referralPlugin";
import { useGambaPlatformContext } from "../hooks";

export interface JoinGameProps {
  /** the on‐chain game account PDA */
  pubkey: PublicKey;
  /** decoded Anchor account for that PDA */
  account: IdlAccounts<Multiplayer>["game"];
  /** optional referrer address */
  creatorAddress?: PublicKey;
  /** override the fee in basis points (defaults to 0 ⇒ no fee) */
  creatorFeeBps?: number;
  /** referral cut in % (e.g. 0.0025 = 0.25%). If omitted, plugin default is used */
  referralFee?: number;
  /** show the “Name (opt.)” field */
  enableMetadata?: boolean;
  /** callback after a successful TX */
  onTx?: () => void;
}

export default function JoinGame({
  pubkey,
  account,
  creatorAddress,
  creatorFeeBps = 0,
  referralFee,                  // ← NEW
  enableMetadata = false,
  onTx,
}: JoinGameProps) {
  const { join } = useMultiplayer();
  const platform = useGambaPlatformContext();
  const { referrerAddress, isOnChain } = useReferral(); // ← no referralPct here
  const { anchorProvider } = useGambaProvider();
  const { connection } = useConnection();

  const [lamports, setLamports] = useState(account.wager.toNumber());
  const [metadata, setMetadata] = useState("");
  const [busy, setBusy] = useState(false);

  // base platform rake (bps)
  const baseCreatorFeeBps =
    creatorFeeBps > 0
      ? creatorFeeBps
      : Math.round(platform.defaultCreatorFee * 10_000);

  // subtract referral cut only if provided; otherwise no deduction
  const refPct = referralFee ?? 0;
  const effectiveCreatorFeeBps = Math.max(
    0,
    baseCreatorFeeBps - Math.round(refPct * 10_000),
  );

  const handle = useCallback(async () => {
    setBusy(true);
    try {
      if (lamports <= 0) throw new Error("Please enter a wager above 0");

      // Build referral Ixs ONLY for the first join
      let extraIxs: TransactionInstruction[] = [];
      if (referrerAddress) {
        const plugin =
          referralFee == null
            ? makeReferralPlugin(referrerAddress, !isOnChain)
            : makeReferralPlugin(referrerAddress, !isOnChain, referralFee);

        // minimal plugin args; we cast to keep TS chill
        extraIxs = await plugin(
          {
            creator: creatorAddress ?? platform.platform.creator,
            wallet: anchorProvider.wallet.publicKey!,
            token: account.mint,
            wager: lamports,
          } as any,
          {
            provider: anchorProvider,
            connection,
            creatorFee: effectiveCreatorFeeBps / 10_000,
          } as any,
        );
      }

      await join(
        {
          gameAccount: pubkey,
          mint: account.mint,
          wager: lamports,
          creatorAddress: creatorAddress ?? platform.platform.creator,
          creatorFeeBps: effectiveCreatorFeeBps,
          ...(enableMetadata && metadata.trim()
            ? { metadata: metadata.trim() }
            : {}),
        },
        extraIxs, // prepend referral transfer(s)
      );

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
    platform.platform.creator,
    baseCreatorFeeBps,
    referralFee,
    referrerAddress,
    isOnChain,
    effectiveCreatorFeeBps,
    anchorProvider,
    connection,
    onTx,
  ]);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <WagerInput value={lamports} onChange={setLamports} disabled={busy} />
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
