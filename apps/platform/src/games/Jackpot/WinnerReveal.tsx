// src/games/Jackpot/WinnerReveal.tsx
import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, Variants } from 'framer-motion';
import type { IdlAccounts } from '@coral-xyz/anchor';
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk';

type Player = IdlAccounts<Multiplayer>['game']['players'][number];

interface WinnerRevealProps {
  players: Player[];
  winnerIndexes: number[];       // e.g. [3] if the 4th player won
  onComplete?: () => void;
}

/** a soft green glow for the winner */
const glow = keyframes`
  0%   { box-shadow: 0 0 8px rgba(76,175,80,0.7); }
  50%  { box-shadow: 0 0 20px rgba(76,175,80,1); }
  100% { box-shadow: 0 0 8px rgba(76,175,80,0.7); }
`;

/** fade / scale-in the whole grid */
const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

/** per-tag animations */
const tagVariants: Variants = {
  idle:    { scale: 1, opacity: 1 },
  rolling: {
    scale: [1, 1.3, 1],
    transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
  },
  winner: {
    scale: [1, 1.6, 1],
    rotate: [0, 10, -10, 0],
    transition: { duration: 1.2, ease: 'easeOut' },
  },
};

/** container clips overflow so growing tags can’t add scrollbars */
const Container = styled(motion.div)`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
  overflow: hidden;
`;

/** each tag lights green when it’s the winner */
const Tag = styled(motion.div)<{ $isWinner: boolean }>`
  width: 48px;
  height: 48px;
  line-height: 48px;
  text-align: center;
  background: ${({ $isWinner }) =>
    $isWinner ? '#4caf50' : 'rgba(255,255,255,0.1)'};
  color: #fff;
  border-radius: 8px;
  font-family: monospace;
  font-size: 1rem;

  /* only the final winner glows */
  ${({ $isWinner }) =>
    $isWinner &&
    css`
      animation: ${glow} 1.2s ease-in-out infinite;
    `}
`;

export default function WinnerReveal({
  players,
  winnerIndexes,
  onComplete,
}: WinnerRevealProps) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  // only kick off the roll once
  useEffect(() => {
    if (started.current) return;
    if (!players.length || !winnerIndexes.length) return;
    started.current = true;

    const final = winnerIndexes[0];
    const rounds = players.length * 3 + final; // three full loops + landing
    let count = 0;

    const iv = window.setInterval(() => {
      count += 1;
      setCurrent((c) => (c + 1) % players.length);
      if (count >= rounds) {
        clearInterval(iv);
        setCurrent(final);
        setDone(true);
        onComplete?.();
      }
    }, 200);

    return () => clearInterval(iv);
  }, [players, winnerIndexes, onComplete]);

  if (!players.length) return null;

  return (
    <Container
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {players.map((p, i) => {
        const short = p.user.toBase58().slice(0, 3);
        const isActive = !done && i === current;
        const isWinner = done && i === current;
        return (
          <Tag
            key={p.user.toBase58()}
            $isWinner={isWinner}
            variants={tagVariants}
            initial="idle"
            animate={isWinner ? 'winner' : isActive ? 'rolling' : 'idle'}
          >
            {short}
          </Tag>
        );
      })}
    </Container>
  );
}
