// src/components/DebugGameScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Keypair, PublicKey } from '@solana/web3.js';
import { GambaUi, useSound }  from 'gamba-react-ui-v2';
import Board                  from '../board/Board';
import lobbymusicSnd          from '../sounds/lobby.mp3';
import actionSnd              from '../sounds/action.mp3';
import {
  musicManager,
  attachMusic,
  stopAndDispose,
} from '../musicManager';

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

  // treat "waiting" like GameScreen: before a race has started
  const waiting = players.length === 0;

  // claim & release the lobby music while this screen is active
  useEffect(() => {
    // cancel any pending stop
    clearTimeout(musicManager.timer);
    // bump claim count
    musicManager.count += 1;
    return () => {
      musicManager.count -= 1;
      if (musicManager.count === 0) {
        musicManager.timer = setTimeout(stopAndDispose, 200);
      }
    };
  }, []);

  // ensure lobby music is playing when entering debug screen (if not already)
  const { play: playLobby, sounds: lobbySounds } = useSound(
    { lobby: lobbymusicSnd },
    { disposeOnUnmount: false },
  );
  useEffect(() => {
    if (!musicManager.sound) {
      const snd = lobbySounds.lobby;
      if (snd) {
        snd.player.loop = true;
        const startWhenReady = () => {
          if (snd.ready) {
            playLobby('lobby');
            attachMusic(snd);
          } else {
            setTimeout(startWhenReady, 100);
          }
        };
        startWhenReady();
      }
    }
  }, [lobbySounds, playLobby]);

  // when game starts (not waiting), stop lobby and play action music loop
  const { play: playAction, sounds: actionSounds } = useSound(
    { action: actionSnd },
    { disposeOnUnmount: false },
  );
  useEffect(() => {
    if (!waiting) {
      try { musicManager.sound?.player.stop(); } catch {}
      const snd = actionSounds.action;
      if (snd) {
        snd.player.loop = true;
        const startWhenReady = () => {
          if (snd.ready) {
            playAction('action');
            attachMusic(snd);
          } else {
            setTimeout(startWhenReady, 100);
          }
        };
        startWhenReady();
      }
    }
  }, [waiting, actionSounds, playAction]);

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
