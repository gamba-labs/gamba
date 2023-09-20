import { Connection, PublicKey } from '@solana/web3.js'
import { PROGRAM_ID, ParsedGambaTransaction, fetchTransactionsWithEvents, listenForEvents } from 'gamba'
import { Event } from './Event'

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
    _params: EventFetcherParams = {},
  ) {
    const { address = PROGRAM_ID, ...params } = _params
    this.connection = connection
    this.params = {
      storeTransactions: true,
      address,
      ...params,
    }
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

      // todo
      const eventTransactions = transactions.filter((x) => {
        return !!x.event.gameResult && (x.event.gameResult.creator.equals(this.params.address) || this.params.address.equals(PROGRAM_ID))
      })

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
    return listenForEvents(
      this.connection,
      this.params.address,
      (event) => this.handleEvents([event]),
    )
  }
}
