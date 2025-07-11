import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IdlAccounts } from '@coral-xyz/anchor';
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk';
import * as S from './WinnerAnimation.styles';

type Player = IdlAccounts<Multiplayer>['game']['players'][number];

interface WinnerAnimationProps {
  players: Player[];
  winnerIndexes: number[];
}

const createPlayerReel = (players: Player[], winnerIndex: number): Player[] => {
  if (players.length === 0) return [];
  const reel = [];
  for (let i = 0; i < 10; i++) {
    reel.push(...players);
  }
  reel.splice(reel.length - Math.floor(players.length / 2) - 1, 1, players[winnerIndex]);
  return reel;
};

export const WinnerAnimation: React.FC<WinnerAnimationProps> = ({
  players,
  winnerIndexes,
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [winner, setWinner] = useState<Player | null>(null);
  const [winnerPosition, setWinnerPosition] = useState(0);
  const reelRef = useRef<HTMLDivElement>(null);

  const winnerIndex = winnerIndexes[0];
  const playerReel = useMemo(() => createPlayerReel(players, winnerIndex), [players, winnerIndex]);

  // Use useLayoutEffect to calculate position after DOM is painted
  useLayoutEffect(() => {
    if (!reelRef.current) return;
    const containerWidth = reelRef.current.clientWidth;
    const winnerCardIndex = playerReel.length - Math.floor(players.length / 2) - 1;
    
    // Get the winner card element to calculate its exact offset
    const winnerCardElement = reelRef.current.children[winnerCardIndex] as HTMLElement;
    if (!winnerCardElement) return;

    const winnerOffset = winnerCardElement.offsetLeft + (winnerCardElement.offsetWidth / 2);
    const centerOffset = containerWidth / 2;

    setWinnerPosition(-(winnerOffset - centerOffset));
  }, [playerReel, players.length]);


  useEffect(() => {
    const winnerTimer = setTimeout(() => {
      setWinner(players[winnerIndex]);
    }, 6000); 

    const closeTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 9000);

    return () => {
      clearTimeout(winnerTimer);
      clearTimeout(closeTimer);
    };
  }, [players, winnerIndex]);

  if (!players.length) return null;

  const shorten = (str: string) => `${str.slice(0, 4)}...`;

  return (
    <AnimatePresence>
      {isAnimating && (
        <S.Wrapper
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <S.ReelContainer>
            <S.Pointer />
            <S.PlayerReel
              ref={reelRef}
              initial={{ x: 0 }}
              animate={{ x: winnerPosition }}
              transition={{
                duration: 5,
                ease: [0.1, 0.7, 0.3, 1],
                delay: 1,
              }}
            >
              {playerReel.map((player, i) => (
                <S.PlayerCard
                  key={`${player.user.toBase58()}-${i}`}
                  // FIX: Changed "isWinner" to "$isWinner" to prevent it from being passed to the DOM
                  $isWinner={winner?.user.equals(player.user) ?? false}
                >
                  <S.Avatar />
                  <S.PlayerAddress>{shorten(player.user.toBase58())}</S.PlayerAddress>
                </S.PlayerCard>
              ))}
            </S.PlayerReel>
          </S.ReelContainer>
          {winner && (
            <S.WinnerText
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Winner: {shorten(winner.user.toBase58())}
            </S.WinnerText>
          )}
        </S.Wrapper>
      )}
    </AnimatePresence>
  );
};