import { AccountInfo, Connection, PublicKey } from '@solana/web3.js'

type NullableAccountInfo = AccountInfo<Buffer> | null

type DecodedAccountInfo<T> = { info: NullableAccountInfo, decoded: T | null }

export class StateAccount<T> {
  publicKey: PublicKey
  _debugIdentifier = '-'
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
  ) {
    this.publicKey = publicKey
    this.decoder = decoder
  }

  /** Fetch and update state */
  async fetchState(connection: Connection) {
    const info = await connection.getAccountInfo(this.publicKey)
    this.update(info)
  }

  /** Listen for Account changes */
  listen(connection: Connection) {
    this.fetchState(connection)

    // const pollInterval = setInterval(() => {
    //   connection.getAccountInfo(this.publicKey).then((info) => {
    //     console.debug(this._debugIdentifier, 'POLL', info?.lamports)
    //     handle(info)
    //   })
    // }, 3000)

    const listener = connection.onAccountChange(this.publicKey, (info, context) => {
      this.update(info)
    })

    return () => {
      console.debug(this._debugIdentifier, 'STOP')
      connection.removeAccountChangeListener(listener)
      // clearTimeout(pollInterval)
    }
  }

  onChange(callback: (current: DecodedAccountInfo<T>, previous: DecodedAccountInfo<T>) => void) {
    const handler = ([current, previous]: [DecodedAccountInfo<T>, DecodedAccountInfo<T>]) => {
      console.debug(this._debugIdentifier, 'onChange')
      callback(current, previous)
    }

    callback(this.current, this.previous)

    const index = this.listeners.push(handler)

    return () => {
      this.listeners.splice(index, 1)
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
          if (handled) {
            removeListener()
            resolve(handled)
          }
        } catch (err) {
          removeListener()
          console.error('State error', err)
          reject(err)
        }
      }
      const listenerIndex = this.listeners.push(listener)

      const removeListener = () => this.listeners.splice(listenerIndex, 1)

      // run listener with current state
      listener([this.current, this.previous])

      // setTimeout(() => {
      //   removeListener()
      //   reject(GambaError.FAILED_CREATING_USER_ACCOUNT)
      // }, options.timeout)
    })
  }

  private update(info: NullableAccountInfo) {
    if (JSON.stringify(info) === JSON.stringify(this.current?.info)) {
      console.debug(this._debugIdentifier, 'Received same state')
      return
    }
    const decoded = this.decoder(info)
    this.current = { info, decoded }

    for (const listener of this.listeners) {
      listener([
        this.current,
        this.previous,
      ])
    }

    this.previous = this.current
  }
}
