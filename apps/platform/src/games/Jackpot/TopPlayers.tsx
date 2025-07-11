import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';
import type { IdlAccounts } from '@coral-xyz/anchor';
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk';

// FIX: Renamed "isOverlay" to "$isOverlay" to make it a transient prop
const Container = styled.div<{$isOverlay: boolean}>`
  height: 100%;

  ${({ $isOverlay }) => $isOverlay ?
    css`
      background: rgba(35, 35, 59, 0.8);
      backdrop-filter: blur(5px);
      border: 1px solid #4a4a7c;
      border-radius: 15px;
      padding: 10px;
    ` :
    css`
      background: #23233b;
      border-radius: 15px;
      padding: 15px;
    `
  }
`;

const Title = styled.h3`
  margin: 0 0 10px 0;
  color: #fff;
  font-size: 1rem;
  text-align: center;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PlayerItem = styled.li`
  display: flex;
  align-items: center;
  background: #2c2c54;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #4a4a7c;
`;

const PlayerRank = styled.div`
  font-size: 0.9rem;
  font-weight: bold;
  color: #f39c12;
  margin-right: 10px;
  min-width: 20px;
  text-align: center;
`;

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PlayerAddress = styled.div`
  font-size: 0.8rem;
  color: #e0e0e0;
  font-family: monospace;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const PlayerWager = styled.div`
  font-size: 0.75rem;
  color: #2ecc71;
  font-weight: bold;
`;

type Player = IdlAccounts<Multiplayer>['game']['players'][number];

interface TopPlayersProps {
  players: Player[];
  totalPot: number;
  $isOverlay?: boolean; // FIX: Renamed prop
}

export function TopPlayers({ players, totalPot, $isOverlay = false }: TopPlayersProps) {
  const sortedPlayers = useMemo(() => {
    return [...players]
      .sort((a, b) => b.wager.toNumber() - a.wager.toNumber())
      .slice(0, $isOverlay ? 3 : 5);
  }, [players, $isOverlay]);

  const shorten = (str: string) => `${str.slice(0, 4)}...`;

  return (
    <Container $isOverlay={$isOverlay}> {/* FIX: Renamed prop */}
      {!$isOverlay && <Title>Top Players</Title>} {/* FIX: Renamed prop */}
      <List>
        {sortedPlayers.map((player, index) => {
          const chance = totalPot > 0 ? (player.wager.toNumber() / totalPot) * 100 : 0;
          return (
            <PlayerItem key={player.user.toBase58()}>
              <PlayerRank>#{index + 1}</PlayerRank>
              <PlayerInfo>
                <PlayerAddress>{shorten(player.user.toBase58())}</PlayerAddress>
                <PlayerWager>
                  {chance.toFixed(2)}% Chance
                </PlayerWager>
              </PlayerInfo>
            </PlayerItem>
          );
        })}
      </List>
    </Container>
  );
}