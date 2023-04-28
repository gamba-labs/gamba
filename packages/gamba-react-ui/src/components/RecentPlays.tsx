import { RecentPlayEvent, lamportsToSol } from 'gamba-core'
import { useGamba } from 'gamba-react'
import styled, { keyframes } from 'styled-components'
import { useGambaUi } from '../context'
import { Time } from './Time'

const Wrapper = styled.div`
  padding: 10px;
  width: 100%;
  @media (min-width: 600px) {
    width: 500px;
  }
  display: grid;
  gap: 10px;
  margin: 0 auto;
  text-align: center;
  padding: 20px;
`

const StyledRecentPlay = styled.div`
  padding: 10px;
  display: flex;
  gap: 5px;
  grid-template-columns: auto;
  text-align: left;
  background: #1a1c24;
  border-radius: 5px;
  height: 40px;
  justify-content: space-between;
`

const skeletonAnimation = keyframes`
  0% {
    background-color: hsl(200, 20%, 80%);
  }
  100% {
    background-color: hsl(200, 20%, 95%);
  }
`

const Skeleton = styled.div`
  animation: ${skeletonAnimation} 1s linear infinite alternate;
  width: 5em;
`

const Amount = styled.span<{$win: boolean}>`
  color: ${({ $win }) => $win ? '#58ff8a' : '#ff2969'};
`

function RecentPlay({ event }: {event: RecentPlayEvent}) {
  const { wallet } = useGamba()
  const you = !!wallet && event.player.equals(wallet.publicKey)
  const wager = event.wager
  const multiplier = event.resultMultiplier
  const profit = wager * multiplier - wager
  const win = profit >= 0

  return (
    <StyledRecentPlay>
      <div>
        <span>
          {you ? 'You' : 'Someone'}
        </span>
        <span>
          {win ? ' won ' : ' lost '}
          <Amount $win={win}>
            {Math.abs(parseFloat(lamportsToSol(profit).toFixed(4)))} SOL
          </Amount>
        </span>
      </div>
      <span>
        <a target="_blank" href={`https://solscan.io/tx/${event.signature}`} rel="noreferrer">
          <Time time={event.estimatedTime} />
        </a>
      </span>
    </StyledRecentPlay>
  )
}

export function RecentPlays() {
  const recentPlays = useGambaUi((state) => state.recentPlays)

  return (
    <Wrapper>
      <h2>RECENT PLAYS</h2>
      {!recentPlays.length ? (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <StyledRecentPlay key={i}>
              <Skeleton>.</Skeleton>
            </StyledRecentPlay>
          ))}
        </>
      ) : recentPlays.map((event, i) => (
        <RecentPlay key={i} event={event} />
      ))}
      <div style={{ opacity: .5 }}>
        Some transactions may be too old to load
      </div>
    </Wrapper>
  )
}
