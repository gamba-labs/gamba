import { solToLamports } from 'gamba'
import { useGamba } from 'gamba/react'
import { Fullscreen, formatLamports, useGameControls, useSounds } from 'gamba/react-ui'
import React from 'react'
import styles from './App.module.css'
import { Results } from './Results'
import { Table } from './Table'
import { CHIPS, NAMED_BETS, SOUND_LOSE, SOUND_PLAY, SOUND_WIN } from './constants'
import { NamedBet } from './types'
import { useRoulette } from './useRoulette'
import { Chip } from './Chip'

const CHIP_RATE = solToLamports(0.05)

export default function Roulette() {
  const gamba = useGamba()
  const [loading, setLoading] = React.useState(false)
  const tableBet = useRoulette((state) => state.tableBet)
  const clearChips = useRoulette((state) => state.clearChips)
  const selectedBetAmount = useRoulette((state) => state.selectedBetAmount)
  const setSelectedBetAmount = useRoulette((state) => state.setSelectedBetAmount)
  const addResult = useRoulette((state) => state.addResult)
  const sounds = useSounds({
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    play: SOUND_PLAY,
  })

  const distributedBet = React.useMemo(() =>
    tableBet.numbers.map((value, i) => {
      return Object
        .entries(NAMED_BETS)
        .reduce((prev, [betName, { ids }]) => {
          if (ids.includes(i)) {
            return prev + tableBet.named[betName as NamedBet] / ids.length
          }
          return prev
        }, value) * CHIP_RATE
    }), [tableBet],
  )

  const { wager, bet, maxPayout } = React.useMemo(() => {
    const wager = Math.floor(distributedBet.reduce((a, b) => a + b, 0))
    const bet = distributedBet.map((amount) => +((amount * distributedBet.length) / (wager || 1)).toFixed(4))
    const maxPayout = Math.max(...bet) * wager
    return { wager, bet, maxPayout }
  }, [distributedBet, gamba.house.maxPayout])

  console.log(bet, wager)

  const maxPayoutExceeded = maxPayout > gamba.house.maxPayout

  useGameControls({
    disabled: loading,
    custom: (
      <>
        <div className={styles.stats}>
          <div>
            <Chip value={1} /> = {formatLamports(CHIP_RATE)}
          </div>
        </div>
      </>
    ),
    playButton: { onClick: () => play() },
  })

  const play = async () => {
    try {
      setLoading(true)
      const res = await gamba.play({ bet, wager })
      sounds.play.play()
      const result = await res.result()
      addResult(result.resultIndex)
      if (result.payout > 0) {
        sounds.win.play()
      } else {
        sounds.lose.play()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Fullscreen maxScale={1.25} onContextMenu={(e) => e.preventDefault()}>
      <div className={styles.container}>
        {/* <div style={{ textAlign: 'center', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {maxPayoutExceeded ? (
                <span style={{ color: '#ff0066' }}>
                  TOO HIGH
                </span>
              ) : (
                <>
                  {formatLamports(maxPayout)}
                </>
              )}
            </div>
            <div style={{ fontSize: '10px' }}>
              MAX PAYOUT
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {formatLamports(wager)}
            </div>
            <div style={{ fontSize: '10px' }}>
              TOTAL BET
            </div>
          </div>
        </div> */}
        <Results loading={loading} />
        <div className={styles.chipSelectWrapper}>
          {CHIPS.map((value) => (
            <button
              key={value}
              className={[styles.button, value === selectedBetAmount && styles.selected].join(' ')}
              onClick={() => setSelectedBetAmount(value)}
            >
              <Chip value={value} />
            </button>
          ))}
          <button className={styles.button} disabled={!wager} onClick={() => clearChips()}>
            Clear
          </button>
        </div>
        <Table />
      </div>
    </Fullscreen>
  )
}
