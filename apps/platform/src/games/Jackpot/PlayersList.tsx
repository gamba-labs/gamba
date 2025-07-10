import React, { useEffect, useMemo, useRef } from 'react';
import { web3, IdlAccounts } from '@coral-xyz/anchor';
import * as gamba from '@gamba-labs/multiplayer-sdk';
import { AnimatePresence, motion } from 'framer-motion';
import './PlayersList.css'; // Assuming you have a CSS file for styles

type Player = IdlAccounts<gamba.Multiplayer>['game']['players'][0];

interface Props {
  players: Player[];
  isTeamGame: boolean;
  numTeams: number;
  walletKey: web3.PublicKey | null;
}

const shorten = (x: string, n = 4) => x.slice(0, n) + '…' + x.slice(-n);

export default function PlayersList({
  players,
  isTeamGame,
  numTeams,
  walletKey,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const prevLen = useRef(players.length);
  useEffect(() => {
    if (players.length > prevLen.current && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    prevLen.current = players.length;
  }, [players.length]);

  const teams = useMemo(() => {
    if (!isTeamGame) return null;
    const map: Record<string, Player[]> = {};
    for (let i = 0; i < numTeams; i++) map[i] = [];
    players.forEach(p => map[p.team.toString()]?.push(p));
    return map;
  }, [isTeamGame, numTeams, players]);

  const card = {
    hidden: { opacity: 0, y: -20, scale: 0.8 },
    enter:  { opacity: 1, y: 0,   scale: 1, transition: { type: 'spring', stiffness: 500, damping: 25 } },
    exit:   { opacity: 0, y: 20,  scale: 0.8, transition: { duration: 0.2 } },
  };
  const layoutTransition = { type: 'spring', stiffness: 500, damping: 25 };

  return (
    <div ref={ref} className="players-wrapper">
      <h4 className="players-heading">Players ({players.length})</h4>

      {/* Solo */}
      {!isTeamGame && (
        <motion.ul
          layout="position"
          transition={layoutTransition}
          className="player-grid"
        >
          <AnimatePresence initial={false}>
            {players.map(p => (
              <motion.li
                key={p.user.toBase58()}
                variants={card}
                initial="hidden"
                animate="enter"
                exit="exit"
                layout
                transition={layoutTransition}
                className="player-card"
              >
                <span className="addr">{shorten(p.user.toBase58())}</span>
                {walletKey && p.user.equals(walletKey) && <span className="you">(you)</span>}
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      {/* Teams */}
      {isTeamGame && teams && (
        <div className="team-columns">
          {Object.entries(teams).map(([tid, list]) => (
            <div key={tid} className="team-col">
              <h5 className="team-title">Team {tid}</h5>
              <motion.ul
                layout="position"
                transition={layoutTransition}
                className="player-grid"
              >
                <AnimatePresence initial={false}>
                  {list.length === 0 && (
                    <motion.li
                      key="empty"
                      className="team-empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                    >
                      (empty)
                    </motion.li>
                  )}
                  {list.map(p => (
                    <motion.li
                      key={p.user.toBase58()}
                      variants={card}
                      initial="hidden"
                      animate="enter"
                      exit="exit"
                      layout
                      transition={layoutTransition}
                      className="player-card"
                    >
                      <span className="addr">{shorten(p.user.toBase58())}</span>
                      {walletKey && p.user.equals(walletKey) && <span className="you">(you)</span>}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            </div>
          ))}
        </div>
      )}
    </div>
);
}
