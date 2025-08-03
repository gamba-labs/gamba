// src/components/Board.tsx
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { GambaUi } from 'gamba-react-ui-v2';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useMultiPlinko } from '../hooks/useMultiPlinko';
import {
  WIDTH,
  HEIGHT,
  BUCKET_DEFS,
  BUCKET_HEIGHT,
  PEG_RADIUS,
  BALL_RADIUS,
} from '../engine/constants';
import { PlayerInfo, RecordedRace } from '../engine/types';
import Scoreboard from './Scoreboard';

/* ── visuals ─────────────────────────────────────────── */
const COLORS = ['#ff9aa2', '#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7', '#c7ceea'];
const SPEED_FACTOR    = 4;
const HIT_DIST_SQ     = (BALL_RADIUS + PEG_RADIUS) ** 2;

/* arrow size (screen pixels, before canvas scale) */
const ARROW_W = 12;
const ARROW_H = 10;

type Particle = {
  x: number; y: number; size: number; opacity: number; life: number;
  vx: number; vy: number;
};

export default function Board({
  players,
  winnerIdx,
  metadata,
  youIndexOverride,
  gamePk,
  targetPoints = 50,
  payouts,
  onFinished,
}: {
  players: PublicKey[];
  winnerIdx: number | null;
  metadata?: Record<string,string>;
  youIndexOverride?: number;
  gamePk: string;
  targetPoints?: number;
  onFinished?: () => void;
  payouts?: number[];
}) {
  /* ───────────────── player roster ─────────────────── */
  const roster: PlayerInfo[] = useMemo(
    () => players.map((p, i) => ({
      id   : p.toBase58(),
      color: COLORS[i % COLORS.length],
    })),
    [players],
  );

  /* identify “you” */
  const { publicKey } = useWallet();
  const youId = publicKey?.toBase58() ?? '';
  const youIndex = useMemo(() => {
    if (youIndexOverride != null) return youIndexOverride;
    return roster.findIndex(r => r.id === youId);
  }, [roster, youId, youIndexOverride]);

  /* ───────────────── sim / replay ──────────────────── */
  const { engine, recordRace, replayRace } = useMultiPlinko(roster, gamePk);
  const [scores, setScores] = useState<number[]>([]);
  const [mults , setMults ] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const bucketAnim = useRef<Record<number, number>>({});
  const pegAnim    = useRef<Record<number, number>>({});
  const particles  = useRef<Particle[]>([]).current;

  /* ── framer-motion target positions for arrow ─── */
  const targetX = useMotionValue(-1000);
  const targetY = useMotionValue(-1000);
  const arrowX  = useSpring(targetX, { stiffness: 500, damping: 40 });
  const arrowY  = useSpring(targetY, { stiffness: 500, damping: 40 });

  /* reset UI state on new roster */
  useEffect(() => {
    setScores(Array(roster.length).fill(0));
    setMults (Array(roster.length).fill(1));
    setFinished(false);
    bucketAnim.current = {};
    pegAnim.current    = {};
    particles.length   = 0;
    targetX.set(-1000);
    targetY.set(-1000);
  }, [roster]);

  useEffect(() => {
    if (finished && onFinished) onFinished();
  }, [finished, onFinished]);

  /* record a deterministic race & replay it */
  useEffect(() => {
    if (winnerIdx == null || !engine) return;

    const rec      : RecordedRace = recordRace(winnerIdx, targetPoints);
    const events   = [...rec.events];
    const runMults = Array(roster.length).fill(1);

    replayRace(rec, frame => {
      /* bucket / mult events */
      while (events.length && events[0].frame === frame) {
        const e      = events.shift()!;
        const bw     = WIDTH / BUCKET_DEFS.length;
        const coarse = Math.floor(e.frame / SPEED_FACTOR);
        const path   = rec.paths[e.player];
        const cx     = path[coarse * 2] ?? 0;
        const bi     = Math.max(0, Math.min(BUCKET_DEFS.length - 1, Math.floor(cx / bw)));
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
  }, [engine, winnerIdx, targetPoints, recordRace, replayRace, roster]);

  /* ────────────────── zero-player guard ──────────────── */
  if (roster.length === 0 && winnerIdx !== null) {
    return (
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          '100%',
        height:         '100%',
        color:          '#fff',
        fontSize:       18,
        background:     '#0b0b13',
      }}>
        Game settled with 0 players
      </div>
    );
  }

  /* ───────────────────────── render ───────────────────────── */
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GambaUi.Canvas
        render={({ ctx, size }) => {
          if (!engine) return;

          /* clear */
          ctx.clearRect(0, 0, size.width, size.height);
          ctx.fillStyle = '#0b0b13';
          ctx.fillRect(0, 0, size.width, size.height);

          /* computations reused in arrow placement */
          const scale   = Math.min(size.width / WIDTH, size.height / HEIGHT);
          const offsetX = (size.width  - WIDTH  * scale) / 2;
          const offsetY = (size.height - HEIGHT * scale) / 2;

          ctx.save();
          ctx.translate(offsetX, offsetY);
          ctx.scale(scale, scale);

          const bodies = engine.getBodies();
          const balls  = bodies.filter(b => b.label === 'Ball');
          const pegs   = bodies.filter(b => b.label === 'Peg');

          /* peg-hit detection */
          balls.forEach(ball => {
            const { x: bx, y: by } = ball.position;
            pegs.forEach(peg => {
              const { x: px, y: py } = peg.position;
              const dx = bx - px, dy = by - py;
              if (dx*dx + dy*dy < HIT_DIST_SQ) {
                const idx = (peg as any).plugin?.pegIndex ?? -1;
                if (idx >= 0) pegAnim.current[idx] = 1;
              }
            });
          });

          /* particles behind everything */
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life--;
            if (p.life <= 0) { particles.splice(i, 1); continue; }
            p.x += p.vx; p.y += p.vy;
            p.opacity *= 0.96; p.size *= 0.98;
            ctx.fillStyle = `rgba(255,180,0,${p.opacity})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 2*Math.PI); ctx.fill();
          }

          /* buckets & glow */
          const bw = WIDTH / BUCKET_DEFS.length;
          BUCKET_DEFS.forEach((v, i) => {
            let anim = bucketAnim.current[i] || 0;
            if (anim > 0) bucketAnim.current[i] *= 0.85;
            anim = bucketAnim.current[i] || 0;

            if (anim > 0.02) {
              const topY  = HEIGHT - BUCKET_HEIGHT * 2;
              const glowH = BUCKET_HEIGHT;
              const cx    = i * bw + bw / 2;
              const by    = HEIGHT - BUCKET_HEIGHT;
              const hue   = v > 1 ? 120 : v < 0 ? 220 : 30;
              const grad  = ctx.createRadialGradient(
                cx, by,      bw * 0.1,
                cx, by - glowH, bw * 1.5
              );
              grad.addColorStop(0,   `hsla(${hue},80%,${70+anim*20}%,${0.4*anim})`);
              grad.addColorStop(0.6, `hsla(${hue},60%,60%,${0.1*anim})`);
              grad.addColorStop(1,   'rgba(0,0,0,0)');
              ctx.fillStyle = grad;
              ctx.fillRect(i * bw, topY, bw, glowH);
            }

            const hue = v > 1 ? 120 : v < 0 ? 220 : 30;
            ctx.fillStyle = `hsla(${hue},70%,60%,0.3)`;
            ctx.fillRect(i * bw, HEIGHT - BUCKET_HEIGHT, bw, BUCKET_HEIGHT);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const label = v > 1 ? `${v}×` : v < 0 ? `${-v}` : '+';
            ctx.fillText(label, i * bw + bw / 2, HEIGHT - BUCKET_HEIGHT / 2);
          });

          /* barriers, pegs & balls */
          bodies.forEach(b => {
            if (b.label === 'Barrier') {
              ctx.beginPath();
              b.vertices.forEach((pt, j) =>
                j === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)
              );
              ctx.closePath();
              ctx.fillStyle = '#444';
              ctx.fill();
              return;
            }

            if (b.label === 'Peg') {
              const idx = (b as any).plugin?.pegIndex ?? -1;
              let anim  = pegAnim.current[idx] ?? 0;
              if (anim > 0) pegAnim.current[idx] *= 0.9;

              ctx.save();
              ctx.translate(b.position.x, b.position.y);
              ctx.scale(1 + anim * 0.4, 1 + anim * 0.4);

              const pegHue = (b.position.y + b.position.x + Date.now() * 0.05) % 360;

              ctx.fillStyle = `hsla(${pegHue},75%,60%,${(1+anim*2)*0.2})`;
              ctx.beginPath(); ctx.arc(0,0,PEG_RADIUS+4,0,2*Math.PI); ctx.fill();

              const light = 75 + anim * 25;
              ctx.fillStyle = `hsla(${pegHue},85%,${light}%,1)`;
              ctx.beginPath(); ctx.arc(0,0,PEG_RADIUS,0,2*Math.PI); ctx.fill();

              ctx.restore();
              return;
            }

            if (b.label === 'Ball') {
              const idx = b.plugin.playerIndex as number;
              const m   = mults[idx] || 1;
              const x   = b.position.x, y = b.position.y;

              if (m > 1) {
                ctx.globalCompositeOperation = 'lighter';
                const radius = BALL_RADIUS * 2;
                const glow = ctx.createRadialGradient(x,y,0,x,y,radius);
                glow.addColorStop(0, 'rgba(255,255,200,0.5)');
                glow.addColorStop(1, 'rgba(255,255,200,0)');
                ctx.fillStyle = glow;
                ctx.beginPath(); ctx.arc(x,y,radius,0,2*Math.PI); ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
              }

              if (m >= 5) {
                const base  = BALL_RADIUS * 1.2;
                const flick = 0.8 + Math.random() * 0.4;
                ctx.globalCompositeOperation = 'lighter';

                const fg = ctx.createRadialGradient(x,y,0,x,y,base*2.3*flick);
                fg.addColorStop(0, `rgba(255,180,0,${0.6*flick})`);
                fg.addColorStop(1, 'rgba(255,0,0,0)');
                ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(x,y,base*2.3*flick,0,2*Math.PI); ctx.fill();

                const ig = ctx.createRadialGradient(x,y,0,x,y,base*0.8*flick);
                ig.addColorStop(0, 'rgba(255,255,220,1)');
                ig.addColorStop(1, 'rgba(255,200,0,0)');
                ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(x,y,base*0.8*flick,0,2*Math.PI); ctx.fill();

                ctx.globalCompositeOperation = 'source-over';

                if (particles.length < 200) {
                  for (let k = 0; k < 2; k++) {
                    particles.push({
                      x: x + (Math.random() - 0.5) * 5,
                      y: y + (Math.random() - 0.5) * 5,
                      size   : 2 + Math.random() * 2,
                      opacity: 0.5 + Math.random() * 0.5,
                      life   : 20 + Math.random() * 10,
                      vx     : (Math.random() - 0.5) * 0.5,
                      vy     : (Math.random() - 0.5) * 0.5 - 0.5,
                    });
                  }
                }
              }

              ctx.fillStyle = roster[idx].color;
              ctx.beginPath(); ctx.arc(x,y,BALL_RADIUS,0,2*Math.PI); ctx.fill();

              if (idx === youIndex) {
                const screenX = offsetX + x * scale - ARROW_W / 2;
                const screenY = offsetY + (y - BALL_RADIUS - 2) * scale - ARROW_H;
                targetX.set(screenX);
                targetY.set(screenY);
              }
            }
          });

          ctx.restore();
        }}
      />

      {/* ── the arrow (pure HTML) ───────────────────────── */}
      <motion.div
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          borderLeft: `${ARROW_W/2}px solid transparent`,
          borderRight:`${ARROW_W/2}px solid transparent`,
          borderTop: `${ARROW_H}px solid #fff`,
          pointerEvents: 'none',
          x: arrowX,
          y: arrowY,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
        }}
      />

      <Scoreboard
        roster={roster}
        scores={scores}
        mults={mults}
        targetPoints={targetPoints}
        final={finished}
        payouts={payouts}
        metadata={metadata}
      />
    </div>
  );
}
