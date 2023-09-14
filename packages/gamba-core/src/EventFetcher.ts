import { Connection, PublicKey } from '@solana/web3.js'
import { Event } from './Event'
import { PROGRAM_ID } from './constants'
import { ParsedGambaTransaction, fetchTransactionsWithEvents, parseTransactionEvents } from './utils'

export interface EventFetcherParams {
  /**
   * Address to seek for events in.
   * If none is passed the entire Program will be searched
   */
  address?: PublicKey
  /**
   * Wether to store transactions in memory
   */
  storeTransactions?: boolean
}

type Required<T> = {[P in keyof T]-?: T[P]}

/**
 *
 */
export class EventFetcher {
  private connection: Connection

  private params: Required<EventFetcherParams>

  private pubsub = new Event<[ParsedGambaTransaction[]]>

  private logSubscription?: ReturnType<typeof this.connection.onLogs>

  onEvents(...handler: (Parameters<typeof this.pubsub.subscribe>)) {
    return this.pubsub.subscribe(...handler)
  }

  latestSig?: string
  earliestSig?: string
  private latestTime = -Infinity
  private earliestTime = Infinity

  transactions: ParsedGambaTransaction[] = []

  constructor(
    connection: Connection,
    params?: EventFetcherParams,
  ) {
    this.connection = connection
    this.params = {
      address: PROGRAM_ID,
      storeTransactions: true,
      ...params,
    }
  }

  static create(connection: Connection, params?: EventFetcherParams) {
    return new EventFetcher(connection, params)
  }

  private handleEvents(transactions: ParsedGambaTransaction[]) {
    // const latest = transactions.at()
    if (transactions.length) {
      const latest = transactions[0]
      const earliest = transactions[transactions.length - 1]

      if (earliest.time < this.earliestTime) {
        this.earliestSig = earliest.signature
        this.earliestTime = earliest.time
      }

      if (latest.time > this.latestTime) {
        this.latestSig = latest.signature
        this.latestTime = latest.time
      }

      const eventTransactions = transactions.filter((x) => !!x.event.gameResult)

      if (this.params.storeTransactions) {
        this.transactions = [
          ...this.transactions,
          ...eventTransactions,
        ].sort((a, b) => b.time - a.time)
      }

      this.pubsub.emit(eventTransactions)
    }
  }

  /**
   * Fetch newer transactions than the most recent one fetched
   */
  public async fetchNewer() {
    if (!this.latestSig) {
      throw new Error('No previous transactions fetched')
    }
    const parsed = await fetchTransactionsWithEvents(
      this.connection,
      this.params.address, {
        limit: 20,
        until: this.latestSig,
      })
    this.handleEvents(parsed)
    return parsed
  }

  /**
   * Fetch older transactions than the earliest one fetched
   */
  public async fetch({ signatureLimit = 20 }: {signatureLimit?: number}) {
    const parsed = await fetchTransactionsWithEvents(
      this.connection,
      this.params.address, {
        limit: signatureLimit,
        before: this.earliestSig,
      })
    this.handleEvents(parsed)
    return parsed
  }

  public listen() {
    if (this.logSubscription !== undefined)
      throw new Error('Already listening')

    console.debug('🛜 Listen for events', this.params.address.toBase58())

    this.logSubscription = this.connection.onLogs(
      this.params.address,
      (logs) => {
        if (logs.err) {
          return
        }
        const events = parseTransactionEvents(logs.logs)
        const gameResult = events.gameResult ?? events.gameResultOld
        this.handleEvents([{
          signature: logs.signature,
          time: Date.now(),
          event: { gameResult },
        }])
      },
    )

    return () => {
      console.debug('🛜❌ Remove listener')
      if (this.logSubscription !== undefined)
        this.connection.removeOnLogsListener(this.logSubscription)
    }
  }
}
