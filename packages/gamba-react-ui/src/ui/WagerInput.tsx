import { lamportsToSol, solToLamports } from 'gamba-core'
import React from 'react'
import { useControlsStore } from '../useControlsStore'
import { useWagerUtils } from '../useWagerUtils'
import Button from './Button'

interface WagerInputProps {
  bet?: number[]
  onChange: (wager: number) => void
  wager: number
}

export default function WagerInput({ bet, wager, onChange }: WagerInputProps) {
  const globalDisabled = useControlsStore((state) => state.disabled)
  // const balances = useBalances()
  const wagerUtil = useWagerUtils()
  const disabled = globalDisabled

  const set = (value: number) => {
    console.log(parseFloat(wagerUtil(value, bet).toFixed(4)))
    const fixedValue = solToLamports(parseFloat(lamportsToSol(wagerUtil(value, bet)).toFixed(4)))
    onChange(fixedValue)
  }

  // const [_wager, _setWager] = React.useState('')

  React.useEffect(() => set(wager), [bet])

  return (
    <div className="gamba-game-ui-wager-input">
      <input
        type="number"
        disabled={disabled}
        value={lamportsToSol(Number(wager))}
        step="0.05"
        onFocus={(e) => {
          e.target.select()
        }}
        onChange={
          (evt) => {
            if (evt.target.value) {
              set(solToLamports(Number(evt.target.value)))
            }
          }
        }
      />
      <div className="gamba-game-button-group">
        <Button onClick={() => set(wager / 2)}>
          ½
        </Button>
        <Button onClick={() => set(wager * 2)}>
          2x
        </Button>
      </div>
    </div>
  )
}
