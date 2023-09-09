import { lamportsToSol } from 'gamba'
import { useGamba } from 'gamba/react'
import { Fullscreen, formatLamports, useGameControls, useSounds } from 'gamba/react-ui'
import React, { useMemo, useState } from 'react'
import styles from './App.module.css'
import { Results } from './Results'
import { Table } from './Table'
import { CHIPS, NAMED_BETS } from './constants'
import { NamedBet } from './types'
import { useRoulette } from './useRoulette'

import SOUND_CHIP from './chip.mp3'
import SOUND_PLAY from './play.mp3'
import SOUND_WIN from './win.mp3'
import SOUND_LOSE from './lose.mp3'

export default function Roulette() {
  const gamba = useGamba()
  const tableBet = useRoulette((state) => state.tableBet)
  const clearChips = useRoulette((state) => state.clearChips)
  const sounds = useSounds({
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    chip: SOUND_CHIP,
    play: SOUND_PLAY,
  })
  // const selectedBetAmount = useRoulette((state) => state.selectedBetAmount)
  const setSelectedBetAmount = useRoulette((state) => state.setSelectedBetAmount)
  const addResult = useRoulette((state) => state.addResult)
  const [loading, setLoading] = useState(false)

  const distributedBet = useMemo(() =>
    tableBet.numbers.map((value, i) => {
      return Object.keys(NAMED_BETS).reduce((prev, key) => {
        const betName = key as NamedBet
        const ids = NAMED_BETS[betName]
        return ids.includes(i) ? Math.floor(prev + tableBet.named[betName] / ids.length) : prev
      }, value)
    }), [tableBet])

  const { wager, bet, maxPayoutExceeded, maxPayout } = useMemo(() => {
    const wager = distributedBet.reduce((a, b) => a + b, 0)
    const bet = distributedBet.map((amount) => (amount * distributedBet.length) / (wager || 1))
    const maxPayout = Math.max(...bet) * wager
    const maxPayoutExceeded = maxPayout > (gamba.house?.maxPayout ?? 0)
    return { wager, bet, maxPayoutExceeded, maxPayout }
  }, [distributedBet, gamba.house?.maxPayout])

  useGameControls({ disabled: loading, playButton: { onClick: () => play() } })

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
    <Fullscreen>
      <div className={styles.container}>
        <div style={{ textAlign: 'center', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
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
        </div>
        <Results loading={loading} />
        <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
          {CHIPS.map((value) => (
            <button key={value} className={styles.chip} onClick={() => setSelectedBetAmount(value)}>
              {lamportsToSol(value)}
            </button>
          ))}
          <button onClick={() => clearChips()}>
            Clear
          </button>
        </div>
        <Table />
      </div>
    </Fullscreen>
  )
}
