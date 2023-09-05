import { AnchorProvider, Program } from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { Connection, Keypair, PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { StateAccount } from './account'
import { HOUSE_SEED, PROGRAM_ID, USER_SEED } from './constants'
import { GambaError2 } from './error'
import { Gamba as GambaProgram, IDL } from './idl'
import { GambaMethods, createMethods } from './methods'
import { HouseState, UserState, Wallet } from './types'
import { ParsedSettledBetEvent, decodeHouse, decodeUser, getPdaAddress, listenForPlayEvents } from './utils'

export interface GambaPlayParams {
  creator: PublicKey | string
  wager: number
  seed: string
  bet: number[]
  deductFees?: boolean
}

/**
 * A Gamba Client that handles account states
 */
export class GambaClient {
  program: Program<GambaProgram>
  _wallet: Wallet

  wallet: StateAccount<any>
  user: StateAccount<UserState>
  house: StateAccount<HouseState>

  methods: GambaMethods

  errorListeners: Array<(error: GambaError2) => void> = []
  eventListeners: Array<(error: ParsedSettledBetEvent) => void> = []

  /**
   * If the used wallet is an inline burner wallet
   */
  burnerWalletIsPrimary = false

  readonly connection: Connection

  /**
   * @param connection
   * A connection to a fullnode JSON RPC endpoint
   * @param wallet
   * The web3 wallet to use for signing and interracting with the contract.
   * If none is set an inline burner wallet is created
   */
  constructor(
    connection: Connection,
    wallet?: Wallet,
  ) {
    if (wallet) {
      this._wallet = wallet
    } else {
      // Create an inline burner wallet if none is provided
      this._wallet = new NodeWallet(new Keypair)
      this.burnerWalletIsPrimary = true
    }

    this.connection = connection

    const anchorProvider = new AnchorProvider(
      connection,
      this._wallet,
      { preflightCommitment: connection.commitment },
    )

    this.program = new Program(IDL, PROGRAM_ID, anchorProvider)

    this.wallet = new StateAccount(
      this._wallet.publicKey,
      (info) => info,
      'WALLET',
    )

    this.user = new StateAccount(
      getPdaAddress(USER_SEED, this._wallet.publicKey.toBytes()),
      (info) => decodeUser(info),
      'USER',
    )

    this.house = new StateAccount(
      getPdaAddress(HOUSE_SEED),
      (info) => decodeHouse(info),
      'HOUSE',
    )

    const methods = createMethods(this)

    this.methods = Object.entries(methods)
      .reduce((methods, [methodName, method]) => {
        return {
          ...methods,
          [methodName]: async (...args: (typeof method.arguments)[]) => {
            const runMethod: any = async () => {
              try {
                return await (method as any)(...args)
              } catch (error) {
                // console.log('What', error?.message)
                const _err = new GambaError2(
                  error as any,
                  methodName as keyof GambaMethods,
                  args,
                )
                this.emitError(_err)
                await _err.waitForRetry()
                return await runMethod()
              }
            }
            return await runMethod()
          },
        }
      }, {} as typeof methods)
  }

  private emitError(error: GambaError2) {
    for (const listener of this.errorListeners) {
      listener(error)
    }
  }

  private emitEvent(event: ParsedSettledBetEvent) {
    for (const listener of this.eventListeners) {
      listener(event)
    }
  }

  /**
   * Catch Gamba method call errors and resolve them in order to automatically re-execute them.
   */
  onError(callback: (error: GambaError2) => void) {
    this.errorListeners.push(callback)
    return () => {
      this.errorListeners.splice(this.errorListeners.indexOf(callback), 1)
    }
  }

  /** */
  listen() {
    const playListener = listenForPlayEvents(this.connection, (event) => {
      this.emitEvent(event)
    })

    const listeners = [
      this.user.listen(this.connection),
      this.house.listen(this.connection),
      this.wallet.listen(this.connection),
    ]

    return () => {
      playListener()
      for (const listener of listeners) {
        listener()
      }
    }
  }

  onGameResult(callback: (gameResult: ParsedSettledBetEvent) => void) {
    this.eventListeners.push(callback)
    console.debug('Added onGameResult', this.eventListeners.length)
    return () => {
      this.eventListeners.splice(this.eventListeners.indexOf(callback), 1)
      console.debug('Removed onGameResult', this.eventListeners.length)
    }
  }
  // return this.user.onChange(
  //   async (current, previous) => {
  //     // console.debug('Game nonce:', client.user.state?.nonce.toNumber())
  //     // if (!current?.decoded?.created) {
  //     //   throw new Error(GambaError.USER_ACCOUNT_CLOSED_BEFORE_RESULT)
  //     // }
  //     if (current.decoded && previous.decoded) {
  //       // Game nonce increased
  //       // We can now derive a result
  //       const previousNonce = previous.decoded.nonce.toNumber()
  //       const currentNonce = current.decoded.nonce.toNumber()
  //       if (currentNonce === previousNonce + 1) {
  //         const result = await getGameResult(previous.decoded, current.decoded)
  //         callback(result)
  //       }
  //       // Nonce skipped
  //       if (currentNonce > previousNonce + 1)
  //         throw new Error(GambaError.FAILED_TO_GENERATE_RESULT)
  //     }
  //     // unexpected status
  //     if (!current?.decoded?.status.playing && !current?.decoded?.status.hashedSeedRequested) {
  //       // console.error('Unexpected status', current?.decoded?.status)
  //       // throw new Error(GambaError.FAILED_TO_GENERATE_RESULT)
  //     }
  //   },
  // )

  async _createAndSendTransaction(instruction: TransactionInstruction) {
    const blockhash = await this.connection.getLatestBlockhash()
    const messageV0 = new TransactionMessage({
      payerKey: this.wallet.publicKey,
      recentBlockhash: blockhash.blockhash,
      instructions: [instruction],
    }).compileToV0Message()
    const transaction = new VersionedTransaction(messageV0)
    const signedTransaction = await this._wallet.signTransaction(transaction)
    const txId = await this.connection.sendTransaction(signedTransaction)
    return { txId, blockhash }
  }
}
