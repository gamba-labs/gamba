import { PublicKey } from '@solana/web3.js'
import React from 'react'
import { GameBundle, TokenListProvider, TokenMeta } from '.'
import { PortalProvider } from './PortalContext'

interface PlatformMeta {
  name: string
  creator: PublicKey
}

interface GambaPlatformContext {
  platform: PlatformMeta
  games: GameBundle[]
  token: PublicKey
  defaultCreatorFee: number
  defaultJackpotFee: number
  setToken: (token: PublicKey) => void
  clientSeed: string
  setClientSeed: (clientSeed: string) => void
}

export const GambaPlatformContext = React.createContext<GambaPlatformContext>(null!)

interface GambaPlatformProviderProps extends React.PropsWithChildren {
  creator: string | PublicKey
  tokens?: TokenMeta[]
  games: GameBundle[]
  /** How much the player should pay in fees to the platform */
  defaultCreatorFee?: number
  /** How much the player should pay in fees to play for the jackpot in every game. 0.001 = 0.1% */
  defaultJackpotFee?: number
}

export function GambaPlatformProvider(props: GambaPlatformProviderProps) {
  const { creator, children, games, tokens = [] } = props
  const [token, setToken] = React.useState(new PublicKey('So11111111111111111111111111111111111111112'))
  const [clientSeed, setClientSeed] = React.useState(String(Math.random() * 1e9 | 0))
  const defaultJackpotFee = props.defaultJackpotFee ?? 0.001
  const defaultCreatorFee = props.defaultCreatorFee ?? 0.01
  return (
    <GambaPlatformContext.Provider
      value={{
        platform: {
          name: '',
          creator: new PublicKey(creator),
        },
        games,
        token,
        setToken,
        clientSeed,
        setClientSeed,
        defaultJackpotFee,
        defaultCreatorFee,
      }}
    >
      <TokenListProvider tokens={tokens}>
        <PortalProvider>
          {children}
        </PortalProvider>
      </TokenListProvider>
    </GambaPlatformContext.Provider>
  )
}
