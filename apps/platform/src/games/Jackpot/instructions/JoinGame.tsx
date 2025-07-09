// src/games/Jackpot/instructions/JoinGame.tsx
import React, { useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { AnchorProvider, IdlAccounts, BN } from '@coral-xyz/anchor';
import { useGambaContext, useSendTransaction } from 'gamba-react-v2';
import * as gamba from '@gamba-labs/multiplayer-sdk';
import { PLATFORM_CREATOR_FEE, PLATFORM_CREATOR_ADDRESS } from '../../../constants';
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
  const [busy, setBusy]   = useState(false);
  const [wager, setWager] = useState(account.wager.toString());
  const isTeamGame        = !!account.gameType.team;
  const [team, setTeam]   = useState('0');

  const handleJoin = useCallback(async () => {
    setBusy(true);
    try {
      const ix = await gamba.joinGameIx(anchorProvider, {
        accounts: {
          gameAccount:     pubkey,
          mint:            account.mint,
          playerAccount:   anchorProvider.wallet.publicKey,
          creatorAddress:  new PublicKey(PLATFORM_CREATOR_ADDRESS),
        },
        wager:         new BN(wager),
        creatorFeeBps: PLATFORM_CREATOR_FEE * 100, // Convert to basis points
        team:          isTeamGame ? Number(team) : 0,
      });
      await sendTransaction([ix]);
      onTx?.();
    } catch (err) {
      console.error('JoinGame failed', err);
    } finally {
      setBusy(false);
    }
  }, [
    anchorProvider,
    pubkey,
    account.mint,
    wager,
    team,
    isTeamGame,
    sendTransaction,
    onTx,
  ]);

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {account.wagerType.customWager && (
        <input
          type="number"
          value={wager}
          onChange={e => setWager(e.target.value)}
          placeholder="Wager"
          disabled={busy}
          style={{ flex: 1 }}
        />
      )}
      {isTeamGame && (
        <input
          type="number"
          min="0"
          max={account.numTeams - 1}
          value={team}
          onChange={e => setTeam(e.target.value)}
          placeholder={`Team 0–${account.numTeams - 1}`}
          disabled={busy}
          style={{ width: 80 }}
        />
      )}
      <button
        onClick={handleJoin}
        disabled={busy}
        style={{
          padding: '8px 12px',
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
