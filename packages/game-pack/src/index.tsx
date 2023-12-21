import React from 'react'

const GambaGamePack = {
  dice: {
    id: 'dice',
    meta: {
      background: '#ff6490',
      name: 'Dice',
      image: '/games/dice.png',
      description: `
        Use the slider to pick a number, then roll below that number to win. Lower numbers will increase your potential payout, while higher ones are safer.
      `,
    },
    app: React.lazy(() => import('./games/Dice/Dice')),
  },
  slots: {
    id: 'slots',
    meta: {
      background: '#5465ff',
      name: 'Slots',
      image: '/games/slots.png',
      description: `
        SlotsSlotsSlotsSlotsSlotsSlotsSlotsSlotsSlots
      `,
    },
    app: React.lazy(() => import('./games/Slots/Slots')),
  },
  flip: {
    id: 'flip',
    meta: {
      name: 'Flip',
      description: `
      Flip.
      `,
      image: '/games/flip.png',
      background: '#ffe694',
    },
    app: React.lazy(() => import('./games/Flip/Flip')),
  },
  plinko: {
    id: 'plinko',
    meta: {
      background: '#7272ff',
      image: '/games/plinko.png',
      name: 'Plinko',
      description: `
        Plinko
      `,
    },
    app: React.lazy(() => import('./games/Plinko/Plinko')),
  },
  hilo: {
    id: 'hilo',
    meta: {
      name: 'HiLo',
      image: '/games/hilo.png',
      description: 'Guess if the next card is going to be higher or lower than the current one. Continue until you want to cash out!',
      background: '#77bbff',
    },
    props: { logo: '/logo.svg' },
    app: React.lazy(() => import('./games/HiLo/Hilo')),
  },
  mines: {
    id: 'mines',
    meta: {
      name: 'Mines',
      description: `
        MinesMinesMinesMinesMinesMinesMines
      `,
      image: '/games/mines.png',
      background: '#8376ff',
    },
    app: React.lazy(() => import('./games/Mines/Mines')),
  },
  roulette: {
    id: 'roulette',
    meta: {
      name: 'Roulette',
      image: '/games/roulette.png',
      description: `
        A miniature version of Roulette.
      `,
      background: '#1de87e',
    },
    app: React.lazy(() => import('./games/Roulette/Roulette')),
  },
}

export default GambaGamePack
