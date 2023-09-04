import { AnchorProvider, Program } from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { Connection, Keypair, PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { StateAccount } from './account'
import { HOUSE_SEED, PROGRAM_ID, USER_SEED } from './constants'
import { GambaError2 } from './error'
import { Gamba as GambaProgram, IDL } from './idl'
import { GambaMethods, createMethods } from './methods'
import { HouseState, UserState, Wallet } from './types'
import { decodeHouse, decodeUser, getPdaAddress } from './utils'

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
  user: StateAccount<UserState | undefined>
  house: StateAccount<HouseState | undefined>

  methods: GambaMethods

  errorListeners: Array<(error: GambaError2) => void> = []

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
    )

    this.user = new StateAccount(
      getPdaAddress(USER_SEED, this._wallet.publicKey.toBytes()),
      decodeUser,
    )

    this.house = new StateAccount(
      getPdaAddress(HOUSE_SEED),
      decodeHouse,
    )

    this.user.listen(connection)
    this.house.listen(connection)
    this.wallet.listen(connection)

    const methods = createMethods(this)

    this.methods = Object.entries(methods)
      .reduce((methods, [methodName, method]) => {
        return {
          ...methods,
          [methodName]: async (...args: (typeof method.arguments)[]) => {
            const retry: any = async () => {
              try {
                return await (method as any)(...args)
              } catch (error) {
                if (error instanceof GambaError2) {
                  this.emitError(error)
                  await error.waitForRetry()
                  return await retry()
                }
                throw error
              }
            }
            return await retry()
          },
        }
      }, {} as typeof methods)
  }

  private emitError(error: GambaError2) {
    for (const listener of this.errorListeners) {
      listener(error)
    }
  }

  onError(callback: (error: GambaError2) => void) {
    const index = this.errorListeners.push(callback)
    return () => {
      this.errorListeners.splice(index, 1)
    }
  }

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
