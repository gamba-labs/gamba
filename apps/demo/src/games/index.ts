import { GameBundle } from 'gamba/react-ui'
import Dice from './Dice'
import Flip from './Flip'
import Mines from './Mines'
import Slots from './Slots'
// import HiLo from './HiLo'
import Roulette from './Roulette'

export const GAMES: GameBundle[] = [
  Dice,
  Mines,
  Flip,
  Slots,
  // HiLo,
  Roulette,
]
