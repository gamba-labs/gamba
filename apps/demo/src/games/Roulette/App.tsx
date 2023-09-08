import { lamportsToSol, solToLamports } from 'gamba'
import { useGamba } from 'gamba/react'
import { Fullscreen, formatLamports, useSounds } from 'gamba/react-ui'
import React, { useMemo, useState } from 'react'
import { Results } from './Results'
import { Table } from './Table'
import { CHIPS, INITIAL_TABLE_BETS, NAMED_BETS } from './constants'
import { Chip, StylelessButton } from './styles'
import { NamedBet } from './types'

import SOUND_CHIP from './chip.wav'
import SOUND_PLAY from './play.wav'
import SOUND_WIN from './win.wav'

export default function Roulette() {
  const gamba = useGamba()
  const [tableBet, setTableBet] = useState(INITIAL_TABLE_BETS)
  const [selectedChip, setSelectedChip] = useState(solToLamports(0.01))
  const [results, setResults] = useState<number[]>([])

  const sounds = useSounds({
    chip: SOUND_CHIP,
    play: SOUND_PLAY,
    win: SOUND_WIN,
  })

  const clearChips = () => {
    setTableBet(INITIAL_TABLE_BETS)
  }

  const addResult = (result: number) => {
    setResults((r) => [result, ...r])
  }
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

  const play = async () => {
    try {
      await gamba.play({ bet, wager })
      sounds.play.play()
      setLoading(true)
      const result = await gamba.awaitResult()
      addResult(result.resultIndex)
      if (result.payout > 0)
        sounds.win.play()
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Fullscreen>
        <div style={{ display: 'grid', gap: '20px', alignItems: 'center' }}>
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

          <Results
            results={results}
            loading={loading}
          />

          <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
            {CHIPS.map((value) => (
              <StylelessButton key={value} onClick={() => setSelectedChip(value)}>
                <Chip inactive={value !== selectedChip} value={lamportsToSol(value)}>
                  {lamportsToSol(value)}
                </Chip>
              </StylelessButton>
            ))}
          </div>
          <Table tableBet={tableBet} onChange={setTableBet} />
        </div>
      </Fullscreen>
      {/* <ActionBar>
        <Button disabled={!wager} onClick={clearChips}>
          Clear
        </Button>
        <Button disabled={loading || maxPayoutExceeded || !wager} onClick={play}>
          Spin
        </Button>
      </ActionBar> */}
    </>
  )
}
