import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { Event, GambaClient, GambaError2 } from 'gamba-core'
import React from 'react'
import { randomSeed } from './utils'

interface GambaProviderProps {
  creator: PublicKey | string
  onError?: (error: GambaError2, handler: Event) => void
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
      return client.userAccount.subscribe(
        (current, previous) => {
          if (current.decoded?.nonce.toNumber() === previous.decoded?.nonce.toNumber() + 1) {
            const nextSeed = randomSeed()
            console.log('🌱 Next seed:', nextSeed)
            setSeed(nextSeed)
          }
        },
      )
    }
    , [client.user],
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
  const { wallet, connected } = useWallet()
  const { connection } = useConnection()

  const creator = React.useMemo(
    () => new PublicKey(_creator),
    [_creator],
  )

  const walletAdapter = React.useMemo(
    () => {
      if (connected && wallet?.adapter)
        return wallet?.adapter
    }
    , [wallet, connected],
  )

  const client = React.useMemo(
    () => {
      return new GambaClient(
        connection,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        walletAdapter as any,
        // onError,
      )
    },
    [connection, walletAdapter],
  )

  React.useEffect(() => client.userAccount.listen(connection), [connection, client.userAccount])
  React.useEffect(() => client.houseAccount.listen(connection), [connection, client.houseAccount])
  React.useEffect(() => client.walletAccount.listen(connection), [connection, client.walletAccount])

  // React.useEffect(() => listenForPlayEvents(connection), [client])

  return (
    <GambaContext.Provider value={{ creator, client, seed, setSeed }}>
      <Inner>
        {children}
      </Inner>
    </GambaContext.Provider>
  )
}
