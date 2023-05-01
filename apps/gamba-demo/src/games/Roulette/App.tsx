import { lamportsToSol } from 'gamba'
import { useGamba } from 'gamba/react'
import { ActionBar, Button, ResponsiveSize } from 'gamba/react-ui'
import React, { useMemo, useState } from 'react'
import { Results } from './Results'
import { Table } from './Table'
import { CHIPS, NAMED_BETS } from './constants'
import { useRoulette } from './store'
import { Chip, StylelessButton } from './styles'
import { NamedBet } from './types'

export default function Roulette() {
  const gamba = useGamba()
  const tableBet = useRoulette((state) => state.tableBet)
  const clearChips = useRoulette((state) => state.clearChips)
  const selectedBetAmount = useRoulette((state) => state.selectedBetAmount)
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

  const play = async () => {
    try {
      const res = await gamba.play(bet, wager)
      setLoading(true)
      const result = await res.result()
      addResult(result.resultIndex)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ResponsiveSize>
        <div style={{ display: 'grid', gap: '20px', alignItems: 'center' }}>
          <Results loading={loading} />
          <div style={{ textAlign: 'left', display: 'flex', gap: '20px' }}>
            {CHIPS.map((value) => (
              <StylelessButton key={value} onClick={() => setSelectedBetAmount(value)}>
                <Chip inactive={value !== selectedBetAmount} value={lamportsToSol(value)}>
                  {lamportsToSol(value)}
                </Chip>
              </StylelessButton>
            ))}
            {maxPayoutExceeded ? (
              <span style={{ color: '#ff0066' }}>
                (Bet too brave)
              </span>
            ) : (
              <span>
                MAX WIN = {lamportsToSol(maxPayout).toFixed(3)} SOL
              </span>
            )}
          </div>
          <Table />
        </div>
      </ResponsiveSize>
      <ActionBar>
        <Button disabled={!wager} onClick={clearChips}>
          Clear
        </Button>
        <Button disabled={loading || maxPayoutExceeded || !wager} onClick={play}>
          Spin
        </Button>
      </ActionBar>
    </>
  )
}
