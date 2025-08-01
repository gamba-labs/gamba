// src/components/DebugGameScreen.tsx
import React, { useState, useCallback } from 'react';
import { Keypair, PublicKey } from '@solana/web3.js';
import { GambaUi }            from 'gamba-react-ui-v2';
import Board                  from './Board';

// purely local – never used on-chain
function randomPk(): PublicKey {
  return Keypair.generate().publicKey;
}

export default function DebugGameScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const [count,  setCount ] = useState(5);
  const [winner, setWinner] = useState(0);
  const [you,    setYou   ] = useState(0);        // which ball is “you”
  const [players,   setPlayers]   = useState<PublicKey[]>([]);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);

  const [seedInput, setSeedInput] = useState('');
  const [gamePk,    setGamePk]    = useState<string | null>(null);

  const [gameOver, setGameOver] = useState(false);

  /** spawn dummy players & pick seed */
  const start = useCallback(() => {
    const n = Math.max(1, Math.min(20, count));
    const youClamped = Math.max(0, Math.min(n - 1, you));
    setYou(youClamped);

    setPlayers(Array.from({ length: n }, randomPk));
    setWinnerIdx(Math.max(0, Math.min(n - 1, winner)));

    const seed = seedInput.trim() || Keypair.generate().publicKey.toBase58();
    setGamePk(seed);

    setGameOver(false);
  }, [count, winner, you, seedInput]);

  return (
    <>
      {/* only show these inputs when NOT in a race */}
      {players.length === 0 && (
        <div style={{ padding: 12 }}>
          <h2>🐞 Debug Simulator</h2>
          <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
            <label>
              Balls:&nbsp;
              <input
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={e => setCount(+e.target.value)}
              />
            </label>

            <label>
              Winner idx:&nbsp;
              <input
                type="number"
                min={0}
                value={winner}
                onChange={e => setWinner(+e.target.value)}
              />
            </label>

            <label>
              You idx:&nbsp;
              <input
                type="number"
                min={0}
                max={Math.max(0, count - 1)}
                value={you}
                onChange={e => setYou(+e.target.value)}
              />
            </label>

            <label>
              Seed:&nbsp;
              <input
                type="text"
                placeholder="optional Base58 seed"
                value={seedInput}
                onChange={e => setSeedInput(e.target.value)}
                style={{ width: 200 }}
              />
            </label>

            <button onClick={start}>Run race</button>
          </div>
        </div>
      )}

      {/* once players & seed are set, show the board */}
      {players.length > 0 && gamePk && (
        <Board
          players          ={players}
          winnerIdx        ={winnerIdx}
          youIndexOverride ={you}
          gamePk           ={gamePk}
          onFinished       ={() => setGameOver(true)}
        />
      )}

      {/* back-to-lobby in Gamba controls bar */}
      <GambaUi.Portal target="controls">
        {players.length > 0 && gameOver && (
          <button
            onClick={onBack}
            style={{
              padding     : '8px 16px',
              marginRight : 12,
              fontWeight  : 600,
              background  : '#222',
              color       : '#fff',
              border      : 'none',
              borderRadius: 6,
              cursor      : 'pointer',
            }}
          >
            ← Back to lobby
          </button>
        )}
      </GambaUi.Portal>
    </>
  );
}
