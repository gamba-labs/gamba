import React from 'react'
import { GameBundle } from '../types'

export const GameUiContext = React.createContext<{
  game: GameBundle
  // loading: boolean
  // error?: Error
}>(null!)

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
