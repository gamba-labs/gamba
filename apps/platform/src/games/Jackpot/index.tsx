import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AnchorProvider, IdlAccounts } from '@coral-xyz/anchor';
import { GambaUi } from 'gamba-react-ui-v2';
import { useGambaContext } from 'gamba-react-v2';
import {
  fetchSpecificGames,
  getProgram,
} from '@gamba-labs/multiplayer-sdk';
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk';

import JoinGame from './instructions/JoinGame';
import LeaveGame from './instructions/LeaveGame';
import EditBet from './instructions/EditBet';
import { Countdown } from './Countdown';
import { Pot } from './Pot';
import { WinnerAnimation } from './WinnerAnimation';
import { Coinfalls } from './Coinfall';
import { TopPlayers } from './TopPlayers';
import { RecentPlayers } from './RecentPlayers';
import { RecentGames } from './RecentGames';
import { Waiting } from './Waiting';
import { DESIRED_CREATOR, DESIRED_MAX_PLAYERS } from './config';
import * as S from './Jackpot.styles';

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  return matches;
};

type FullGame = {
  publicKey: PublicKey;
  account: IdlAccounts<Multiplayer>['game'];
};

export default function Jackpot() {
  const { provider: gambaProvider } = useGambaContext();
  const anchorProvider: AnchorProvider | null = useMemo(
    () =>
      gambaProvider
        ? (gambaProvider.anchorProvider as AnchorProvider)
        : null,
    [gambaProvider],
  );
  const walletKey = anchorProvider?.wallet?.publicKey ?? null;
  const isSmallScreen = useMediaQuery('(max-width: 900px)');

  const [game, setGame] = useState<FullGame | null>(null);
  const [liveAcct, setLiveAcct] = useState<FullGame['account'] | null>(null);
  const [loading, setLoading] = useState(false);

  const loadGame = useCallback(async () => {
    if (!anchorProvider) return;
    setLoading(true);
    try {
      const list = await fetchSpecificGames(anchorProvider, DESIRED_CREATOR, DESIRED_MAX_PLAYERS);
      const top = list[0] ?? null;
      setGame(top);
      setLiveAcct(top?.account ?? null);
    } finally {
      setLoading(false);
    }
  }, [anchorProvider]);

  useEffect(() => { loadGame(); }, [loadGame]);

  useEffect(() => {
    if (!anchorProvider || !game) return;
    const conn = anchorProvider.connection;
    const program = getProgram(anchorProvider);
    const coder = program.coder.accounts;
    const subId = conn.onAccountChange(
      game.publicKey,
      (info) => {
        if (!info || info.data.length === 0) {
          setGame(null);
          setLiveAcct(null);
          return;
        }
        try {
          const decoded = coder.decode<'game'>('game', info.data);
          setLiveAcct(decoded);
        } catch { /* ignore */ }
      },
      'confirmed',
    );
    return () => conn.removeAccountChangeListener(subId);
  }, [anchorProvider, game]);

  const youJoined = useMemo(() => {
    if (!liveAcct || !walletKey) return false;
    return liveAcct.players.some((p) => p.user.equals(walletKey));
  }, [liveAcct, walletKey]);

  useEffect(() => {
    if (anchorProvider && game === null) {
      const id = window.setInterval(loadGame, 5000);
      return () => window.clearInterval(id);
    }
  }, [anchorProvider, game, loadGame]);

  const totalPotLamports = liveAcct?.players.reduce((sum, p) => sum + p.wager.toNumber(), 0) ?? 0;
  const waiting = liveAcct?.state.waiting ?? false;
  const players = liveAcct?.players ?? [];

  return (
    <>
      <GambaUi.Portal target="screen">
        <S.ScreenLayout>
          <S.PageLayout>
            {!isSmallScreen && (
              <S.TopPlayersSidebar>
                {liveAcct && <TopPlayers players={players} totalPot={totalPotLamports} />}
              </S.TopPlayersSidebar>
            )}

            <S.GameContainer>
              {liveAcct && <Coinfalls players={players} />}
              {isSmallScreen && liveAcct && players.length > 0 && (
                <S.TopPlayersOverlay>
                  <TopPlayers players={players} totalPot={totalPotLamports} isOverlay />
                </S.TopPlayersOverlay>
              )}
              <S.MainContent>
                {loading && <S.Loading>Loading...</S.Loading>}
                {!loading && !game && <Waiting />}
                {liveAcct && game && (
                  <>
                    <S.Header>
                      <S.Title>Fresh #{liveAcct.gameId.toString()}</S.Title>
                      <S.Badge status={waiting ? 'waiting' : liveAcct.state.settled ? 'settled' : 'live'}>
                        {waiting ? 'Waiting' : liveAcct.state.settled ? 'Settled' : 'Live'}
                      </S.Badge>
                    </S.Header>
                    <Countdown softExpiration={Number(liveAcct.softExpirationTimestamp) * 1000} onComplete={() => {}} />
                    {liveAcct.state.settled && <WinnerAnimation players={players} winnerIndexes={liveAcct.winnerIndexes.map(Number)} />}
                    <Pot totalPot={totalPotLamports / LAMPORTS_PER_SOL} />
                  </>
                )}
              </S.MainContent>
            </S.GameContainer>

            {!isSmallScreen && liveAcct && (
              <S.RecentGamesSidebar>
                <RecentGames />
              </S.RecentGamesSidebar>
            )}
          </S.PageLayout>

          {liveAcct && (
            <S.RecentPlayersContainer>
              <RecentPlayers players={players} />
            </S.RecentPlayersContainer>
          )}
        </S.ScreenLayout>
      </GambaUi.Portal>

      <GambaUi.Portal target="controls">
       {!youJoined && liveAcct && game && waiting && (
          <JoinGame pubkey={game.publicKey} account={liveAcct} />
        )}
        {youJoined && liveAcct && game && waiting && (
          <>
            <EditBet
              pubkey={game.publicKey}
              account={liveAcct}
              // onComplete={loadGame} <- REMOVED THIS LINE
            />
            <LeaveGame
              pubkey={game.publicKey}
              account={liveAcct}
              onTx={loadGame}
            />
          </>
        )}
        {youJoined && liveAcct && game && !waiting && (
          <LeaveGame
            pubkey={game.publicKey}
            account={liveAcct}
            onTx={loadGame}
          />
        )}
      </GambaUi.Portal>
    </>
  );
}