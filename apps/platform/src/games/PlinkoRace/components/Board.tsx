// src/components/Board.tsx
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { GambaUi } from 'gamba-react-ui-v2';
import { PublicKey } from '@solana/web3.js';

import { useMultiPlinko } from '../hooks/useMultiPlinko';
import {
  WIDTH, HEIGHT,
  BUCKET_DEFS, BUCKET_HEIGHT,
} from '../engine/PhysicsWorld';
import { PlayerInfo, RecordedRace } from '../engine/types';
import Scoreboard from './Scoreboard';

const COLORS = ['#ff9aa2', '#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7', '#c7ceea'];
const SPEED_FACTOR = 4;
// match visual radius to physics BALL_RADIUS (13px)
const BALL_VIS_RADIUS = 13;

type Particle = {
  x: number; y: number; size: number; opacity: number; life: number;
  vx: number; vy: number;
};

export default function Board({
  players, winnerIdx, gamePk,
  targetPoints = 50, onFinished,
}: {
  players: PublicKey[];
  winnerIdx: number | null;
  gamePk: string;
  targetPoints?: number;
  onFinished?: () => void;
}) {
  const roster: PlayerInfo[] = useMemo(
    () => players.map((p, i) => ({
      id: p.toBase58(),
      color: COLORS[i % COLORS.length],
    })),
    [players]
  );

  const { engine, recordRace, replayRace } = useMultiPlinko(roster, gamePk);
  const [scores, setScores] = useState<number[]>([]);
  const [mults, setMults] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const bucketAnim = useRef<Record<number, number>>({});
  const particles = useRef<Particle[]>([]).current;

  useEffect(() => {
    setScores(Array(roster.length).fill(0));
    setMults(Array(roster.length).fill(1));
    setFinished(false);
    bucketAnim.current = {};
    particles.length = 0;
  }, [roster]);

  useEffect(() => {
    if (finished && onFinished) onFinished();
  }, [finished, onFinished]);

  useEffect(() => {
    if (winnerIdx == null || !engine) return;
    const rec: RecordedRace = recordRace(winnerIdx, targetPoints);
    const events = [...rec.events];
    const runMults = Array(roster.length).fill(1);

    replayRace(rec, frame => {
      while (events.length && events[0].frame === frame) {
        const e = events.shift()!;
        const bw = WIDTH / BUCKET_DEFS.length;
        const coarse = Math.floor(e.frame / SPEED_FACTOR);
        const path = rec.paths[e.player];
        const cx = path[coarse * 2] || 0;
        const bi = Math.max(0, Math.min(BUCKET_DEFS.length - 1, Math.floor(cx / bw)));
        bucketAnim.current[bi] = 1;

        if (e.kind === 'mult') {
          runMults[e.player] = Math.min(runMults[e.player] * e.value, 64);
          setMults(m => { const n = [...m]; n[e.player] = runMults[e.player]; return n; });
        } else {
          setScores(s => { const n = [...s]; n[e.player] += e.value; return n; });
          runMults[e.player] = 1;
          setMults(m => { const n = [...m]; n[e.player] = 1; return n; });
        }
      }
      if (frame === rec.totalFrames - 1) setFinished(true);
    });
  }, [engine, winnerIdx, targetPoints, recordRace, replayRace, roster, particles]);

  return (
    <>
      <GambaUi.Canvas render={({ ctx, size }) => {
        if (!engine) return;
        // clear
        ctx.clearRect(0, 0, size.width, size.height);
        ctx.fillStyle = '#0b0b13';
        ctx.fillRect(0, 0, size.width, size.height);

        // fit world
        const s = Math.min(size.width / WIDTH, size.height / HEIGHT);
        ctx.save();
        ctx.translate((size.width - WIDTH*s)/2, (size.height - HEIGHT*s)/2);
        ctx.scale(s, s);

        // particles behind everything
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life -= 1;
          if (p.life <= 0) { particles.splice(i, 1); continue; }
          p.x += p.vx; p.y += p.vy;
          p.opacity *= 0.96; p.size *= 0.98;
          ctx.fillStyle = `rgba(255,180,0,${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
          ctx.fill();
        }

        // ─── Buckets & Glow ───────────────────────────────────
        {
          const bw = WIDTH / BUCKET_DEFS.length;
          BUCKET_DEFS.forEach((v, i) => {
            let anim = bucketAnim.current[i] || 0;
            if (anim > 0) bucketAnim.current[i] = anim * 0.85;
            anim = bucketAnim.current[i] || 0;
            if (anim > 0.02) {
              const topY = HEIGHT - BUCKET_HEIGHT*2;
              const glowH = BUCKET_HEIGHT;
              const cx = i*bw + bw/2;
              const by = HEIGHT - BUCKET_HEIGHT;
              const grad = ctx.createRadialGradient(
                cx, by, bw*0.1,
                cx, by - glowH, bw*1.5
              );
              const hue = v>1 ? 120 : v<0 ? 220 : 30;
              grad.addColorStop(0,   `hsla(${hue},80%,${70+anim*20}%,${0.4*anim})`);
              grad.addColorStop(0.6, `hsla(${hue},60%,60%,${0.1*anim})`);
              grad.addColorStop(1,   'rgba(0,0,0,0)');
              ctx.fillStyle = grad;
              ctx.fillRect(i*bw, topY, bw, glowH);
            }
            const hue = v>1?120:v<0?220:30;
            ctx.fillStyle = `hsla(${hue},70%,60%,0.3)`;
            ctx.fillRect(i*bw, HEIGHT - BUCKET_HEIGHT, bw, BUCKET_HEIGHT);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const label = v>1?`${v}×`:v<0?`${-v}`:'+';
            ctx.fillText(label, i*bw + bw/2, HEIGHT - BUCKET_HEIGHT/2);
          });
        }

        // ─── Pegs, Balls & Barriers ───────────────────────────
        engine.getBodies().forEach(b => {
          if (b.label === 'Barrier' || b.label === 'Peg') {
            ctx.beginPath();
            b.vertices.forEach((pt,j) =>
              j===0? ctx.moveTo(pt.x,pt.y): ctx.lineTo(pt.x,pt.y)
            );
            ctx.closePath();
            ctx.fillStyle = b.label==='Barrier'?'#444':'#666';
            ctx.fill();
            return;
          }

          if (b.label === 'Ball') {
            const idx = b.plugin.playerIndex as number;
            const m = mults[idx]||1;
            const x = b.position.x, y = b.position.y;

            // 1) glow for any m>1
            if (m > 1) {
              ctx.globalCompositeOperation = 'lighter';
              const radius = BALL_VIS_RADIUS * 2; // smaller glow
              const glow = ctx.createRadialGradient(x,y,0,x,y,radius);
              glow.addColorStop(0, 'rgba(255,255,200,0.5)');
              glow.addColorStop(1, 'rgba(255,255,200,0)');
              ctx.fillStyle = glow;
              ctx.beginPath();
              ctx.arc(x, y, radius, 0, Math.PI*2);
              ctx.fill();
              ctx.globalCompositeOperation = 'source-over';
            }

            // 2) fire for m>=5
            if (m >= 5) {
              const base = BALL_VIS_RADIUS * 1.2;
              const flick = 0.8 + Math.random()*0.4;
              ctx.globalCompositeOperation = 'lighter';
              // outer fire
              const fg = ctx.createRadialGradient(x,y,0,x,y,base*2.3*flick);
              fg.addColorStop(0, `rgba(255,180,0,${0.6*flick})`);
              fg.addColorStop(1, 'rgba(255,0,0,0)');
              ctx.fillStyle = fg;
              ctx.beginPath();
              ctx.arc(x,y,base*2.3*flick,0,2*Math.PI);
              ctx.fill();
              // inner core
              const ig = ctx.createRadialGradient(x,y,0,x,y,base*0.8*flick);
              ig.addColorStop(0, 'rgba(255,255,220,1)');
              ig.addColorStop(1, 'rgba(255,200,0,0)');
              ctx.fillStyle = ig;
              ctx.beginPath();
              ctx.arc(x,y,base*0.8*flick,0,2*Math.PI);
              ctx.fill();
              ctx.globalCompositeOperation = 'source-over';

              // particles
              if (particles.length < 200) {
                for (let k=0; k<2; k++) {
                  particles.push({
                    x: x + (Math.random()-0.5)*5,
                    y: y + (Math.random()-0.5)*5,
                    size: 2 + Math.random()*2,
                    opacity: 0.5 + Math.random()*0.5,
                    life: 20 + Math.random()*10,
                    vx: (Math.random()-0.5)*0.5,
                    vy: (Math.random()-0.5)*0.5 - 0.5,
                  });
                }
              }
            }

            // finally draw the ball
            ctx.fillStyle = roster[idx].color;
            ctx.beginPath();
            ctx.arc(x, y, BALL_VIS_RADIUS, 0, Math.PI*2);
            ctx.fill();
          }
        });

        ctx.restore();
      }} />
      <Scoreboard
        roster={roster}
        scores={scores}
        mults={mults}
        targetPoints={targetPoints}
      />
    </>
  );
}
