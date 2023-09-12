// import { GameResult } from 'gamba-core'
import React from 'react'

export interface GameBundle {
  creator: string
  name: string
  short_name: string
  theme_color?: string
  description?: string
  image?: string
  links?: {url: string, title: string}[]
  app: (() => JSX.Element) | React.LazyExoticComponent<() => JSX.Element>
}

// export interface WagerGameControl {
//   type: 'wager'
//   onChange: (wager: number) => void
//   value: number

//   bet?: number[]
// }

// export interface ButtonGameControl {
//   type: 'button'
//   disabled?: boolean
//   onClick: () => void
// }

// export interface PlayGameControl {
//   type: 'play'

//   params: {
//     bet: number[]
//     wager: number
//   }

//   onClick?: () => void
//   onStart?: () => void
//   onResult?: (result: GameResult) => void
//   onError?: (err: unknown) => void
// }

// export interface CustomGameControl {
//   type: 'custom'
//   element: JSX.Element
// }

// export type GameControl = WagerGameControl | PlayGameControl | ButtonGameControl | CustomGameControl

// export type GameControlDefinition = {[s: string]: GameControl}
