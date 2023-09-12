import React from 'react'
import ErrorBoundary from './ErrorBoundary'
import { GameUiContext } from './Provider'

const DefaultLoadScreen = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
      Loading...
    </div>
  )
}

const DefaultError = () => {
  return (
    <div style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', textAlign: 'center' }}>
      <div>
        <h1>Error</h1>
        <p>
          Don{'\''}t worry.
          <br />
          This is only a client-side error and does not affect your user data.
        </p>
      </div>
    </div>
  )
}

interface Props {
  /**
   * Component to show while the game is loading
   */
  loader?: JSX.Element
  /**
   * Component to show if an error occurs in the game
   */
  error?: JSX.Element
}

/**
 * Renders the game component
 */
export default function View({ loader, error }: Props) {
  const { game } = React.useContext(GameUiContext)

  return (
    <ErrorBoundary
      key={game.short_name}
      fallback={error ?? <DefaultError />}
    >
      <React.Suspense fallback={loader ?? <DefaultLoadScreen />}>
        <game.app />
      </React.Suspense>
    </ErrorBoundary>
  )
}
