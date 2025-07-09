// src/games/Jackpot/instructions/LeaveGame.tsx
import React, { useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { AnchorProvider, IdlAccounts } from '@coral-xyz/anchor';
import { useGambaContext, useSendTransaction } from 'gamba-react-v2';
import * as gamba from '@gamba-labs/multiplayer-sdk';
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk';

type Props = {
  pubkey: PublicKey;
  account: IdlAccounts<Multiplayer>['game'];
  onTx?: () => void;
};

export default function LeaveGame({ pubkey, account, onTx }: Props) {
  const { provider: gambaProvider } = useGambaContext();
  if (!gambaProvider) return null;
  const anchorProvider = gambaProvider.anchorProvider as AnchorProvider;

  const sendTransaction = useSendTransaction();
  const [busy, setBusy] = useState(false);

  const handleLeave = useCallback(async () => {
    setBusy(true);
    try {
      const ix = await gamba.leaveGameIx(anchorProvider, {
        accounts: {
          gameAccount:   pubkey,
          mint:          account.mint,
          playerAccount: anchorProvider.wallet.publicKey,
        },
      });
      await sendTransaction([ix]);
      onTx?.();
    } catch (err) {
      console.error('LeaveGame failed', err);
    } finally {
      setBusy(false);
    }
  }, [anchorProvider, pubkey, account.mint, sendTransaction, onTx]);

  return (
    <button
      onClick={handleLeave}
      disabled={busy}
      style={{
        padding: '8px 12px',
        background: '#e53935',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        marginLeft: 8,
      }}
    >
      {busy ? 'Leaving…' : 'Leave'}
    </button>
  );
}
