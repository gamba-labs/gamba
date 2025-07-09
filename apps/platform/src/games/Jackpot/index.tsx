// src/games/Jackpot/index.tsx
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AnchorProvider, IdlAccounts } from '@coral-xyz/anchor';
import { GambaUi } from 'gamba-react-ui-v2';
import { useGambaContext } from 'gamba-react-v2';
import {
  fetchSpecificGames,
  getProgram,
} from '@gamba-labs/multiplayer-sdk';
import JoinGame from './instructions/JoinGame';
import LeaveGame from './instructions/LeaveGame';
import WinnerReveal from './WinnerReveal';
import * as S from './styles';
import {
  DESIRED_CREATOR,
  DESIRED_MAX_PLAYERS,
} from './config';
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk';

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
    [gambaProvider]
  );

  const walletKey = anchorProvider?.wallet?.publicKey ?? null;

  const [game, setGame]         = useState<FullGame | null>(null);
  const [liveAcct, setLiveAcct] = useState<FullGame['account'] | null>(null);
  const [loading, setLoading]   = useState(false);

  /** 1) Fetch the one “active” jackpot game */
  const loadGame = useCallback(async () => {
    if (!anchorProvider) return;
    setLoading(true);
    try {
      const list = await fetchSpecificGames(
        anchorProvider,
        DESIRED_CREATOR,
        DESIRED_MAX_PLAYERS
      );
      const top = list[0] ?? null;
      setGame(top);
      setLiveAcct(top?.account ?? null);
    } catch (err) {
      console.error('fetchSpecificGames failed', err);
      setGame(null);
      setLiveAcct(null);
    } finally {
      setLoading(false);
    }
  }, [anchorProvider]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  /** 2) Subscribe + detect closure/settlement */
  useEffect(() => {
    if (!anchorProvider || !game) return;
    const conn    = anchorProvider.connection;
    const program = getProgram(anchorProvider);
    const coder   = program.coder.accounts;

    const subId = conn.onAccountChange(
      game.publicKey,
      info => {
        // closed on‐chain → go find the next one immediately
        if (info === null || info.data.length === 0) {
          loadGame();
          return;
        }
        try {
          const decoded = coder.decode<'game'>('game', info.data);
          setLiveAcct(decoded);
          if ((decoded.state as any).settled) {
            // let distribution hit, then fetch the next game
            setTimeout(loadGame, 2000);
          }
        } catch {
          // ignore decode errors
        }
      },
      'confirmed'
    );

    return () => conn.removeAccountChangeListener(subId);
  }, [anchorProvider, game, loadGame]);

  /** 3) Have *you* joined? */
  const youJoined = useMemo(() => {
    if (!liveAcct || !walletKey) return false;
    return liveAcct.players.some(p => p.user.equals(walletKey));
  }, [liveAcct, walletKey]);

  /** 4) Countdown (reset on PDA change) */
  const initialLeftMsRef = useRef(0);
  const [leftMs, setLeftMs] = useState(0);
  const softTs = liveAcct
    ? Number(liveAcct.softExpirationTimestamp) * 1000
    : 0;

  useEffect(() => {
    if (!softTs || !game) return;
    const now     = Date.now();
    const initial = Math.max(softTs - now, 0);
    initialLeftMsRef.current = initial;
    setLeftMs(initial);

    let handle: number;
    if (initial > 0) {
      handle = window.setInterval(() => {
        setLeftMs(Math.max(softTs - Date.now(), 0));
      }, 1000);
    }
    return () => {
      if (handle) window.clearInterval(handle);
    };
    // only when softTs or game key changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [softTs, game?.publicKey.toBase58()]);

  /** 5) Compute your win‐chance % */
  const yourChance = useMemo(() => {
    if (!youJoined || !walletKey || !liveAcct) return 0;
    const yours = liveAcct.players.find(p => p.user.equals(walletKey))
      ?.wager.toNumber() ?? 0;
    const total = liveAcct.players.reduce(
      (sum, p) => sum + p.wager.toNumber(),
      0
    );
    return total > 0 ? (yours / total) * 100 : 0;
  }, [liveAcct, youJoined, walletKey]);

  /** Format lamports → SOL */
  const fmtSOL = (lamports: number) =>
    (lamports / LAMPORTS_PER_SOL).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /** ◉ 6) Poll for a new game every 5s if none is active or last one settled */
  useEffect(() => {
    if (!anchorProvider) return;
    // start polling only when we have no live game or it's in the settled state
    if (!liveAcct || liveAcct.state.settled) {
      const id = window.setInterval(loadGame, 5000);
      return () => window.clearInterval(id);
    }
  }, [anchorProvider, liveAcct, loadGame]);

  return (
    <GambaUi.Portal target="screen">
      <S.Container>
        {loading && <p style={{ textAlign: 'center' }}>Loading…</p>}
        {!loading && !liveAcct && (
          <p style={{ textAlign: 'center' }}>No game found.</p>
        )}

        {liveAcct && game && (
          <>
            <S.Header>
              <div>
                <S.Title>Game #{liveAcct.gameId.toString()}</S.Title>
                {youJoined && <S.YouBadge>YOU</S.YouBadge>}
              </div>
              <S.Badge
                status={
                  liveAcct.state.waiting
                    ? 'waiting'
                    : liveAcct.state.settled
                    ? 'settled'
                    : 'live'
                }
              >
                {liveAcct.state.waiting
                  ? 'Waiting'
                  : liveAcct.state.settled
                  ? 'Settled'
                  : 'Live'}
              </S.Badge>
            </S.Header>

            {/* countdown */}
            {initialLeftMsRef.current > 0 && (
              <S.TimerSection>
                <S.TimerBar>
                  <S.TimerProgress
                    style={{
                      width: `${
                        ((initialLeftMsRef.current - leftMs) /
                          initialLeftMsRef.current) *
                        100
                      }%`,
                    }}
                  />
                </S.TimerBar>
                <S.TimerText>
                  {`${Math.floor(leftMs / 60000)
                    .toString()
                    .padStart(2, '0')}:${Math
                    .floor((leftMs % 60000) / 1000)
                    .toString()
                    .padStart(2, '0')}`}
                </S.TimerText>
              </S.TimerSection>
            )}

            {/* winner animation */}
            {liveAcct.state.settled && (
              <WinnerReveal
                players={liveAcct.players}
                winnerIndexes={liveAcct.winnerIndexes.map((w: any) => Number(w))}
              />
            )}

            <S.List>
              <S.Item>
                <strong>Players:</strong> {liveAcct.players.length}/
                {liveAcct.maxPlayers}
              </S.Item>
              <S.Item>
                <strong>Wager:</strong> {fmtSOL(liveAcct.wager.toNumber())} SOL
              </S.Item>
              {youJoined && (
                <S.Item>
                  <strong>Your chance:</strong> {yourChance.toFixed(1)}%
                </S.Item>
              )}
            </S.List>

            <S.Actions>
              {!youJoined ? (
                <JoinGame pubkey={game.publicKey} account={liveAcct} />
              ) : (
                <LeaveGame pubkey={game.publicKey} account={liveAcct} />
              )}
            </S.Actions>
          </>
        )}
      </S.Container>
    </GambaUi.Portal>
  );
}
