import { solToLamports } from 'gamba'

export interface SlotItem {
  multiplier: number
  image: string
}

import IMAGE_2X from './slot-2x.png'
import IMAGE_3X from './slot-3x.png'
import IMAGE_5X from './slot-5x.png'
import IMAGE_COOL from './slot-emoji-cool.png'
import IMAGE_HEARTS from './slot-emoji-hearts.png'
import IMAGE_UNICORN from './slot-unicorn.png'
import IMAGE_WOJAK from './slot-wojak.png'

const slotItem = (multiplier: number, ...icons: string[]): SlotItem[] =>
  icons.map((image) => ({ multiplier, image }))

export const SLOT_ITEMS = [
  slotItem(7, IMAGE_UNICORN),
  slotItem(5, IMAGE_5X),
  slotItem(3, IMAGE_3X),
  slotItem(2, IMAGE_2X),
  slotItem(1, IMAGE_COOL, IMAGE_HEARTS),
  slotItem(.5, IMAGE_WOJAK),
].flat()

export const WAGER_OPTIONS = [.05, .1, .25, .5, .75, 1].map(solToLamports)
export const INITIAL_WAGER = solToLamports(.05)
export const NUM_SLOTS = 3
/** MS that it takes for spin to finish and reveal to start */
export const SPIN_DELAY = 1000
/** MS between each slot reveal */
export const REVEAL_SLOT_DELAY = 750
/** MS after reveal until win / lose effect is played */
export const FINAL_DELAY = 500
/** */
export const LEGENDARY_THRESHOLD = 5
