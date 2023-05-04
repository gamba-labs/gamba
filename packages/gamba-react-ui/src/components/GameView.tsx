import { Game } from 'gamba-react'
import React from 'react'
import { GameBundle } from '../types'
import { ErrorBoundary } from './ErrorBoundary'
import { Loader } from './Loader'

const DefaultLoadScreen = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
      <Loader />
    </div>
  )
}

interface Props {
  game: GameBundle
  /**
   * Component to show while the game is loading
   */
  loader?: JSX.Element
  /**
   * Component to show if an error occurs in the game
   */
  error?: JSX.Element
}

export function GameView({ game, loader, error }: Props) {
  return (
    <ErrorBoundary error={error}>
      <React.Suspense fallback={loader ?? <DefaultLoadScreen />}>
        <Game creator={game.creator}>
          <game.app />
        </Game>
      </React.Suspense>
    </ErrorBoundary>
  )
}
