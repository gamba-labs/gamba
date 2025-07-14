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
  // Make the reel long enough for a good spin
  for (let i = 0; i < 15; i++) {
    reel.push(...players);
  }
  // Place the winner at a predictable position near the end
  reel.splice(reel.length - Math.floor(players.length / 2) - 1, 1, players[winnerIndex]);
  return reel;
};

export const WinnerAnimation: React.FC<WinnerAnimationProps> = ({
  players,
  winnerIndexes,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [reelFinished, setReelFinished] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [winnerPosition, setWinnerPosition] = useState(0);
  const reelRef = useRef<HTMLDivElement>(null);

  const winnerIndex = winnerIndexes[0];
  const playerReel = useMemo(() => createPlayerReel(players, winnerIndex), [players, winnerIndex]);

  useLayoutEffect(() => {
    if (!reelRef.current) return;
    const containerWidth = reelRef.current.clientWidth;
    const winnerCardIndex = playerReel.length - Math.floor(players.length / 2) - 1;
    const winnerCardElement = reelRef.current.children[winnerCardIndex] as HTMLElement;
    if (!winnerCardElement) return;

    const winnerOffset = winnerCardElement.offsetLeft + (winnerCardElement.offsetWidth / 2);
    const centerOffset = containerWidth / 2;

    setWinnerPosition(-(winnerOffset - centerOffset));
  }, [playerReel, players.length]);

  // Stage 2: After the reel stops, pause for suspense, then reveal the winner
  useEffect(() => {
    if (reelFinished) {
      const suspenseTimer = setTimeout(() => {
        setWinner(players[winnerIndex]);
      }, 1500); // 1.5-second suspenseful pause

      return () => clearTimeout(suspenseTimer);
    }
  }, [reelFinished, players, winnerIndex]);

  // Stage 3: After the winner is revealed, wait a bit then close the whole overlay
  useEffect(() => {
    if (winner) {
      const closeTimer = setTimeout(() => {
        setIsClosing(true);
      }, 3000); // Show winner for 3 seconds before closing

      return () => clearTimeout(closeTimer);
    }
  }, [winner]);


  if (!players.length) return null;

  const shorten = (str: string) => `${str.slice(0, 4)}...`;

  return (
    <AnimatePresence>
      {!isClosing && (
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
                ease: [0.22, 1, 0.36, 1], // Smoother ease-out
                delay: 1,
              }}
              // Stage 1: When roll is complete, trigger stage 2
              onAnimationComplete={() => setReelFinished(true)}
            >
              {playerReel.map((player, i) => (
                <S.PlayerCard
                  key={`${player.user.toBase58()}-${i}`}
                  $isWinner={winner?.user.equals(player.user) ?? false}
                >
                  <S.Avatar />
                  <S.PlayerAddress>{shorten(player.user.toBase58())}</S.PlayerAddress>
                </S.PlayerCard>
              ))}
            </S.PlayerReel>
          </S.ReelContainer>
          
          <AnimatePresence>
            {winner && (
              <S.WinnerText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                Winner: {shorten(winner.user.toBase58())}
              </S.WinnerText>
            )}
          </AnimatePresence>
        </S.Wrapper>
      )}
    </AnimatePresence>
  );
};