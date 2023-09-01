import { solToLamports } from 'gamba'

export interface SlotItem {
  multiplier: number
  image: string
}

const slotItem = (multiplier: number, ...icons: string[]): SlotItem[] =>
  icons.map((image) => ({ multiplier, image: new URL('./' + image, import.meta.url).href }))

export const SLOT_ITEMS = [
  slotItem(7, 'slot-unicorn.png'),
  slotItem(5, 'slot-5x.png'),
  slotItem(3, 'slot-3x.png'),
  slotItem(2, 'slot-2x.png'),
  slotItem(1, 'slot-emoji-cool.png', 'slot-emoji-hearts.png'),
  slotItem(.5, 'slot-wojak.png'),
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
