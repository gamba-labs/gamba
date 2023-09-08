import { MIN_BET, lamportsToSol, solToLamports } from 'gamba'
import { useBalances } from 'gamba/react'
import { formatLamports, useControlsStore, useWagerUtils } from 'gamba/react-ui'
import React from 'react'
import { Button2 } from '../components/Button/Button'

export function WagerInput() {
  const balances = useBalances()
  const controls = useControlsStore()
  const wager = useWagerUtils({ bet: controls.scheme.wagerInput?.bet })

  const set = (value: number) => {
    controls.setWager(value)
  }

  React.useEffect(
    () => {
      controls.setWager(wager.set(controls.wager))
    }
    , [controls.scheme],
  )

  if (!controls.scheme.wagerInput) return null

  return (
    <div style={{ position: 'relative' }}>
      <Button2
        style={{ width: '100%' }}
        onClick={
          () => {
            const _wager = prompt('Set Wager', String(lamportsToSol(controls.wager)))
            if (_wager) {
              set(wager.set(solToLamports(Number(_wager))))
            }
          }
        }
      >
        {formatLamports(controls.wager)}
      </Button2>
      <div>
        <input
          type="range"
          min={wager.min()}
          style={{ width: '100%' }}
          max={balances.total}
          value={controls.wager}
          onChange={(e) => controls.setWager(Number(e.target.value))}
        />
      </div>
      <div style={{ display: 'flex', gap: '5px' }}>
        <Button2 variant="ghost" size="small" onClick={() => set(MIN_BET)}>
          MIN
        </Button2>
        <Button2 variant="ghost" size="small" onClick={() => set(wager.max())}>
          MAX
        </Button2>
        <Button2 variant="ghost" size="small" onClick={() => set(wager.times(controls.wager, .5))}>
          / 2
        </Button2>
        <Button2 variant="ghost" size="small" onClick={() => set(wager.times(controls.wager, 2))}>
          x2
        </Button2>
      </div>
    </div>
  )
}
