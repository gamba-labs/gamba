// src/games/Jackpot/TopPlayers.tsx
import React, { useMemo } from 'react'
import styled, { css } from 'styled-components'
import type { IdlAccounts } from '@coral-xyz/anchor'
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

type Player = IdlAccounts<Multiplayer>['game']['players'][number]

interface TopPlayersProps {
  players: Player[]
  totalPot: number
  $isOverlay?: boolean
}

const Container = styled.div<{ $isOverlay: boolean }>`
  position: relative;
  ${({ $isOverlay }) =>
    $isOverlay
      ? css`
          background: rgba(35, 35, 59, 0.8);
          backdrop-filter: blur(5px);
          border: 1px solid #4a4a7c;
          border-radius: 15px;
          padding: 10px;
        `
      : css`
          background: #23233b;
          border-radius: 15px;
          padding: 15px;
        `}
  height: 420px;
  overflow: hidden;
`

const Title = styled.h3`
  margin: 0 0 10px;
  color: #fff;
  font-size: 1rem;
  text-align: center;
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const PlayerItem = styled.li`
  display: flex;
  align-items: center;
  background: #2c2c54;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #4a4a7c;
`

const PlayerRank = styled.div`
  font-size: 0.9rem;
  font-weight: bold;
  color: #f39c12;
  margin-right: 10px;
  min-width: 24px;
  text-align: center;
`

const PlayerInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const PlayerAddress = styled.div`
  font-size: 0.8rem;
  color: #e0e0e0;
  font-family: monospace;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

const PlayerWager = styled.div`
  font-size: 0.8rem;
  color: #2ecc71;
  font-weight: bold;
  margin-top: 2px;
`

/** A subtle bottom fade overlay to hint at overflow */
const Fade = styled.div`
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  pointer-events: none;
  background: linear-gradient(
    rgba(35, 35, 59, 0),
    rgba(35, 35, 59, 1)
  );
`

export function TopPlayers({
  players,
  totalPot,
  $isOverlay = false,
}: TopPlayersProps) {
  // sort by wager descending
  const sorted = useMemo(
    () =>
      [...players]
        .sort((a, b) => b.wager.toNumber() - a.wager.toNumber())
        .slice(0, 7),
    [players]
  )

  const shorten = (addr: string) => `${addr.slice(0, 4)}…${addr.slice(-4)}`

  return (
    <Container $isOverlay={$isOverlay}>
      {!$isOverlay && <Title>Top Players</Title>}
      <List>
        {sorted.map((p, i) => {
          const wagerSOL = p.wager.toNumber() / LAMPORTS_PER_SOL
          const chancePct =
            totalPot > 0
              ? (p.wager.toNumber() / totalPot) * 100
              : 0
          return (
            <PlayerItem key={p.user.toBase58()}>
              <PlayerRank>#{i + 1}</PlayerRank>
              <PlayerInfo>
                <PlayerAddress>
                  {shorten(p.user.toBase58())}
                </PlayerAddress>
                <PlayerWager>
                  {wagerSOL.toFixed(2)} SOL •{' '}
                  {chancePct.toFixed(1)} %
                </PlayerWager>
              </PlayerInfo>
            </PlayerItem>
          )
        })}
      </List>
      {players.length > 8 && <Fade />}
    </Container>
  )
}
