import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { GambaClient } from 'gamba-core'
import React from 'react'
import { randomSeed } from './utils'

interface GambaProviderProps {
  creator: PublicKey | string
}

interface GambaContext {
  creator: PublicKey
  client: GambaClient
  seed: string
  setSeed: (seed: string) => void
}

export const GambaContext = React.createContext<GambaContext>(null!)

/**
 * Updates client seed when nonce advances
 */
function Inner({ children }: React.PropsWithChildren) {
  const { client, setSeed } = React.useContext(GambaContext)

  React.useEffect(
    () => {
      return client.onChange(
        (current, previous) => {
          if (current.user.nonce === previous.user.nonce + 1) {
            const nextSeed = randomSeed()
            console.log('🌱 Next seed:', nextSeed, current.user.nonce, previous.user.nonce)
            setSeed(nextSeed)
          }
        },
      )
    }
    , [client],
  )

  return (
    <>{children}</>
  )
}

/**
 *
 */
export function Gamba({ children, creator: _creator }: React.PropsWithChildren<GambaProviderProps>) {
  const [seed, setSeed] = React.useState(randomSeed())
  const _wallet = useWallet()
  const { connection } = useConnection()

  const creator = React.useMemo(
    () => new PublicKey(_creator),
    [_creator],
  )

  const walletAdapter = React.useMemo(
    () => {
      if (_wallet?.connected && _wallet?.wallet?.adapter?.publicKey)
        return _wallet?.wallet?.adapter
    }
    , [_wallet, connection],
  )

  const client = React.useMemo(
    () => {
      return new GambaClient(
        connection,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        walletAdapter as any,
      )
    },
    [connection, walletAdapter],
  )

  React.useEffect(() => client.listen(), [client])

  return (
    <GambaContext.Provider value={{ creator, client, seed, setSeed }}>
      <Inner>
        {children}
      </Inner>
    </GambaContext.Provider>
  )
}
