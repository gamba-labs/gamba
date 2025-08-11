import React from 'react'
import { GameBundle, useGame } from '.'
import { EffectTest } from './EffectTest'
import ErrorBoundary from './ErrorBoundary'
import { Portal, PortalTarget } from './PortalContext'
import { Button, ButtonProps } from './components/Button'
import { GambaCanvas } from './components/Canvas'
import ResponsiveSize from './components/ResponsiveSize'
import { Select } from './components/Select'
import { Switch } from './components/Switch'
import { TextInput } from './components/TextInput'
import { WagerInput } from './components/WagerInput'
import { WagerSelect } from './components/WagerSelect'
import { useSound } from './hooks/useSound'

interface GameContext {
  game: GameBundle
}

interface GameProps extends React.PropsWithChildren {
  game: GameBundle
  errorFallback?: React.ReactNode
}

export const GameContext = React.createContext<GameContext>({
  game: { id: 'unknown', app: null! },
})

function Game({ game, children, errorFallback }: GameProps) {
  return (
    <GameContext.Provider key={game.id} value={{ game }}>
      <ErrorBoundary fallback={errorFallback}>
        <React.Suspense fallback={null}>
          <game.app {...game.props} />
        </React.Suspense>
      </ErrorBoundary>
      {children}
    </GameContext.Provider>
  )
}

/**
 * PlayButton no longer looks at gamba.isPlaying;
 * it only disables if you pass `disabled={true}` yourself.
 */
export function PlayButton(props: ButtonProps) {
  return (
    <Portal target="play">
      <Button {...props} main>
        {props.children}
      </Button>
    </Portal>
  )
}

export const GambaUi = {
  useGame,
  useSound,
  Portal,
  PortalTarget,
  Effect: EffectTest,
  Button,
  Game,
  Responsive: ResponsiveSize,
  Canvas: GambaCanvas,
  WagerInput,
  WagerSelect,
  Switch,
  PlayButton,
  Select,
  TextInput,
}
