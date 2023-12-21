import GamePack from 'gamba-game-pack-v2'
import { GameBundle } from 'gamba-react-ui-v2'
// import { GameBundle } from 'gamba-react-ui-v2'
import React from 'react'
import ExampleGame from './ExampleGame/ExampleGame'

/**
 * Todo: GamePack games will be configurable (custom platform metadata for images etc)
 * Example:
 * GambaPack.flip({
 *   // Any data handled by our platform:
 *   meta: {
 *     name: "Custom Flip",
 *     tags: ["New", "Popular"],
 *     description: "...",
 *   }
 *   // Config that will be handled by the game app:
 *   props: {
 *     sides: ["/custom-heads.png", "/custom-tails.png"],
 *   },
 * })
 */

export const GAMES: GameBundle[] = [
  GamePack.dice,
  GamePack.slots,
  GamePack.flip,
  GamePack.roulette,
  GamePack.plinko,
  GamePack.hilo,
  GamePack.mines,
  {
    id: 'test',
    meta: {
      name: 'Test',
      background: '#c578ff',
      description: `
        Test
      `,
    },
    app: () => <ExampleGame />,
  },
]
