import { solToLamports } from 'gamba'
import { NamedBet } from './types'

export const CHIPS = [
  0.05,
  0.1,
  0.25,
  0.5,
  1,
].map(solToLamports)

export const NUMBERS = 18
export const NUMBER_COLUMNS = Math.ceil(NUMBERS / 3)

const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]

export const SQUARES = Array.from({ length: NUMBERS })
  .map((_, index) => {
    const number = index + 1
    const isEven = number % 2 === 0
    const isRed = RED_NUMBERS.includes(number % (RED_NUMBERS.length + 1))
    return {
      index,
      number,
      isEven,
      row: (2 - index % 3),
      color: isRed ? 'red' : 'black' as 'red' | 'black',
    }
  })

export type NumberInfo = typeof SQUARES[0]

const pickIndices = (filter: (stuff: NumberInfo) => boolean) =>
  SQUARES.filter((x) => filter(x)).map(({ index }) => index)

export const NAMED_BETS = {
  firstHalf: pickIndices(({ number }) => number <= NUMBERS / 2),
  secondHalf: pickIndices(({ number }) => number > NUMBERS / 2),
  even: pickIndices(({ isEven }) => isEven),
  odd: pickIndices(({ isEven }) => !isEven),
  red: pickIndices(({ color }) => color === 'red'),
  black: pickIndices(({ color }) => color === 'black'),
  row1: pickIndices(({ row }) => row === 0),
  row2: pickIndices(({ row }) => row === 1),
  row3: pickIndices(({ row }) => row === 2),
}

export const INITIAL_TABLE_BETS = {
  numbers: Array.from({ length: NUMBERS }).fill(0) as number[],
  named: Object.keys(NAMED_BETS).reduce((prev, key) => ({ ...prev, [key]: 0 }), {} as Record<NamedBet, number>),
}
