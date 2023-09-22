import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { GambaClient } from 'gamba-core'
import React from 'react'
import { SimulatePlayParams, randomSeed } from './utils'

interface GambaProviderProps {
  /**
   * The address where a fee should be sent to
   */
  creator: PublicKey | string
  /**
   * Fee sent to the creator address for every play (0.02 = 2%)
   * See `useGamba().house.defaultCreatorFee` to see default.
   * See `useGamba().house.maxCreatorFee` to see highest value.
   */
  creatorFee?: number
  /**
   * The play method in `useGamba` will simulate bets. Good for testing game UIs.
   * Note that this will not simulate potential errors such as maximum payout exceeded, or insufficent balance.
   * */
  fakePlay?: SimulatePlayParams
}

interface GambaContext {
  creator: PublicKey
  creatorFee?: number
  client: GambaClient
  seed: string
  setSeed: (seed: string) => void
  fakePlay?: SimulatePlayParams
}

export const GambaContext = React.createContext<GambaContext>(null!)

/** Updates client seed when nonce advances */
function Inner({ children }: React.PropsWithChildren) {
  const { client, setSeed } = React.useContext(GambaContext)

  React.useEffect(
    () => {
      return client.onChange(
        (current, previous) => {
          if (previous.user.nonce > 0 && current.user.nonce === previous.user.nonce + 1) {
            const nextSeed = randomSeed()
            console.log('🌱 Seed: %s (nonce: %d)', nextSeed, current.user.nonce)
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

export function Gamba(props: React.PropsWithChildren<GambaProviderProps>) {
  const { children, creatorFee, creator: _creator, fakePlay } = props
  const [seed, setSeed] = React.useState(randomSeed())
  const _wallet = useWallet()
  const { connection } = useConnection()

  if (!_creator) {
    throw new Error('No creator address provided to Gamba.')
  }

  const creator = React.useMemo(
    () => new PublicKey(_creator),
    [_creator],
  )

  const walletAdapter = React.useMemo(
    () => {
      if (_wallet?.connected && _wallet?.wallet?.adapter?.publicKey) {
        return _wallet?.wallet?.adapter
      }
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
    <GambaContext.Provider value={{ creator, client, seed, setSeed, fakePlay, creatorFee }}>
      <Inner>
        {children}
      </Inner>
    </GambaContext.Provider>
  )
}
