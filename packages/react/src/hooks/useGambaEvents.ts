import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { AnyGambaEvent, GambaEventType, GambaTransaction, PROGRAM_ID, fetchGambaTransactions } from 'gamba-core-v2'
import React from 'react'
import { useGambaProgram } from '.'

export interface UseGambaEventsParams {
  address?: PublicKey
  signatureLimit?: number
  listen?: boolean
}

export function useGambaEventListener<T extends GambaEventType>(
  eventName: T,
  callback: (event: GambaTransaction<T>) => void,
  deps: React.DependencyList = [],
) {
  const program = useGambaProgram()

  React.useEffect(() => {
    const listener = program.addEventListener(
      eventName,
      (data, slot, signature) => {
        const event = {
          signature,
          time: Date.now(),
          name: eventName,
          data,
        }
        callback(event)
      },
    )
    return () => {
      program.removeEventListener(listener)
    }
  }, [eventName, program, ...deps])
}

/**
 * Fetches previous events from the provided address (Defaults to creator set in <GambaProvider />)
 */
export function useGambaEvents<T extends GambaEventType>(
  eventName: T,
  props: {address?: PublicKey, signatureLimit?: number} = {},
) {
  const { signatureLimit = 30 } = props
  const { connection } = useConnection()
  const [events, setEvents] = React.useState<AnyGambaEvent[]>([])
  const address = props.address ?? PROGRAM_ID

  React.useEffect(
    () => {
      fetchGambaTransactions(
        connection,
        address,
        { limit: signatureLimit },
      ).then((x) => setEvents(x))
    }
    , [connection, signatureLimit, address],
  )

  return React.useMemo(
    () => events.filter((x) => x.name === eventName),
    [eventName, events],
  ) as GambaTransaction<T>[]
}
