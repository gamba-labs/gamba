// src/components/GameScreen.tsx
import React, { useEffect, useState } from 'react';
import { PublicKey }                   from '@solana/web3.js';
import { useWallet }                   from '@solana/wallet-adapter-react';
import { useGame }                     from 'gamba-react-v2';
import { GambaUi, Multiplayer }        from 'gamba-react-ui-v2';  // ← import namespace

import Board                           from './Board';

export default function GameScreen({
  pk,
  onBack,
}: {
  pk: PublicKey;
  onBack: () => void;
}) {
  // 1️⃣ subscribe to on-chain game & metadata
  const { game: chainGame, metadata } = useGame(pk, { fetchMetadata: true });
  const { publicKey } = useWallet();

  // 2️⃣ snapshot once settled
  const [snapPlayers, setSnapPlayers] = useState<PublicKey[] | null>(null);
  const [snapWinner,  setSnapWinner]  = useState<number     | null>(null);
  const [snapPayouts, setSnapPayouts] = useState<number[]   | null>(null);
  const [replayDone,  setReplayDone]  = useState(false);

  useEffect(() => {
    if (!chainGame?.state.settled || snapPlayers) return;
    const w = Number(chainGame.winnerIndexes[0]);
    setSnapPlayers(chainGame.players.map(p => p.user));
    setSnapWinner(w);
    setSnapPayouts(chainGame.players.map(p =>
      Number((p as any).pendingPayout ?? (p as any).pending_payout ?? 0)
    ));
  }, [chainGame, snapPlayers]);

  // 3️⃣ if settled with zero players, skip replay immediately
  useEffect(() => {
    if (snapPlayers && snapPlayers.length === 0) {
      setReplayDone(true);
    }
  }, [snapPlayers]);

  // 4️⃣ countdown before settlement
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    if (!chainGame?.softExpirationTimestamp) return;
    const end = Number(chainGame.softExpirationTimestamp) * 1000;
    const tick = () => setTimeLeft(Math.max(end - Date.now(), 0));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [chainGame?.softExpirationTimestamp]);

  // 5️⃣ derive waiting vs settled
  const waiting        = snapPlayers === null;
  const boardPlayers   = waiting
    ? (chainGame?.players.map(p => p.user) || [])
    : snapPlayers!;
  const boardWinnerIdx = waiting ? null : snapWinner;
  const boardPayouts   = waiting ? undefined : snapPayouts!;

  // 6️⃣ format mm:ss
  const formatTime = (ms: number) => {
    const tot = Math.ceil(ms / 1000);
    const m   = Math.floor(tot / 60);
    const s   = tot % 60;
    return `${m}:${s.toString().padStart(2,'0')}`;
  };

  return (
    <>
      {/* ► Always render the board, now with metadata */}
      <Board
        players    ={boardPlayers}
        winnerIdx  ={boardWinnerIdx}
        gamePk     ={pk.toBase58()}
        payouts    ={boardPayouts}
        metadata   ={metadata}                // ◄ pass the on-chain name map
        onFinished ={!waiting ? () => setReplayDone(true) : undefined}
      />

      {/* ► Top-right status + countdown */}
      <div style={{
        position:'absolute', top:12, right:12, zIndex:200, textAlign:'right',
      }}>
        <div style={{
          display:'inline-block',
          background:'rgba(0,0,0,0.6)',
          color:'#fff', padding:'4px 8px',
          borderRadius:4, fontSize:12,
          textTransform:'uppercase',
        }}>
          {waiting ? 'Waiting' : (!replayDone ? 'Playing' : 'Settled')}
        </div>
        {waiting && timeLeft > 0 && (
          <div style={{marginTop:4, color:'#fff', fontSize:12}}>
            Starts in {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* ► Gamba controls */}
      <GambaUi.Portal target="controls">
        {waiting && chainGame?.state.waiting && (
          publicKey && !chainGame.players.some(p => p.user.equals(publicKey))
            ? (
              <Multiplayer.JoinGame
                pubkey={pk}
                account={chainGame}
                onTx={() => {}}
              />
            )
            : (
              <Multiplayer.EditBet
                pubkey={pk}
                account={chainGame}
                onComplete={() => {}}
              />
            )
        )}

        {!waiting && replayDone && (
          <button
            onClick={onBack}
            style={{
              padding:'8px 16px', marginRight:12,
              fontWeight:600, background:'#222',
              color:'#fff', border:'none',
              borderRadius:6, cursor:'pointer',
            }}
          >
            ← Back to lobby
          </button>
        )}
      </GambaUi.Portal>
    </>
  );
}
