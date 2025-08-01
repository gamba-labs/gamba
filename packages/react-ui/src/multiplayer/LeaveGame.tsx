import React, { useState, useCallback } from 'react';
import { PublicKey }                     from '@solana/web3.js';
import { IdlAccounts }                   from '@coral-xyz/anchor';
import { useMultiplayer }                from 'gamba-react-v2';
import type { Multiplayer }              from '@gamba-labs/multiplayer-sdk';
import { Button }                        from '../components/Button';

/**
 * Prop‑shape is identical to JoinGame so callers can pass
 *   <Multiplayer.LeaveGame pubkey={...} account={...} />
 */
export interface LeaveGameProps {
  /** PDA of the on‑chain game account */
  pubkey : PublicKey;
  /** decoded anchor account */
  account: IdlAccounts<Multiplayer>['game'];
  /** optional callback when the tx confirms */
  onTx?  : () => void;
}

export default function LeaveGame({
  pubkey,
  account,
  onTx,
}: LeaveGameProps) {
  const { leave }      = useMultiplayer();
  const [busy, setBusy] = useState(false);

  const handle = useCallback(async () => {
    setBusy(true);
    try {
      await leave({
        gameAccount: pubkey,
        mint       : account.mint,
      });
      onTx?.();
    } finally {
      setBusy(false);
    }
  }, [leave, pubkey, account.mint, onTx]);

  return (
    <Button disabled={busy} onClick={handle}>
      {busy ? 'Leaving…' : 'Leave'}
    </Button>
  );
}
