import React from 'react'
import { GambaPlatformContext } from './GambaPlatformProvider'
import { useTokenMeta } from './TokenListContext'

export * from './EffectTest'
export * from './ErrorBoundary'
export * from './GambaPlatformProvider'
export * from './GameContext'
export * from './TokenListContext'
export * from './components/TokenValue'
export * from './hooks'
export * from './tokens'

export interface GameBundle<T = any> {
  id: string
  app: any
  meta?: T
  props?: any
}

export function useWagerInput(initial?: number) {
  const [_wager, setWager] = React.useState(initial)
  const context = React.useContext(GambaPlatformContext)
  const token = useTokenMeta(context.token)
  return [_wager ?? token.baseWager, setWager] as const
}
