// src/games/Jackpot/RecentGames.tsx
import React, { useMemo } from 'react'
import styled, { css } from 'styled-components'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

// --- Types ---
type RecentGame = {
  player: string    // shortened address
  wagerLamports: number
  payoutLamports: number
}

// --- Styled Components ---
const Container = styled.div`
  position: relative;
  background: #23233b;
  border-radius: 15px;
  padding: 15px;
  height: 100%;
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

const GameItem = styled.li`
  display: flex;
  align-items: center;
  background: #2c2c54;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #4a4a7c;
`

const PlayerName = styled.div`
  flex: 1;
  font-size: 0.8rem;
  font-family: monospace;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Wager = styled.div`
  font-size: 0.8rem;
  color: #f1c40f;
  font-weight: bold;
  margin: 0 10px;
  white-space: nowrap;
`

const Multiplier = styled.div`
  font-size: 0.8rem;
  color: #2ecc71;
  font-weight: bold;
  white-space: nowrap;
`

/** fade‐out hint when there’s overflow */
const Fade = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30px;
  pointer-events: none;
  background: linear-gradient(
    rgba(35, 35, 59, 0),
    rgba(35, 35, 59, 1)
  );
`

// --- Component ---
export function RecentGames() {
  // replace with real data when available
  const recent: RecentGame[] = useMemo(
    () => [
      { player: 'AbcD…1234', wagerLamports: 2.5 * LAMPORTS_PER_SOL, payoutLamports: 4.5 * LAMPORTS_PER_SOL },
      { player: 'EfGh…5678', wagerLamports: 1.0 * LAMPORTS_PER_SOL, payoutLamports: 0 * LAMPORTS_PER_SOL },
      { player: 'IjKl…9012', wagerLamports: 3.0 * LAMPORTS_PER_SOL, payoutLamports: 6.0 * LAMPORTS_PER_SOL },
      { player: 'MnOp…3456', wagerLamports: 0.5 * LAMPORTS_PER_SOL, payoutLamports: 1.0 * LAMPORTS_PER_SOL },
      { player: 'QrSt…7890', wagerLamports: 4.0 * LAMPORTS_PER_SOL, payoutLamports: 8.0 * LAMPORTS_PER_SOL },
      { player: 'UvWx…2468', wagerLamports: 1.2 * LAMPORTS_PER_SOL, payoutLamports: 2.4 * LAMPORTS_PER_SOL },
      { player: 'YzAb…1357', wagerLamports: 2.2 * LAMPORTS_PER_SOL, payoutLamports: 4.4 * LAMPORTS_PER_SOL },
      { player: 'CdEf…8642', wagerLamports: 0.8 * LAMPORTS_PER_SOL, payoutLamports: 1.6 * LAMPORTS_PER_SOL },
      // …more
    ],
    []
  )

  const display = recent.slice(0, 8)

  const toSOL = (lamports: number) =>
    (lamports / LAMPORTS_PER_SOL).toFixed(2)

  return (
    <Container>
      <Title>Recent Games</Title>
      <List>
        {display.map((g, i) => (
          <GameItem key={i}>
            <PlayerName title={g.player}>
              {g.player}
            </PlayerName>
            <Wager>{toSOL(g.wagerLamports)} SOL</Wager>
            <Multiplier>
              x{(g.payoutLamports / g.wagerLamports).toFixed(2)}
            </Multiplier>
          </GameItem>
        ))}
      </List>
      {recent.length > 8 && <Fade />}
    </Container>
  )
}
