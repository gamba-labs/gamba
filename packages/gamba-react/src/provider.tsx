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
      return client.user.onChange(
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
          return wallet?.adapter as any
      })()
      return new GambaClient(connection, _wallet)
    }
    , [connection, wallet, connected],
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

// /**
//  * GambaProvider with ConnectionProvider and WalletProvider
//  */
// interface ConnectionProps {
//   wallet?: Omit<WalletProviderProps, 'children'>
//   connection?: {
//     endpoint: string
//     config?: ConnectionConfig
//   }
// }
// export function Gamba({ children, connection: connectionProps, wallet, ...rest }: React.PropsWithChildren<GambaProviderProps & ConnectionProps>) {
//   const endpoint = connectionProps?.endpoint ?? ''
//   const connectionParams: ConnectionConfig = {
//     commitment: 'processed',
//     ...connectionProps?.config,
//   }
//   const connection = React.useMemo(() => new Connection(endpoint, connectionParams), [endpoint, connectionParams])

//   return (
//     <ConnectionContext.Provider value={{ connection }}>
//       <WalletProvider autoConnect wallets={[]} {...wallet}>
//         <GambaProvider {...rest}>
//           {children}
//         </GambaProvider>
//       </WalletProvider>
//     </ConnectionContext.Provider>
//   )
// }
