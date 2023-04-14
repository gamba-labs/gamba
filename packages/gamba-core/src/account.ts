import { AccountInfo, Connection, PublicKey } from '@solana/web3.js'
import { Signal } from '@hmans/signal'

type NullableAccountInfo = AccountInfo<Buffer> | null

type DecodedAccountInfo<T> = { info: NullableAccountInfo, decoded: T | null }

export class StateAccount<T> {
  publicKey: PublicKey
  _debugIdentifier = '-'
  private current: DecodedAccountInfo<T> = { info: null, decoded: null }
  private previous: DecodedAccountInfo<T> = { info: null, decoded: null }
  private decoder: (info: NullableAccountInfo) => T | null
  private signal = new Signal<[current: DecodedAccountInfo<T>, previous: DecodedAccountInfo<T>]>()

  get state() {
    return this.current.decoded
  }

  get info() {
    return this.current.info
  }

  /** Fetch and update state */
  async fetchState(connection: Connection) {
    connection.getAccountInfo(this.publicKey).then((info) => {
      if (JSON.stringify(info) !== JSON.stringify(this.current.info)) {
        this.update(info)
      }
    })
  }

  /** Listen for Account changes */
  listen(connection: Connection) {
    console.debug(this._debugIdentifier, 'LISTEN')

    const handle = (info: NullableAccountInfo) => {
      if (JSON.stringify(info) !== JSON.stringify(this.current.info)) {
        this.update(info)
      }
    }

    connection.getAccountInfo(this.publicKey).then((info) => {
      console.debug(this._debugIdentifier, 'Initial', info?.lamports)
      handle(info)
    })

    // const pollInterval = setInterval(() => {
    //   connection.getAccountInfo(this.publicKey).then((info) => {
    //     console.debug(this._debugIdentifier, 'POLL', info?.lamports)
    //     handle(info)
    //   })
    // }, 3000)

    const listener = connection.onAccountChange(this.publicKey, (info) => {
      console.debug(this._debugIdentifier, 'Update', info?.lamports)
      handle(info)
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
    this.signal.add(handler)
    return () => {
      this.signal.remove(handler)
    }
  }
  /**
   * Register a callback to be invoked whenever the account changes
   *
   * @param callback Function to invoke whenever the account is changed
   * @return promise that resolves / rejects when the callback function returns a result object
   */
  waitForState<U>(
    callback: (current: DecodedAccountInfo<T>, previous: DecodedAccountInfo<T>) => {result?: U, error?: string} | undefined,
    options = { timeout: 60000 },
  ) {
    return new Promise<U>((resolve, reject) => {
      const { signal } = this

      const listener = ([current, previous]: [current: DecodedAccountInfo<T>, previous: DecodedAccountInfo<T>]) => {
        const handled = callback(current, previous)
        if (handled?.error) {
          removeListener()
          reject(handled.error)
        } else if (handled?.result) {
          removeListener()
          resolve(handled.result)
        }
      }

      const removeListener = () => signal.remove(listener)

      // run listener with current state
      listener([this.current, this.previous])

      //
      // setTimeout(() => {
      //   removeListener()
      //   reject(GambaError.FAILED_CREATING_USER_ACCOUNT)
      // }, options.timeout)

      // listen for future updates
      signal.add(listener)
    })
  }

  private update(info: NullableAccountInfo) {
    const decoded = this.decoder(info)
    this.current = { info, decoded }
    this.signal.emit([
      this.current,
      this.previous,
    ])
    this.previous = this.current
  }

  constructor(
    publicKey: PublicKey,
    decoder: (info: NullableAccountInfo) => T | null,
  ) {
    this.publicKey = publicKey
    this.decoder = decoder
  }
}
