import { PublicKey } from '@solana/web3.js'
import { GambaPlayInput, useBalance, useGamba, useGambaPlay, usePool, useWalletAddress } from 'gamba-react-v2'
import React, { useContext } from 'react'
import { GambaPlatformContext, GameBundle, useTokenMeta } from '.'
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

export const GameContext = React.createContext<GameContext>(null!)

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

function useGameContext() {
  return React.useContext(GameContext)
}

function useGame() {
  const game = useGameContext()
  const context = React.useContext(GambaPlatformContext)
  const balances = useUserBalance()
  const gambaPlay = useGambaPlay()

  const play = async (input: Pick<GambaPlayInput, 'wager' | 'bet' | 'metadata'>) => {
    const metaArgs = input.metadata ?? []
    return await gambaPlay({
      ...input,
      creator: new PublicKey(context.platform.creator),
      metadata: ['0', game.game.id, ...metaArgs],
      clientSeed: context.clientSeed,
      creatorFee: context.defaultCreatorFee,
      jackpotFee: context.defaultJackpotFee,
      token: context.token,
      useBonus: balances.bonusBalance > 0,
    })
  }

  return {
    play,
    game: game.game,
  }
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

const useCurrentPool = () => {
  const token = useContext(GambaPlatformContext).token
  return usePool(token)
}

const useCurrentToken = () => {
  const token = useContext(GambaPlatformContext).token
  const meta = useTokenMeta(token)
  return meta
}

const useUserBalance = () => {
  const token = useContext(GambaPlatformContext).token
  const userAddress = useWalletAddress()
  return useBalance(userAddress, token)
}

export const GambaUi = {
  useGame,
  useGameContext,
  useSound,
  Portal,
  PortalTarget: PortalTarget,
  Effect: EffectTest,
  Button,
  Game,
  Responsive: ResponsiveSize,
  Canvas: GambaCanvas,
  WagerInput: WagerInput,
  WagerSelect: WagerSelect,
  Switch: Switch,
  PlayButton,
  Select: Select,
  TextInput: TextInput,
  useCurrentPool,
  useUserBalance,
  useCurrentToken,
}
