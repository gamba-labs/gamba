import { AccountInfo, Connection, Keypair, MessageV0, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { Event } from './Event'
import { GambaError, clientError } from './GambaError'
import { parseHouseAccount, parseUserAccount, parseWalletAccount } from './parsers'
import { State, createState } from './state'
import { Wallet } from './types'
import { GambaAnchorClient } from './methods'

async function makeAndSendTransaction(
  connection: Connection,
  wallet: Wallet,
  instruction: TransactionInstruction,
): Promise<SentTransaction> {
  const blockhash = await connection.getLatestBlockhash()
  const message = new TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash.blockhash,
    instructions: [instruction],
  }).compileToV0Message()
  const transaction = new VersionedTransaction(message)
  const signedTransaction = await wallet.signTransaction(transaction)
  const txId = await connection.sendTransaction(signedTransaction)
  return { txId, blockhash, message }
}

export interface SentTransaction {
  txId: string
  blockhash: Readonly<{
    blockhash: string;
    lastValidBlockHeight: number;
  }>
  message: MessageV0
}

export class GambaClient {
  /** The connection object from Solana's SDK. */
  public readonly connection: Connection

  public readonly methods: GambaAnchorClient

  wallet: Wallet
  private fakeWallet = false

  public state = createState()
  private previous = this.state

  get addresses() {
    return this.methods.addresses
  }

  /**
   * @param connection
   * A connection to a fullnode JSON RPC endpoint
   * @param wallet
   * The web3 wallet to use for signing and interracting with the contract.
   */
  constructor(
    connection: Connection,
    wallet?: Wallet,
  ) {
    if (wallet) {
      this.wallet = wallet
    } else {
      // Create a fake inline wallet if none is provided
      const keypair = new Keypair
      this.fakeWallet = true
      this.wallet = {
        payer: keypair,
        publicKey: keypair.publicKey,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        signTransaction: () => null as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        signAllTransactions: () => null as any,
      }
    }

    this.connection = connection
    this.methods = new GambaAnchorClient(
      connection,
      this.wallet,
      this.sendTransaction.bind(this),
    )
  }

  private stateEvent = new Event<[current: State, previous: State]>

  public onChange(listener: (state: State, previous: State) => void) {
    return this.stateEvent.subscribe(listener)
  }

  private update(update: Partial<State>) {
    this.state = { ...this.state, ...update }
    this.stateEvent.emit(this.state, this.previous)
    this.previous = this.state
  }

  private errorEvent = new Event<[GambaError]>

  public onError(listener: (error: GambaError) => void) {
    return this.errorEvent.subscribe(listener)
  }

  private async sendTransaction(
    instruction: TransactionInstruction | Promise<TransactionInstruction>,
    params?: {requiresAccount?: boolean},
  ) {
    try {
      if (this.fakeWallet) {
        throw clientError('WalletNotConnected')
      }
      if (params?.requiresAccount && !this.state.user.created) {
        throw clientError('AccountNotInitialized')
      }
      return await makeAndSendTransaction(this.connection, this.wallet, await instruction)
    } catch (error) {
      // Catch error so it can be handled by subscribers of onError
      this.errorEvent.emit(new GambaError(error))
      throw error
    }
  }

  /**
   * Register a callback to be invoked whenever the client state changes, return a value to resolve the promise
   * If you throw an error it will invoke callback listeners to onError (or useGambaError)
   * @param callback Function to invoke whenever the state is changed
   * @return Promise that resolves when the callback function returns anything
   */
  anticipate<U>(
    callback: (current: State, previous: State) => U | undefined,
  ) {
    return new Promise<U>((resolve, reject) => {
      const listener = (current: State, previous: State) => {
        try {
          const handled = callback(current, previous)
          if (handled) {
            unsubscribe()
            resolve(handled)
          }
        } catch (err) {
          // Catch error so it can be handled by subscribers of onError
          this.errorEvent.emit(new GambaError(err))
          unsubscribe()
          reject(err)
        }
      }
      const unsubscribe = this.stateEvent.subscribe(listener)
      listener(this.state, this.previous)
    })
  }

  /**
   * Listens for accounts that will update state
   */
  public listen() {
    const { connection } = this

    const updateUser = async (info: AccountInfo<Buffer> | null) => {
      this.update({ user: await parseUserAccount(info) })
    }

    const updateWallet = (info: AccountInfo<Buffer> | null) => {
      this.update({ wallet: parseWalletAccount(info) })
    }

    const updateHouse = (info: AccountInfo<Buffer> | null) => {
      this.update({ house: parseHouseAccount(info) })
    }

    connection.getAccountInfo(this.addresses.user).then(updateUser)
    connection.getAccountInfo(this.addresses.wallet).then(updateWallet)
    connection.getAccountInfo(this.addresses.house).then(updateHouse)

    const listeners = [
      connection.onAccountChange(this.addresses.wallet, updateWallet),
      connection.onAccountChange(this.addresses.user, updateUser),
      connection.onAccountChange(this.addresses.house, updateHouse),
    ]

    return () => {
      listeners.forEach((listener) => {
        this.connection.removeAccountChangeListener(listener)
      })
    }
  }
}
