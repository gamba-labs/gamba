import React, { useState } from 'react'
import { RecentPlayEvent, solToLamports } from 'gamba'
import { useGamba, useRecentPlays } from 'gamba/react'
import { Svg, formatLamports } from 'gamba/react-ui'
import styled, { css, keyframes } from 'styled-components'
import { Time } from './Time'

const VERIFY_URL = 'http://localhost:7778/tx'

const PlayCSS = css`
  padding: 10px;
  display: flex;
  width: 100%;
  gap: 5px;
  grid-template-columns: auto;
  text-align: left;
  background: var(--bg-light-color);
  min-height: 40px;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-light-color);
  color: white;
  border: 1px solid #00000033;
  border-radius: 5px;
  & .who {
    color: var(--primary-color);
  }
  & .time {
    font-size: 12px;
  }
  & .flares {
    display: flex;
    letter-spacing: .5em;
  }
  border-bottom: 1px solid #00000033;
  transition: background .1s;
  &:hover {
    background: #292c39;
  }
`

const RecentPlayLink = styled.a`
  ${PlayCSS}

  text-decoration: none;

  & > div {
    display: flex;
    gap: 10px;
  }
`

const skeletonAnimation = keyframes`
  0% {
    background-color: hsla(200, 20%, 80%, .4);
  }
  100% {
    background-color: hsla(200, 20%, 95%, .5);
  }
`

const Skeleton = styled.div`
  ${PlayCSS}
  animation: ${skeletonAnimation} .5s linear infinite alternate;
  color: transparent;
`

const Amount = styled.span<{$win: boolean}>`
  color: ${({ $win }) => $win ? '#58ff8a' : '#FFFFFFCC'};
`

const Container = styled.div`
  display: grid;
  gap: 10px;
`

function RecentPlay({ event }: {event: RecentPlayEvent}) {
  const { wallet } = useGamba()
  const you = !!wallet && event.player.equals(wallet.publicKey)
  const wager = event.wager
  const multiplier = event.resultMultiplier
  const payout = wager * multiplier
  const profit = wager * multiplier - wager

  const isWhale = wager > solToLamports(0.1)
  const isRekt = payout === 0

  return (
    <RecentPlayLink target="_blank" href={`${VERIFY_URL}/${event.signature}`} rel="noreferrer">
      <div>
        <span className="who">
          {you ? 'You ' : 'Someone '}
        </span>
        <span>
          made <Amount $win={profit >= 0}>
            {formatLamports(payout)} from {formatLamports(wager)}
          </Amount>
        </span>
        <span className="flares">
          {isWhale && '🐳'}
          {isRekt && '💀'}
          {'🔥'.repeat(Math.floor(Math.max(0, multiplier - 1)))}
        </span>
      </div>
      <span className="time">
        <Time time={event.estimatedTime} /> ago / Verify <Svg.ArrowRight />
      </span>
    </RecentPlayLink>
  )
}

export function RecentPlays() {
  const [recentPlays, setRecentPlays] = useState<RecentPlayEvent[]>([])

  useRecentPlays(
    (newEvents) => {
      console.log(newEvents)
      setRecentPlays((events) => [...newEvents, ...events])
    },
  )

  return (
    <Container>
      {!recentPlays.length ? (
        Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} />
        ))
      ) : recentPlays.map((event, i) => (
        <RecentPlay key={i} event={event} />
      ))}
      <div style={{ opacity: .5, fontSize: 12 }}>
        Some transactions may be too old to load
      </div>
    </Container>
  )
}
