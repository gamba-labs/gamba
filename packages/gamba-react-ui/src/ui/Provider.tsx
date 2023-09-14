import React from 'react'
import { GameBundle } from '../types'

export interface GameUiContext {
  game: GameBundle
}

export const GameUiContext = React.createContext<GameUiContext>(null!)

interface Props extends React.PropsWithChildren {
  game: GameBundle
}

export default function Provider({ game, children }: Props) {
  return (
    <GameUiContext.Provider value={{ game }}>
      {children}
    </GameUiContext.Provider>
  )
}
