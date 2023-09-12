import { AccountInfo, Connection, PublicKey } from '@solana/web3.js'
import { Event } from './Event'

type NullableAccountInfo = AccountInfo<Buffer> | null

type DecodedAccountInfo<T> = { info: NullableAccountInfo, decoded: T | null }

export class Account<T> extends Event<[current: DecodedAccountInfo<T>, previous: DecodedAccountInfo<T>]> {
  publicKey: PublicKey
  private _debugIdentifier: string

  private current: DecodedAccountInfo<T> = { info: null, decoded: null }
  private previous: DecodedAccountInfo<T> = { info: null, decoded: null }
  private decoder: (info: NullableAccountInfo) => T | null

  get state() {
    return this.current.decoded
  }

  get info() {
    return this.current.info
  }

  constructor(
    publicKey: PublicKey,
    decoder: (info: NullableAccountInfo) => T | null,
    debugIdentifier = '-',
  ) {
    super()
    this.publicKey = publicKey
    this.decoder = decoder
    this._debugIdentifier = `${debugIdentifier}-${String(Math.random() * 1000 | 0)}`
  }

  /** Fetch and update state */
  async fetchState(connection: Connection) {
    const info = await connection.getAccountInfo(this.publicKey)
    this.update(info)
  }

  /**
   * Subscribes to account changes
  */
  listen(connection: Connection) {
    this.fetchState(connection)

    const listener = connection.onAccountChange(this.publicKey, (info) => {
      this.update(info)
    })

    return () => {
      connection.removeAccountChangeListener(listener)
    }
  }

  /**
   * Register a callback to be invoked whenever the account changes
   * @param callback Function to invoke whenever the account is changed
   * @return promise that resolves / rejects when the callback function returns a result object
   */
  anticipate<U>(
    callback: (current: DecodedAccountInfo<T>, previous: DecodedAccountInfo<T>) => U | undefined,
  ) {
    // console.debug(this._debugIdentifier, 'Wait for state')
    return new Promise<U>((resolve, reject) => {
      const listener = (current: DecodedAccountInfo<T>, previous: DecodedAccountInfo<T>) => {
        // console.debug(this._debugIdentifier, 'Listener!')
        try {
          const handled = callback(current, previous)
          if (handled !== undefined) {
            unsubscribe()
            resolve(handled)
          }
        } catch (err) {
          unsubscribe()
          reject(err)
        }
      }
      const unsubscribe = this.subscribe(listener)
      listener(this.current, this.previous)
    })
  }

  private update(info: NullableAccountInfo) {
    const decoded = this.decoder(info)
    this.current = { info, decoded }
    this.emit(this.current, this.previous)
    this.previous = this.current
  }
}
