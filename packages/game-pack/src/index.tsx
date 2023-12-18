import React from 'react'

const GambaGamePack = {
  dice: {
    id: 'dice',
    meta: { background: '#ff6490' },
    name: 'Dice',
    image: '/games/dice.png',
    description: `
      Use the slider to pick a number, then roll below that number to win. Lower numbers will increase your potential payout, while higher ones are safer.
    `,
    app: React.lazy(() => import('./games/Dice/Dice')),
  },
  slots: {
    id: 'slots',
    name: 'Slots',
    image: '/games/slots.png',
    meta: { background: '#5465ff' },
    description: `
      SlotsSlotsSlotsSlotsSlotsSlotsSlotsSlotsSlots
    `,
    app: React.lazy(() => import('./games/Slots/Slots')),
  },
  flip: {
    id: 'flip',
    name: 'Flip',
    description: `
    Flip.
    `,
    meta: { background: '#ffe694' },
    image: '/games/flip.png',
    app: React.lazy(() => import('./games/Flip/Flip')),
  },
  plinko: {
    id: 'plinko',
    name: 'Plinko',
    description: `
      Plinko
    `,
    meta: { background: '#7272ff' },
    image: '/games/plinko.png',
    app: React.lazy(() => import('./games/Plinko/Plinko')),
  },
  hilo: {
    id: 'hilo',
    name: 'HiLo',
    image: '/games/hilo.png',
    meta: { background: '#77bbff' },
    description: 'Guess if the next card is going to be higher or lower than the current one. Continue until you want to cash out!',
    props: { logo: '/logo.svg' },
    app: React.lazy(() => import('./games/HiLo/Hilo')),
  },
  mines: {
    id: 'mines',
    name: 'Mines',
    description: `
      MinesMinesMinesMinesMinesMinesMines
    `,
    meta: { background: '#8376ff' },
    image: '/games/mines.png',
    app: React.lazy(() => import('./games/Mines/Mines')),
  },
  roulette: {
    id: 'roulette',
    name: 'Roulette',
    image: '/games/roulette.png',
    meta: { background: '#1de87e' },
    description: `
      A miniature version of Roulette.
    `,
    app: React.lazy(() => import('./games/Roulette/Roulette')),
  },
}

export default GambaGamePack
