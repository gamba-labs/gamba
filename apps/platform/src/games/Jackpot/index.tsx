// src/games/Jackpot/index.tsx
import React, { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { AnchorProvider, IdlAccounts } from '@coral-xyz/anchor';
import { GambaUi } from 'gamba-react-ui-v2';
import { useGambaContext } from 'gamba-react-v2';
import { fetchSpecificGames } from '@gamba-labs/multiplayer-sdk';
import * as S from './styles';
import { DESIRED_CREATOR, DESIRED_MAX_PLAYERS } from './config';
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk';

type FullGame = {
  publicKey: PublicKey;
  account: IdlAccounts<Multiplayer>['game'];
};

export default function Jackpot() {
  const { provider: gambaProvider } = useGambaContext();
  const anchorProvider: AnchorProvider | null = gambaProvider?.anchorProvider ?? null;

  const [game, setGame]       = useState<FullGame | null>(null);
  const [loading, setLoading] = useState(false);

  const loadGame = async () => {
    if (!anchorProvider) return;
    setLoading(true);
    try {
      const list = await fetchSpecificGames(
        anchorProvider,
        DESIRED_CREATOR,
        DESIRED_MAX_PLAYERS
      );
      setGame(list[0] ?? null);
    } catch (err) {
      console.error(err);
      setGame(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGame();
  }, [anchorProvider]);

  if (loading) {
    return (
      <GambaUi.Portal target="screen">
        <p style={{ color: '#fff', textAlign: 'center' }}>Loading Jackpot…</p>
      </GambaUi.Portal>
    );
  }

  if (!game) {
    return (
      <GambaUi.Portal target="screen">
        <p style={{ color: '#fff', textAlign: 'center' }}>No active Jackpot game found.</p>
      </GambaUi.Portal>
    );
  }

  const { account } = game;
  const status: 'waiting' | 'live' | 'settled' =
    account.state.waiting
      ? 'waiting'
      : account.state.settled
      ? 'settled'
      : 'live';

  return (
    <GambaUi.Portal target="screen">
      <S.Container>
        <S.Title>Game #{account.gameId.toString()}</S.Title>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <S.Badge status={status}>
            {status === 'waiting'
              ? 'Waiting'
              : status === 'live'
              ? 'Live'
              : 'Settled'}
          </S.Badge>
        </div>

        <S.List>
          <S.Item>
            <strong>Players:</strong> {account.players.length} / {account.maxPlayers}
          </S.Item>
          <S.Item>
            <strong>Wager:</strong> {account.wager.toString()}
          </S.Item>
          <S.Item>
            <strong>Target Winners:</strong> {account.winnersTarget}
          </S.Item>
          <S.Item>
            <strong>Mint:</strong>{' '}
            <code title={account.mint.toBase58()}>
              {account.mint.toBase58().slice(0, 4) + '…' + account.mint.toBase58().slice(-4)}
            </code>
          </S.Item>
        </S.List>
      </S.Container>
    </GambaUi.Portal>
  );
}
