// src/games/Jackpot/WinnerReveal.tsx
import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { IdlAccounts } from '@coral-xyz/anchor';
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk';

type Player = IdlAccounts<Multiplayer>['game']['players'][number];

interface WinnerRevealProps {
  players: Player[];
  winnerIndexes: number[]; // e.g. [3] if the 4th player won
  onComplete?: () => void;
}

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%     { transform: scale(1.2); }
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
`;

const Tag = styled.div<{ $active: boolean; $winner: boolean }>`
  width: 48px;
  height: 48px;
  line-height: 48px;
  text-align: center;
  background: ${({ $winner }) => ($winner ? '#4caf50' : 'rgba(255,255,255,0.1)')};
  color: #fff;
  border-radius: 8px;
  font-family: monospace;
  font-size: 1rem;

  /* only inject animation when active */
  ${({ $active }) =>
    $active &&
    css`
      animation: ${pulse} 0.4s ease-in-out infinite;
    `}
`;

export default function WinnerReveal({
  players,
  winnerIndexes,
  onComplete,
}: WinnerRevealProps) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (winnerIndexes.length === 0 || players.length === 0) return;
    const final = winnerIndexes[0];
    const rounds = players.length * 3 + final;
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
    }, 100);

    return () => clearInterval(iv);
  }, [players, winnerIndexes, onComplete]);

  return (
    <Container>
      {players.map((p, i) => {
        const short = p.user.toBase58().slice(0, 3);
        return (
          <Tag
            key={p.user.toBase58()}
            $active={!done ? i === current : false}
            $winner={done && i === current}
          >
            {short}
          </Tag>
        );
      })}
    </Container>
  );
}
