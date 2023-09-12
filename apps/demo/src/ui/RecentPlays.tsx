import { GameResult, lamportsToSol } from 'gamba'
import { useGamba, useRecentGameResults } from 'gamba/react'
import { formatLamports } from 'gamba/react-ui'
import React from 'react'
import { Icon } from '../components/Icon'
import { Section } from '../components/Section'
import { cx } from '../utils'
import styles from './RecentPlays.module.css'

const VERIFY_URL = 'https://explorer.gamba.so/tx'

const TimeDiff: React.FC<{time: number}> = ({ time }) => {
  const diff = (Date.now() - time)
  return React.useMemo(() => {
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours >= 1) {
      return hours + 'h ago'
    }
    if (minutes >= 1) {
      return minutes + 'm ago'
    }
    return 'Just now'
  }, [time])
}

function RecentPlay({ result, isSelf }: {result: GameResult, isSelf: boolean}) {
  const wager = result.wager
  const multiplier = result.multiplier
  const payout = wager * multiplier
  const profit = wager * multiplier - wager
  const win = profit >= 0
  const isRekt = payout === 0
  const whaleScore = Math.log10(lamportsToSol(wager) / 0.01)
  const litScore = multiplier - 1

  return (
    <a className={styles.play} href={`${VERIFY_URL}/${result.signature}`} target="_blank" rel="noreferrer">
      <div>
        <span className={styles.who}>
          {isSelf ? 'You ' : 'Someone '}
        </span>
        made
        <span>
          <span className={cx(styles.amount, win && styles.win)}>
            {formatLamports(payout)} from {formatLamports(wager)}
          </span>
        </span>
        <span className={styles.flares}>
          {whaleScore > 0 && '🐋'.repeat(whaleScore)}
          {isRekt && '💀'}
          {litScore > 0 && '🔥'.repeat(litScore)}
        </span>
      </div>
      <span>
        <TimeDiff time={result.estimatedTime} /> <Icon.ExternalLink />
      </span>
    </a>
  )
}

export function RecentPlays() {
  const { wallet } = useGamba()
  const recentPlays = useRecentGameResults()

  return (
    <Section
      title="Recent Plays"
      stuff={
        <>
          {/* <Button size="small" variant="soft"></Button> */}
        </>
      }
    >
      <div className={styles.container}>
        {recentPlays.map((result, i) => (
          <RecentPlay
            key={i}
            result={result}
            isSelf={result.player.equals(wallet.publicKey)}
          />
        ))}
        {!recentPlays.length && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    </Section>
  )
}
