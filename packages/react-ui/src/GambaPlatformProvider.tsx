import { PublicKey } from '@solana/web3.js'
import { NATIVE_MINT } from 'gamba-core-v2'
import React from 'react'
import { GameBundle } from '.'
import { PortalProvider } from './PortalContext'

interface PlatformMeta {
  name: string
  creator: PublicKey
}

export interface PoolToken {
  token: PublicKey
  authority?: PublicKey
}

export interface GambaPlatformContext {
  platform: PlatformMeta
  selectedPool: PoolToken
  defaultCreatorFee: number
  defaultJackpotFee: number
  setDefaultJackpotFee: (defaultJackpotFee: number) => void
  setPool: (tokenMint: PublicKey | string, authority?: PublicKey | string) => void
  setToken: (tokenMint: PublicKey | string) => void
  clientSeed: string
  setClientSeed: (clientSeed: string) => void
}

export const GambaPlatformContext = React.createContext<GambaPlatformContext>(null!)

interface GambaPlatformProviderProps extends React.PropsWithChildren {
  creator: PublicKey | string
  /** @deprecated */
  games?: GameBundle[]
  /** @deprecated */
  tokens?: any[]
  defaultPool?: PoolToken
  /** How much the player should pay in fees to the platform */
  defaultCreatorFee?: number
  /** How much the player should pay in fees to play for the jackpot in every game. 0.001 = 0.1% */
  defaultJackpotFee?: number
  /**  */
}

export function GambaPlatformProvider(props: GambaPlatformProviderProps) {
  const { creator, children } = props
  const [selectedPool, setSelectedPool] = React.useState<PoolToken>(props.defaultPool ?? { token: NATIVE_MINT })
  const [clientSeed, setClientSeed] = React.useState(String(Math.random() * 1e9 | 0))
  const [defaultJackpotFee, setDefaultJackpotFee] = React.useState(props.defaultJackpotFee ?? 0.001)
  const defaultCreatorFee = props.defaultCreatorFee ?? 0.01

  const setPool = (
    tokenMint: PublicKey | string,
    authority: PublicKey | string = new PublicKey('11111111111111111111111111111111'),
  ) => {
    setSelectedPool({
      token: new PublicKey(tokenMint),
      authority: new PublicKey(authority),
    })
  }

  const setToken = (tokenMint: PublicKey | string) => {
    setPool(tokenMint)
  }

  return (
    <GambaPlatformContext.Provider
      value={{
        platform: {
          name: '',
          creator: new PublicKey(creator),
        },
        selectedPool,
        setToken,
        setPool,
        clientSeed,
        setClientSeed,
        defaultJackpotFee,
        setDefaultJackpotFee,
        defaultCreatorFee,
      }}
    >
      <PortalProvider>
        {children}
      </PortalProvider>
    </GambaPlatformContext.Provider>
  )
}
