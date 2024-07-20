import { useGamba } from 'gamba-react-v2'
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

export const GameContext = React.createContext<GameContext>({ game: { id: 'unknown', app: null! } })

function Game({ game, children, errorFallback }: GameProps) {
  return (
    <GameContext.Provider key={game.id} value={{ game }}>
      <ErrorBoundary fallback={errorFallback}>
        <React.Suspense fallback={<React.Fragment />}>
          <game.app {...game.props} />
        </React.Suspense>
      </ErrorBoundary>
      {children}
    </GameContext.Provider>
  )
}

export function PlayButton(props: ButtonProps) {
  const gamba = useGamba()
  return (
    <Portal target="play">
      <Button
        disabled={gamba.isPlaying || props.disabled}
        onClick={props.onClick}
        main
      >
        {props.children}
      </Button>
    </Portal>
  )
}

export const GambaUi = {
  useGame,
  useSound,
  Portal,
  PortalTarget: PortalTarget,
  Effect: EffectTest,
  Button,
  Game,
  Responsive: ResponsiveSize,
  Canvas: GambaCanvas,
  WagerInput: WagerInput,
  /**
   * @deprecated Use WagerInput with "options" prop
   */
  WagerSelect: WagerSelect,
  Switch: Switch,
  PlayButton,
  Select: Select,
  TextInput: TextInput,
}
