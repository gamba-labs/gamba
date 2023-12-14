export const SOUND_LOSE = require('./assets/lose.mp3')
export const SOUND_PLAY = require('./assets/insert.mp3')
export const SOUND_REVEAL_LEGENDARY = require('./assets/reveal-legendary.mp3')
export const SOUND_REVEAL = require('./assets/reveal.mp3')
export const SOUND_SPIN = require('./assets/spin.mp3')
export const SOUND_WIN = require('./assets/win.mp3')

const IMAGE_2X = require('./assets/slot-2x.png')
const IMAGE_3X = require('./assets/slot-3x.png')
const IMAGE_5X = require('./assets/slot-5x.png')
const IMAGE_COOL = require('./assets/slot-emoji-cool.png')
const IMAGE_HEARTS = require('./assets/slot-emoji-hearts.png')
const IMAGE_UNICORN = require('./assets/slot-unicorn.png')
const IMAGE_WOJAK = require('./assets/slot-wojak.png')

export interface SlotItem {
  multiplier: number
  image: string
}

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

export const NUM_SLOTS = 3
/** MS that it takes for spin to finish and reveal to start */
export const SPIN_DELAY = 1000
/** MS between each slot reveal */
export const REVEAL_SLOT_DELAY = 500
/** MS after reveal until win / lose effect is played */
export const FINAL_DELAY = 500
/** */
export const LEGENDARY_THRESHOLD = 5
