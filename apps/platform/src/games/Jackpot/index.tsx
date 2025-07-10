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
import { fetchSpecificGames, getProgram } from '@gamba-labs/multiplayer-sdk';
import JoinGame from './instructions/JoinGame';
import LeaveGame from './instructions/LeaveGame';
import EditBet from './instructions/EditBet';
import WinnerReveal from './WinnerReveal';
import PlayersList from './PlayersList';
import * as S from './styles';
import { DESIRED_CREATOR, DESIRED_MAX_PLAYERS } from './config';
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

  /** 1) Fetch active jackpot game */
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
        // account closed on-chain → this game is gone
        if (!info || info.data.length === 0) {
          setGame(null);
          setLiveAcct(null);
          return;
        }
        try {
          const decoded = coder.decode<'game'>('game', info.data);
          setLiveAcct(decoded);
        } catch {
          // ignore decode errors
        }
      },
      'confirmed'
    );
    return () => conn.removeAccountChangeListener(subId);
  }, [anchorProvider, game]);

  /** 3) Have you joined? */
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
    return () => window.clearInterval(handle);
  }, [softTs, game?.publicKey.toBase58()]);

  /** 5) Compute your win-chance % */
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

  /** 6) Poll every 5 s *only* when there’s no active game */
  useEffect(() => {
    if (!anchorProvider) return;
    if (game === null) {
      const id = window.setInterval(loadGame, 5000);
      return () => window.clearInterval(id);
    }
  }, [anchorProvider, game, loadGame]);

  // total pot in lamports
  const totalPotLamports = liveAcct
    ? liveAcct.players.reduce((sum, p) => sum + p.wager.toNumber(), 0)
    : 0;

  const waiting = liveAcct?.state.waiting ?? false;

  return (
    <>
      {/* —————— Main “screen” portal —————— */}
      <GambaUi.Portal target="screen">
        <S.Container>
          {loading && <p style={{ textAlign: 'center' }}>Loading…</p>}
          {!loading && game === null && (
            <p style={{ textAlign: 'center' }}>WAiting for game.</p>
          )}

          {liveAcct && game && (
            <>
              <S.Header>
                <S.Title>Game #{liveAcct.gameId.toString()}</S.Title>
                <S.Badge
                  status={
                    waiting
                      ? 'waiting'
                      : liveAcct.state.settled
                      ? 'settled'
                      : 'live'
                  }
                >
                  {waiting
                    ? 'Waiting'
                    : liveAcct.state.settled
                    ? 'Settled'
                    : 'Live'}
                </S.Badge>
              </S.Header>

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
                    {`${String(Math.floor(leftMs / 60000)).padStart(2,'0')}:${String(
                      Math.floor((leftMs % 60000)/1000)
                    ).padStart(2,'0')}`}
                  </S.TimerText>
                </S.TimerSection>
              )}

              {liveAcct.state.settled && (
                <WinnerReveal
                  players={liveAcct.players}
                  winnerIndexes={liveAcct.winnerIndexes.map((w: any) => Number(w))}
                />
              )}

              <S.Pot>
                <span>Total Pot</span>
                <S.PotValue>
                  {fmtSOL(totalPotLamports)} SOL
                </S.PotValue>
              </S.Pot>

              <S.List>
                <S.Item>
                  <strong>Your chance:</strong>{' '}
                  {youJoined ? `${yourChance.toFixed(1)}%` : '—'}
                </S.Item>
              </S.List>

              <PlayersList
                players={[...liveAcct.players].reverse()}
                isTeamGame={!!liveAcct.gameType.team}
                numTeams={liveAcct.numTeams}
                walletKey={walletKey}
              />
            </>
          )}
        </S.Container>
      </GambaUi.Portal>

      {/* —————— Controls portal —————— */}
      <GambaUi.Portal target="controls">
        {!youJoined && liveAcct && game && waiting && (
          <JoinGame pubkey={game.publicKey} account={liveAcct} />
        )}
        {youJoined && liveAcct && game && waiting && (
          <>
            <EditBet
              pubkey={game.publicKey}
              account={liveAcct}
              onComplete={loadGame}
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
