// src/components/Board.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { GambaUi }        from 'gamba-react-ui-v2';
import { PublicKey }      from '@solana/web3.js';
import { useWallet }      from '@solana/wallet-adapter-react';

import { useMultiPlinko } from '../hooks/useMultiPlinko';
import { WIDTH, HEIGHT }  from '../engine';
import { PlayerInfo }     from '../engine/types';
import Scoreboard         from './Scoreboard'; // updated import

const COLORS = [
  '#ff9aa2','#ffb7b2','#ffdac1',
  '#e2f0cb','#b5ead7','#c7ceea',
];

export default function Board({
  players,
  winnerIdx,
  targetPoints = 100,
  onFinished,
}: {
  players      : PublicKey[];
  winnerIdx    : number | null;
  targetPoints?: number;
  onFinished?  : () => void;
}) {
  const wallet = useWallet();

  // 1️⃣ Build a stable roster of {id,color}
  const roster: PlayerInfo[] = useMemo(() => {
    return players.map((p,i) => ({
      id:    p.toBase58(),
      color: COLORS[i % COLORS.length],
    }));
  }, [players]);

  // 2️⃣ Hook up simulation engine
  const { engine, recordRace, replayRace } = useMultiPlinko(14, roster);

  // 3️⃣ Score & crossing state
  const [scores,    setScores]    = useState<number[]>([]);
  const [crossings, setCrossings] = useState<number[][]>([]);
  const [finished,  setFinished]  = useState(false);

  // Whenever the roster changes (players join/leave), reset scores + crossings
  useEffect(() => {
    setScores(Array(roster.length).fill(0));
    setCrossings(roster.map(() => []));
    setFinished(false);
  }, [roster]);

  // 4️⃣ When finished flips, notify parent
  useEffect(() => {
    if (finished && onFinished) onFinished();
  }, [finished, onFinished]);

  // 5️⃣ Run simulation once we have a winnerIdx
  useEffect(() => {
    if (winnerIdx == null || !engine) return;

    const rec = recordRace(winnerIdx, targetPoints);
    setCrossings(rec.crossings);
    setFinished(false);

    const timers: number[] = [];
    rec.crossings.forEach((frames,i) =>
      frames.forEach(frame => {
        timers.push(window.setTimeout(() => {
          setScores(prev => {
            const next = [...prev];
            next[i] += 50;
            return next;
          });
        }, frame * 16));
      })
    );

    // mark finished after replay
    const totalFrames = rec.paths[0].length / 2;
    timers.push(window.setTimeout(() => setFinished(true), totalFrames * 16 + 200));

    replayRace(rec);
    return () => timers.forEach(clearTimeout);
  }, [engine, winnerIdx, targetPoints, recordRace, replayRace]);

  return (
    <>
      <GambaUi.Canvas render={({ ctx, size }) => {
        if (!engine) return;
        ctx.clearRect(0,0,size.width,size.height);
        ctx.fillStyle = '#0b0b13';
        ctx.fillRect(0,0,size.width,size.height);

        const bodies = engine.getBodies();
        const s      = Math.min(size.width/WIDTH, size.height/HEIGHT);

        ctx.save();
        ctx.translate(
          (size.width  - WIDTH  * s)/2,
          (size.height - HEIGHT * s)/2
        );
        ctx.scale(s,s);

        // draw finish line
        const square = 20;
        for (let x=0; x<WIDTH; x+=square) {
          ctx.fillStyle = (x/square)%2 ? '#000' : '#fff';
          ctx.fillRect(x, HEIGHT-square, square, square);
        }

        // draw bodies
        bodies.forEach(b => {
          ctx.beginPath();
          b.vertices.forEach((v,i)=>
            i===0 ? ctx.moveTo(v.x,v.y) : ctx.lineTo(v.x,v.y)
          );
          ctx.closePath();

          if (b.label==='Peg')      ctx.fillStyle='#666';
          else if (b.label==='Ball')
            ctx.fillStyle=roster[b.plugin.playerIndex!].color;
          else                     ctx.fillStyle='#999';

          ctx.fill();
        });

        ctx.restore();
      }}/>
      
      {/* ← NEW: pass roster, scores, crossings into Scoreboard */}
      <Scoreboard
        roster      ={roster}
        scores      ={scores}
        targetPoints={targetPoints}
        crossings   ={crossings}
      />
    </>
  );
}
