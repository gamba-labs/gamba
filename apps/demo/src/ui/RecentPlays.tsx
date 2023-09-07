import { RecentPlayEvent, solToLamports } from 'gamba'
import { useGamba, useRecentPlays } from 'gamba/react'
import { formatLamports } from 'gamba/react-ui'
import React from 'react'
import styled from 'styled-components'
import { Svg } from '../components/Svg'
import { Time } from '../components/Time'

const VERIFY_URL = 'http://localhost:7778/tx'

const Amount = styled.span<{$win: boolean}>`
  color: ${({ $win }) => $win ? '#58ff8a' : '#FFFFFFCC'};
`

const RecentPlayLink = styled.a`
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
  & .flares {
    display: flex;
    letter-spacing: .5em;
  }
  border-bottom: 1px solid #00000033;
  transition: background .1s;
  &:hover {
    background: #292c39;
  }

  text-decoration: none;

  & > div {
    display: flex;
    gap: 10px;
  }
`

const Wrapper = styled.div`
  display: grid;
  gap: 10px;
`

function RecentPlay({ event, isSelf }: {event: RecentPlayEvent, isSelf: boolean}) {
  const wager = event.wager
  const multiplier = event.resultMultiplier
  const payout = wager * multiplier
  const profit = wager * multiplier - wager

  const isWhale = wager > solToLamports(0.1)
  const isRekt = payout === 0

  return (
    <RecentPlayLink className="dark" target="_blank" href={`${VERIFY_URL}/${event.signature}`} rel="noreferrer">
      <div>
        <span className="who">
          {isSelf ? 'You ' : 'Someone '}
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
        <Time time={event.estimatedTime} /> ago <Svg.ExternalLink />
      </span>
    </RecentPlayLink>
  )
}

export function RecentPlays() {
  const { wallet } = useGamba()
  const recentPlays = useRecentPlays()

  return (
    <Wrapper>
      {recentPlays.map((event, i) => (
        <RecentPlay
          key={i}
          event={event}
          isSelf={event.player.equals(wallet.publicKey)}
        />
      ))}
    </Wrapper>
  )
}
