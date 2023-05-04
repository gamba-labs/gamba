import { RecentPlayEvent, solToLamports } from 'gamba-core'
import { useGamba } from 'gamba-react'
import styled, { css, keyframes } from 'styled-components'
import { useGambaUi } from '../context'
import { formatLamports } from '../utils'
import { Time } from './Time'

const PlayCSS = css`
  padding: 10px;
  display: flex;
  gap: 5px;
  grid-template-columns: auto;
  text-align: left;
  background: var(--bg-light-color);
  border-radius: var(--border-radius);
  height: 40px;
  justify-content: space-between;
`

const StyledRecentPlay = styled.div`
  ${PlayCSS}
`

const skeletonAnimation = keyframes`
  0% {
    background-color: hsla(200, 20%, 80%, .5);
  }
  100% {
    background-color: hsla(200, 20%, 95%, .5);
  }
`

const Skeleton = styled.div`
  ${PlayCSS}
  animation: ${skeletonAnimation} 1s linear infinite alternate;
  color: transparent;
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

  const who = (
    <span style={{ color: '#ffc459' }}>
      {you ? 'You ' : 'Someone '}
    </span>
  )

  const content = (() => {
    if (multiplier >= 2) {
      return (
        <>
          {who} bet {formatLamports(event.wager)} and <Amount $win>{multiplier}x</Amount>
        </>
      )
    }

    if (profit < solToLamports(-.01)) {
      return (
        <>
          {who} bet {formatLamports(event.wager)} and lost
        </>
      )
    }

    return (
      <>
        {who} {win ? 'won' : 'lost'} <Amount $win={profit >= 0}>{formatLamports(Math.abs(profit))}</Amount>
      </>
    )
  })()

  return (
    <StyledRecentPlay>
      <div>
        {content}
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
    <>
      {!recentPlays.length ? (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </>
      ) : recentPlays.map((event, i) => (
        <RecentPlay key={i} event={event} />
      ))}
      <div style={{ opacity: .5, fontSize: 12 }}>
        Some transactions may be too old to load
      </div>
    </>
  )
}
