import { GameBundle } from 'gamba/react-ui'
import Flip from './Flip'
import Dice from './Dice'
import Mines from './Mines'
import Roulette from './Roulette'
import Slots from './Slots'
import HiLo from './HiLo'

export const GAMES: GameBundle[] = [
  Dice,
  Mines,
  Slots,
  Flip,
  Roulette,
  // HiLo,
]
