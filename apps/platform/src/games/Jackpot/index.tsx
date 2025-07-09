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

  const [games, setGames]     = useState<FullGame[]>([]);
  const [loading, setLoading] = useState(false);

  const doRefresh = async () => {
    if (!anchorProvider) return;
    setLoading(true);
    try {

      // 2) Pull only the ones matching your creator + maxPlayers
      const specific = await fetchSpecificGames(
        anchorProvider,
        DESIRED_CREATOR,
        DESIRED_MAX_PLAYERS
      );
      console.log('🎯 fetchSpecificGames → jackpot games:', specific);

      // Show the filtered list in your UI:
      setGames(specific);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    doRefresh();
  }, [anchorProvider]);

  return (
    <>
      <GambaUi.Portal target="screen">
        <S.Container>
          <S.Title>Jackpot Games</S.Title>
          {loading && <p>Loading games…</p>}
          {!loading && games.length === 0 && (
            <p>No Jackpot games found.</p>
          )}
          <S.List>
            {games.map((g) => (
              <S.Item key={g.publicKey.toBase58()}>
                🎲 Game #{g.account.gameId.toString()}
              </S.Item>
            ))}
          </S.List>
        </S.Container>
      </GambaUi.Portal>

      <GambaUi.Portal target="controls">
        <GambaUi.Button onClick={doRefresh} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </GambaUi.Button>
      </GambaUi.Portal>
    </>
  );
}
