// src/games/Jackpot/instructions/EditBet.tsx
import React, { useState, useCallback } from 'react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AnchorProvider, IdlAccounts, BN } from '@coral-xyz/anchor';
import { useGambaContext, useSendTransaction } from 'gamba-react-v2';
import * as gamba from '@gamba-labs/multiplayer-sdk';
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk';

type Props = {
  pubkey: PublicKey;
  account: IdlAccounts<Multiplayer>['game'];
  onComplete?: () => void;
};

export default function EditBet({ pubkey, account, onComplete }: Props) {
  const { provider: gambaProvider } = useGambaContext();
  if (!gambaProvider) return null;
  const anchorProvider = gambaProvider.anchorProvider as AnchorProvider;
  const sendTransaction = useSendTransaction();

  // Find the player entry for the connected wallet and default to its wager
  const me = anchorProvider.wallet.publicKey!;
  const myEntry = account.players.find(p => p.user.equals(me));
  const currentLamports = myEntry?.wager.toNumber() ?? 0;
  // Default SOL amount string (with decimals)
  const [sol, setSol] = useState(
    (currentLamports / LAMPORTS_PER_SOL).toString()
  );
  const [busy, setBusy] = useState(false);

  const handleUpdate = useCallback(async () => {
    setBusy(true);
    try {
      // Parse SOL to lamports (round down)
      const newLamports = Math.floor(parseFloat(sol) * LAMPORTS_PER_SOL);

      // 1) Leave
      const leaveIx = await gamba.leaveGameIx(anchorProvider, {
        accounts: {
          gameAccount:   pubkey,
          mint:          account.mint,
          playerAccount: me,
        },
      });

      // 2) Join with updated wager
      const joinIx = await gamba.joinGameIx(anchorProvider, {
        accounts: {
          gameAccount:     pubkey,
          mint:            account.mint,
          playerAccount:   me,
          creatorAddress:  me,            // or your platform constant
        },
        wager:         new BN(newLamports),
        creatorFeeBps: 0,               // or your platform fee
        team:          0,               // if solo
      });

      await sendTransaction([leaveIx, joinIx]);
      onComplete?.();
    } catch (err) {
      console.error('EditBet failed', err);
    } finally {
      setBusy(false);
    }
  }, [anchorProvider, pubkey, account, sol, me, onComplete, sendTransaction]);

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        type="number"
        step="any"
        min="0"
        value={sol}
        onChange={e => setSol(e.target.value)}
        disabled={busy}
        style={{ width: 80, padding: 8, borderRadius: 4 }}
      />
      <button
        onClick={handleUpdate}
        disabled={busy}
        style={{
          padding: '8px 12px',
          background: '#ffa000',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          fontSize: 14,
        }}
      >
        {busy ? 'Updating…' : 'Update Bet'}
      </button>
    </div>
  );
}
