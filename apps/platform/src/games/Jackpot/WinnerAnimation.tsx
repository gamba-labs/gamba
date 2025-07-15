import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { IdlAccounts } from '@coral-xyz/anchor';
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk';
import type { PublicKey } from '@solana/web3.js';

/* ─── STYLES ───────────────────────────────────────────────────────────────── */

const winnerGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 15px 5px rgba(46, 204, 113, 0.7);
    transform: scale(1.1);
  }
  50% {
    box-shadow: 0 0 30px 10px rgba(46, 204, 113, 1);
    transform: scale(1.15);
  }
`;

const Wrapper = styled(motion.div)`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(5px);
  z-index: 100;
`;

const ReelContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 80vw;
  overflow: hidden;
  padding: 20px 0;
  mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
`;

const Pointer = styled.div`
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 100%;
  background: #f39c12;
  box-shadow: 0 0 10px #f39c12;
  z-index: 2;
  border-radius: 2px;
`;

const PlayerReel = styled(motion.div)`
  display: flex;
`;

const PlayerCard = styled.div<{ $isWinner: boolean; $isYou: boolean; }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 100px;
  height: 120px;
  background: #2c2c54;
  border-radius: 10px;
  border: 2px solid #4a4a7c;
  margin: 0 5px;
  transition: all 0.3s ease;
  transform: scale(1);

  ${({ $isYou, $isWinner }) => !$isWinner && $isYou && css`
    border-color: #3498db;
    box-shadow: 0 0 10px 2px rgba(52, 152, 219, 0.6);
  `}

  ${({ $isWinner }) => $isWinner && css`
    border-color: #2ecc71;
    animation: ${winnerGlow} 1.5s ease-in-out infinite;
  `}
`;

const YouBadge = styled.div`
  position: absolute;
  top: -10px;
  padding: 2px 8px;
  font-size: 0.7rem;
  font-weight: 700;
  background: #3498db;
  color: #fff;
  border-radius: 6px;
  z-index: 5;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #4a4a7c;
  margin-bottom: 10px;
`;

const PlayerAddress = styled.div`
  font-size: 0.8rem;
  color: #e0e0e0;
  font-family: monospace;
`;

const BottomBar = styled.div`
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WinnerText = styled(motion.div)`
  font-size: 1.5rem;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 0 10px #2ecc71;
`;


/* ─── COMPONENT ────────────────────────────────────────────────────────────── */

type Player = IdlAccounts<Multiplayer>['game']['players'][number];

interface Props {
  players: Player[];
  winnerIndexes: number[];
  currentUser?: PublicKey | null;
}

const buildReel = (players: Player[], winnerIdx: number) => {
  const n = players.length;
  if (!n) return [];

  const safeWinner = players[winnerIdx >= 0 && winnerIdx < n ? winnerIdx : 0];
  const TARGET_INDEX = 100;

  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const reel = Array.from({ length: TARGET_INDEX * 2 }, (_, i) => shuffled[i % n]);

  reel[TARGET_INDEX] = safeWinner;

  if (n > 1) {
    const nonWinner = players.find(p => !p.user.equals(safeWinner.user)) ?? players[(winnerIdx + 1) % n];
    reel[TARGET_INDEX - 1] = nonWinner;
  }
  
  return reel;
};

const short = (a: string) => `${a.slice(0, 4)}…`;

export const WinnerAnimation: React.FC<Props> = ({
  players,
  winnerIndexes,
  currentUser,
}) => {
  if (!players.length || !winnerIndexes.length) return null;

  const winnerIdx = winnerIndexes[0];
  const [closing, setClosing] = useState(false);
  const [spinDone, setSpinDone] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [offset, setOffset] = useState(0);
  const reelRef = useRef<HTMLDivElement>(null);

  const reel = useMemo(() => buildReel(players, winnerIdx), [players, winnerIdx]);

  useLayoutEffect(() => {
    if (!reelRef.current || !reel.length) return;
    const containerW = reelRef.current.clientWidth;
    const idx = 100; 
    const el = reelRef.current.children[idx] as HTMLElement | undefined;
    if (!el) return;
    const center = el.offsetLeft + el.offsetWidth / 2;
    setOffset(-(center - containerW / 2));
  }, [reel]);

  useEffect(() => {
    if (!spinDone) return;
    const t = setTimeout(() => setWinner(players[winnerIdx]), 1500);
    return () => clearTimeout(t);
  }, [spinDone, players, winnerIdx]);

  useEffect(() => {
    if (!winner) return;
    const t = setTimeout(() => setClosing(true), 3000);
    return () => clearTimeout(t);
  }, [winner]);

  const winnerAddr = winner?.user?.toBase58() ?? '';
  const currentAddr = currentUser?.toBase58() ?? '';

  return (
    <AnimatePresence>
      {!closing && (
        <Wrapper
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ReelContainer>
            <Pointer />
            <PlayerReel
              ref={reelRef}
              initial={{ x: 0 }}
              animate={{ x: offset }}
              transition={{ duration: 6, ease: [0.22, 1, 0.36, 1], delay: 1 }}
              onAnimationComplete={() => setSpinDone(true)}
            >
              {reel.map((p, i) => {
                const addr = p?.user?.toBase58?.() ?? `unknown-${i}`;
                const isYou = !!currentAddr && addr === currentAddr;
                const isWinner = !!winnerAddr && addr === winnerAddr && i === 100;

                return (
                  <PlayerCard
                    key={`${addr}-${i}`}
                    $isYou={isYou}
                    $isWinner={isWinner}
                  >
                    {isYou && <YouBadge>YOU</YouBadge>}
                    <Avatar />
                    <PlayerAddress>{short(addr)}</PlayerAddress>
                  </PlayerCard>
                );
              })}
            </PlayerReel>
          </ReelContainer>
          <BottomBar>
            <AnimatePresence>
              {winner && (
                <WinnerText
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Winner: {short(winner.user.toBase58())}
                </WinnerText>
              )}
            </AnimatePresence>
          </BottomBar>
        </Wrapper>
      )}
    </AnimatePresence>
  );
};