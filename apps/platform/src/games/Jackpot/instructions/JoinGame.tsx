// src/games/Jackpot/instructions/JoinGame.tsx
import React, { useState, useCallback } from 'react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AnchorProvider, IdlAccounts, BN } from '@coral-xyz/anchor';
import { useGambaContext, useSendTransaction } from 'gamba-react-v2';
import * as gamba from '@gamba-labs/multiplayer-sdk';
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk';

type Props = {
  pubkey: PublicKey;
  account: IdlAccounts<Multiplayer>['game'];
  onTx?: () => void;
};

export default function JoinGame({ pubkey, account, onTx }: Props) {
  const { provider: gambaProvider } = useGambaContext();
  if (!gambaProvider) return null;
  const anchorProvider = gambaProvider.anchorProvider as AnchorProvider;

  const sendTransaction = useSendTransaction();
  const [busy, setBusy] = useState(false);

  // display the on‐chain wager (a BN of lamports) as SOL with two decimals
  const initialSOL = (account.wager.toNumber() / LAMPORTS_PER_SOL).toFixed(2);
  const [wager, setWager] = useState<string>(initialSOL);

  const handleJoin = useCallback(async () => {
    setBusy(true);
    try {
      // parse SOL string back into lamports
      const sol = parseFloat(wager);
      if (isNaN(sol) || sol <= 0) throw new Error('Invalid wager');
      const lamports = Math.round(sol * LAMPORTS_PER_SOL);

      const ix = await gamba.joinGameIx(anchorProvider, {
        accounts: {
          gameAccount:   pubkey,
          mint:          account.mint,
          playerAccount: anchorProvider.wallet.publicKey,
          // platform constants already set internally
          creatorAddress: anchorProvider.wallet.publicKey,
        },
        // args
        wager:         new BN(lamports),
        creatorFeeBps: 0,    // or your constant
        team:          0,    // adjust if team game
      });

      await sendTransaction([ix]);
      onTx?.();
    } catch (err: any) {
      console.error('JoinGame failed', err);
      // you can toast here...
    } finally {
      setBusy(false);
    }
  }, [anchorProvider, account.mint, pubkey, wager, sendTransaction, onTx]);

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        type="number"
        step="0.01"
        value={wager}
        onChange={e => setWager(e.target.value)}
        disabled={busy}
        placeholder="SOL"
        style={{ flex: 1, padding: '8px', borderRadius: 4, border: '1px solid #444' }}
      />
      <button
        onClick={handleJoin}
        disabled={busy}
        style={{
          padding: '8px 16px',
          background: '#4caf50',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
        }}
      >
        {busy ? 'Joining…' : 'Join'}
      </button>
    </div>
  );
}
