import { lamportsToSol } from 'gamba'
import React, { MouseEventHandler } from 'react'
import appStyles from './App.module.css'
import styles from './Table.module.css'
import { NAMED_BETS, NUMBERS, NUMBER_COLUMNS, getNumberInfo } from './constants'
import { NamedBet } from './types'
import { useRoulette } from './useRoulette'

interface BetButtonProps {
  square: {name?: NamedBet, number?: number}
  value: number
}

function BetButton({ square, children, value, className, ...rest }: React.PropsWithChildren<BetButtonProps> & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const placeChip = useRoulette((state) => state.placeChip)
  const removeChips = useRoulette((state) => state.removeChips)
  const selectedBetAmount = useRoulette((state) => state.selectedBetAmount)
  const setHighlightedSquares = useRoulette((state) => state.setHighlightedSquares)

  const hover = () => {
    if (typeof square.number !== 'undefined')
      setHighlightedSquares([square.number])
    if (typeof square.name !== 'undefined')
      setHighlightedSquares(NAMED_BETS[square.name])
  }

  const leave = () => {
    setHighlightedSquares([])
  }

  const click: MouseEventHandler = (evt) => {
    evt.preventDefault()
    const numberOrName = square.name ?? square.number
    if (typeof numberOrName !== 'undefined') {
      if (evt.button === 2) {
        removeChips(numberOrName)
      } else {
        placeChip(numberOrName, selectedBetAmount)
      }
    }
  }

  return (
    <button
      className={[styles.betButton, className].join(' ')}
      onContextMenu={click}
      onClick={click}
      onMouseOver={hover}
      onMouseLeave={leave}
      {...rest}
    >
      {children}
      {value > 0 && (
        <div key={value} className={styles.chip2}>
          <div className={appStyles.chip}>
            {lamportsToSol(value)}
          </div>
        </div>
      )}
    </button>
  )
}

export function Table() {
  const highlightedSquares = useRoulette((state) => state.highlightedSquares)
  const tableBet = useRoulette((state) => state.tableBet)

  return (
    <div className={styles.wrapper}>
      {Array.from({ length: NUMBERS }).map((_, i) => {
        const { row, color } = getNumberInfo(i)
        const value = tableBet.numbers[i]
        const isHighlighted = highlightedSquares.includes(i)
        return (
          <BetButton
            key={i}
            square={{ number: i }}
            value={value}
            data-highlight={isHighlighted}
            data-color={color}
            style={{ gridRow: row + 1 }}
          >
            {i + 1}
          </BetButton>
        )
      })}
      {(['row1', 'row2', 'row3'] as const).map((name, i) => (
        <BetButton
          key={name}
          square={{ name }}
          value={tableBet.named[name]}
          style={{
            gridRow: (i + 1),
            gridColumn: NUMBER_COLUMNS + 1,
          }}
        >
          1:2
        </BetButton>
      ))}
      {(['firstHalf', 'odd', 'red', 'black', 'even', 'secondHalf'] as const).map((name, i) => (
        <BetButton
          key={i}
          square={{ name }}
          value={tableBet.named[name]}
          style={{
            gridRow: 4,
            gridColumn: i + 1,
          }}
        >
          <div>
            {name}
          </div>
        </BetButton>
      ))}
    </div>
  )
}
