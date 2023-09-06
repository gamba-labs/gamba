import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { GambaClient } from 'gamba-core'
import React from 'react'
import { randomSeed } from './utils'

interface GambaProviderProps {
  creator?: PublicKey | string
}

interface GambaContext {
  creator?: PublicKey | string
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
export function Gamba({ children, creator }: React.PropsWithChildren<GambaProviderProps>) {
  const [seed, setSeed] = React.useState(randomSeed())
  const { wallet, connected } = useWallet()
  const { connection } = useConnection()

  const client = React.useMemo(
    () => {
      const _wallet = (() => {
        if (connected && wallet?.adapter?.publicKey)
          return wallet?.adapter
      })()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new GambaClient(connection, _wallet as any)
    }
    , [connection, wallet, connected],
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
