import { AccountInfo, Connection, PublicKey } from '@solana/web3.js'

type NullableAccountInfo = AccountInfo<Buffer> | null

type DecodedAccountInfo<T> = { info: NullableAccountInfo, decoded: T | null }

export class StateAccount<T> {
  publicKey: PublicKey
  private _debugIdentifier: string

  private current: DecodedAccountInfo<T> = { info: null, decoded: null }
  private previous: DecodedAccountInfo<T> = { info: null, decoded: null }
  private decoder: (info: NullableAccountInfo) => T | null

  /** Registered callbacks */
  private listeners = new Array<(payload: [current: DecodedAccountInfo<T>, previous: DecodedAccountInfo<T>]) => void>()

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
    this.publicKey = publicKey
    this.decoder = decoder
    this._debugIdentifier = `${debugIdentifier}-${String(Math.random() * 1000 | 0)}`
  }

  /** Fetch and update state */
  async fetchState(connection: Connection) {
    const info = await connection.getAccountInfo(this.publicKey)
    this.update(info)
  }

  private log(...args: any[]) {
    // console.debug(this._debugIdentifier, ...args)
  }

  /** Listen for account changes */
  listen(connection: Connection) {
    this.fetchState(connection)

    // const pollInterval = setInterval(() => {
    //   connection.getAccountInfo(this.publicKey).then((info) => {
    //     console.debug(this._debugIdentifier, 'POLL', info?.lamports)
    //     handle(info)
    //   })
    // }, 3000)

    this.log('Start listening')

    const listener = connection.onAccountChange(this.publicKey, (info) => {
      this.update(info)
    })

    return () => {
      this.log('❌ Stop listening')
      connection.removeAccountChangeListener(listener)
      // clearTimeout(pollInterval)
    }
  }

  onChange(callback: (current: DecodedAccountInfo<T>, previous: DecodedAccountInfo<T>) => void) {
    const handler = ([current, previous]: [DecodedAccountInfo<T>, DecodedAccountInfo<T>]) => {
      callback(current, previous)
    }

    callback(this.current, this.previous)

    this.listeners.push(handler)

    this.log('onChange', this.listeners.length)

    return () => {
      this.log('❌ onChange', this.listeners.length)
      this.listeners.splice(this.listeners.indexOf(handler), 1)
    }
  }

  /**
   * Register a callback to be invoked whenever the account changes
   * @param callback Function to invoke whenever the account is changed
   * @return promise that resolves / rejects when the callback function returns a result object
   */
  waitForState<U>(
    callback: (current: DecodedAccountInfo<T>, previous: DecodedAccountInfo<T>) => U | undefined,
    // options = { timeout: 60000 },
  ) {
    return new Promise<U>((resolve, reject) => {
      const listener = ([current, previous]: [current: DecodedAccountInfo<T>, previous: DecodedAccountInfo<T>]) => {
        try {
          const handled = callback(current, previous)
          if (handled !== undefined) {
            removeListener()
            resolve(handled)
          }
        } catch (err) {
          removeListener()
          reject(err)
        }
      }

      this.listeners.push(listener)

      this.log('waitForState', this.listeners.length)

      const removeListener = () => {
        const removed = this.listeners.splice(this.listeners.indexOf(listener), 1)
        this.log('❌ waitForState', removed, this.listeners.length)
      }

      // run listener with current state
      listener([this.current, this.previous])

      // setTimeout(() => {
      //   removeListener()
      //   reject()
      // }, options.timeout)
    })
  }

  private update(info: NullableAccountInfo) {
    // if (JSON.stringify(info) === JSON.stringify(this.current?.info)) {
    //   console.debug(this._debugIdentifier, 'Received same state')
    //   return
    // }

    const decoded = this.decoder(info)

    this.current = { info, decoded }

    this.log('Listeners', this.listeners.length)

    for (const listener of this.listeners) {
      listener([
        this.current,
        this.previous,
      ])
    }

    this.previous = this.current
  }
}
