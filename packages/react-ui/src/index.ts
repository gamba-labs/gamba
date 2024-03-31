import React from 'react'
import { GambaPlatformContext } from './GambaPlatformProvider'
import { useTokenMeta } from './hooks'

export * from './EffectTest'
export * from './ErrorBoundary'
export * from './GambaPlatformProvider'
export * from './TokenMetaProvider'
export * from './GameContext'
export * from './components/Canvas'
export * from './components/TokenValue'
export * from './hooks'
export * from './makeHeliusTokenFetcher'

export interface GameBundle<T = any> {
  id: string
  app: any
  meta?: T
  props?: any
}

export function useWagerInput(initial?: number) {
  const [_wager, setWager] = React.useState(initial)
  const context = React.useContext(GambaPlatformContext)
  const token = useTokenMeta(context.selectedPool.token)
  return [_wager ?? token.baseWager, setWager] as const
}

/** @deprecated */
export function useTokenList() {
  return []
}
