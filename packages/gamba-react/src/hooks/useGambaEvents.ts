import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { GameResult, PROGRAM_ID, ParsedGambaTransaction, fetchTransactionsWithEvents, listenForEvents } from 'gamba-core'
import React from 'react'

export interface UseGambaEventsParams {
  address?: PublicKey
  signatureLimit?: number
  listen?: boolean
}

export type GambaTransactionWithGameResult = Omit<ParsedGambaTransaction, 'event'> & {event: {gameResult: GameResult}}

/**
 * Fetches recent games made on provided address (Defaults to entire Gamba program) and listens for new ones
 */
export function useGambaEvents(props: UseGambaEventsParams = {}) {
  const { connection } = useConnection()
  const [transactions, setTransactions] = React.useState<ParsedGambaTransaction[]>([])
  const {
    listen = true,
    signatureLimit = 40,
    address = PROGRAM_ID,
  } = props

  const results = React.useMemo(() =>
    transactions.filter((x) => !!x.event.gameResult) as GambaTransactionWithGameResult[]
  , [transactions])

  React.useEffect(
    () => {
      fetchTransactionsWithEvents(
        connection,
        address,
        { limit: signatureLimit },
      ).then((x) => setTransactions(x))
    }
    , [connection, signatureLimit, address],
  )

  React.useEffect(() => {
    if (listen) {
      return listenForEvents(connection, address, (event) => setTransactions((events) => [event, ...events]))
    }
  }, [connection, address, listen])

  return results
}
