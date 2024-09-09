import { PublicKey } from '@solana/web3.js'
import React from 'react'
import { GambaPlatformContext } from './GambaPlatformProvider'
import { TokenMetaContext } from './TokenMetaProvider'
import { useTokenMeta } from './hooks'

export * from './EffectTest'
export * from './ErrorBoundary'
export * from './GambaPlatformProvider'
export * from './GameContext'
export * from './TokenMetaProvider'
export * from './components/Canvas'
export * from './components/TokenValue'
export * from './hooks'
export * from './makeHeliusTokenFetcher'
export * from './referral/ReferralContext'
export * from './referral/useReferral'

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

/** @deprecated Use <TokenMetaProvider /> */
export function useTokenList() {
  return React.useContext(TokenMetaContext).tokens ?? []
}

/** @deprecated Use <TokenMetaProvider /> */
export const GambaStandardTokens = {
  fake: {
    mint: new PublicKey('FakeCDoCX1NWywV9m63fk7gmV9S4seMoyqzcNYEmRYjy'),
    name: 'Fake Money',
    symbol: 'FAKE',
    decimals: 9,
    baseWager: 1 * 1e9,
  },
  sol: {
    mint: new PublicKey('So11111111111111111111111111111111111111112'),
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
    baseWager: 0.01 * 1e9,
  },
  usdc: {
    mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
    baseWager: .5 * 1e6,
  },
  guac: {
    mint: new PublicKey('AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR'),
    name: 'Guacamole',
    symbol: 'GUAC',
    decimals: 5,
    baseWager: 1000000 * 1e5,
  },
}
