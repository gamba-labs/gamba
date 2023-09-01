import { AnchorProvider, Program } from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { Connection, Keypair, PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { StateAccount } from './account'
import { HOUSE_SEED, PROGRAM_ID, USER_SEED } from './constants'
import { Gamba as GambaProgram, IDL } from './idl'
import { GambaMethods, createMethods } from './methods'
import { HouseState, UserState, Wallet } from './types'
import { decodeHouse, decodeUser, getPdaAddress } from './utils'

export interface PlayOptions {
  creator: PublicKey | string
  wager: number
  seed: string
  gameConfig: number[]
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
      { preflightCommitment: 'processed' },
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

    this.methods = createMethods(this)
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
    console.log(signedTransaction)
    const txId = await this.connection.sendTransaction(signedTransaction)
    return { txId, blockhash }
  }
}
