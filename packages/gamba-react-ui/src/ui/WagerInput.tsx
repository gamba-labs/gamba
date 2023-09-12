import { MIN_BET, lamportsToSol, solToLamports } from 'gamba-core'
import { useBalances } from 'gamba-react'
import React from 'react'
import { useControlsStore } from '../useControlsStore'
import { useWagerUtils } from '../useWagerUtils'
import { formatLamports } from '../utils'
import Button from './Button'

interface WagerInputProps {
  bet?: number[]
  onChange: (wager: number) => void
  wager: number
}

export default function WagerInput({ bet, wager, onChange }: WagerInputProps) {
  const globalDisabled = useControlsStore((state) => state.disabled)
  const balances = useBalances()
  const wagerUtil = useWagerUtils()

  const set = (value: number) => {
    const fixedValue = wagerUtil(value, bet)
    onChange(fixedValue)
  }

  React.useEffect(() => set(wager), [bet])

  return (
    <div className="gamba-game-ui-wager-input">
      <Button
        onClick={
          () => {
            const _wager = prompt('Set Wager', String(lamportsToSol(wager)))
            if (_wager) {
              set(solToLamports(Number(_wager)))
            }
          }
        }
      >
        {formatLamports(wager)}
      </Button>
      <div>
        <input
          type="range"
          className="gamba-game-ui-range-input"
          min={MIN_BET}
          style={{ width: '100%' }}
          max={balances.total}
          disabled={globalDisabled}
          value={wager}
          onChange={(e) => set(Number(e.target.value))}
        />
      </div>
      <div style={{ display: 'flex', gap: '5px' }}>
        <Button onClick={() => set(MIN_BET)}>
          MIN
        </Button>
        <Button onClick={() => set(balances.total)}>
          MAX
        </Button>
        <Button onClick={() => set(wager / 2)}>
          / 2
        </Button>
        <Button onClick={() => set(wager * 2)}>
          x2
        </Button>
      </div>
    </div>
  )
}
