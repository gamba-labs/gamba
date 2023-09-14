import { AnchorProvider, BN, Program } from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { AccountInfo, Connection, Keypair, PublicKey, SYSVAR_CLOCK_PUBKEY, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { Event } from './Event'
import { GambaError2 } from './GambaError'
import { BET_UNIT, GambaError, PROGRAM_ID, SYSTEM_PROGRAM } from './constants'
import { Gamba as GambaProgram, IDL } from './idl'
import { parseHouseAccount, parseUserAccount, parseWalletAccount } from './parsers'
import { State, createState } from './state'
import { Wallet } from './types'
import { getPdaAddress } from './utils'

export interface GambaPlayParams {
  creator: PublicKey | string
  wager: number
  seed: string
  bet: number[]
  deductFees?: boolean
}

export class GambaClient {
  /** The connection object from Solana's SDK. */
  public readonly connection: Connection

  program: Program<GambaProgram>

  _wallet: Wallet

  private state = createState()
  private previous = this.state

  get addresses() {
    const wallet = this._wallet.publicKey
    const user = getPdaAddress(Buffer.from('user2'), this._wallet.publicKey.toBytes())
    const house = getPdaAddress(Buffer.from('house'))
    return { wallet, user, house }
  }

  get owner() {
    return this.state.wallet
  }

  get house() {
    return this.state.house
  }

  get user() {
    return this.state.user
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

  /**
   * Register a callback to be invoked whenever the state changes
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
          unsubscribe()
          reject(err)
        }
      }
      const unsubscribe = this.stateEvent.subscribe(listener)
      listener(this.state, this.previous)
    })
  }

  private errorEvent = new Event<[GambaError2]>

  public onError(listener: (error: GambaError2) => void) {
    return this.errorEvent.subscribe(listener)
  }

  private makeMethodCall = <T extends unknown[] = []>(
    methodName: string,
    instructionBuilder: (...dsa: T) => Promise<TransactionInstruction>,
  ) => {
    return async (...args: T) => {
      const runMethod: () => ReturnType<typeof this._createAndSendTransaction> =
      // Retry until error is resolved or rejected
      async () => {
        try {
          const instructions = await instructionBuilder(...args)
          return this._createAndSendTransaction(instructions)
        } catch (error) {
          const _err = new GambaError2(
            error as string,
            methodName,
            args,
          )
          this.errorEvent.emit(_err)
          const resolution = await _err.wait()
          if (resolution === 'resolved') {
            return await runMethod()
          }
          throw error
        }
      }
      return runMethod()
    }
  }

  /**
   * Plays a bet against the Program
   */
  play = this.makeMethodCall('play', ({ wager, ...params }: GambaPlayParams) => {
    const totalBalance = this.user.balance + this.user.bonusBalance + this.owner.balance - 1000000

    if (!this.user.created) {
      throw GambaError.PLAY_BEFORE_INITIALIZED
    }

    if (wager > totalBalance) {
      throw GambaError.INSUFFICIENT_BALANCE
    }

    return this.program.methods
      .play(
        new BN(wager),
        params.bet.map((x) => x * BET_UNIT),
        params.seed,
      )
      .accounts({
        owner: this.addresses.wallet,
        house: this.addresses.house,
        user: this.addresses.user,
        creator: params.creator,
      })
      .instruction()
  })

  /**
   * Closes the user account
   */
  closeAccount = this.makeMethodCall('closeAccount', () => {
    return this.program.methods
      .close()
      .accounts({
        owner: this.addresses.wallet,
        house: this.addresses.house,
        user: this.addresses.user,
      })
      .instruction()
  })

  /**
   * Initialize user account
   */
  initializeAccount = this.makeMethodCall('initializeAccount', () => {
    return this.program.methods
      .initializeUser(this.addresses.wallet)
      .accounts({
        user: this.addresses.user,
        owner: this.addresses.wallet,
        systemProgram: SYSTEM_PROGRAM,
      })
      .remainingAccounts([
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
      ])
      .instruction()
  })

  /**
   * Withdraws desiredAmount from user account
   * @param desiredAmount Lamports to withdraw. Leave empty for available funds.
   */
  withdraw = this.makeMethodCall('withdraw', (desiredAmount?: number) => {
    const amount = desiredAmount ?? this.user.balance

    return this.program.methods
      .userWithdraw(new BN(amount))
      .accounts({
        user: this.addresses.user,
        owner: this.addresses.wallet,
      })
      .instruction()
  })

  /**
   * Redeems bonus tokens by burning them and adds them to the user's bonus balance
   * @param amountToRedeem Bonus tokens to redeem.
   */
  redeemBonusToken = this.makeMethodCall('redeemBonusToken', (amountToRedeem: number) => {
    if (!this.house.bonusMint) {
      throw 'House does not have a bonus token'
    }

    const associatedTokenAccount = getAssociatedTokenAddressSync(
      this.house.bonusMint,
      this.addresses.wallet,
    )

    return this.program.methods
      .redeemBonusToken(new BN(amountToRedeem ?? associatedTokenAccount))
      .accounts({
        mint: this.house.bonusMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        from: associatedTokenAccount,
        authority: this.addresses.wallet,
        user: this.addresses.user,
        house: this.addresses.house,
      })
      .instruction()
  })

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
    }

    this.connection = connection

    const anchorProvider = new AnchorProvider(
      connection,
      this._wallet,
      { preflightCommitment: connection.commitment },
    )

    this.program = new Program(IDL, PROGRAM_ID, anchorProvider)
  }

  /**
   * Starts listening for accounts that will update state
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

  private async _createAndSendTransaction(instruction: TransactionInstruction) {
    const blockhash = await this.connection.getLatestBlockhash()

    const message = new TransactionMessage({
      payerKey: this._wallet.publicKey,
      recentBlockhash: blockhash.blockhash,
      instructions: [instruction],
    }).compileToV0Message()
    const transaction = new VersionedTransaction(message)

    const signedTransaction = await this._wallet.signTransaction(transaction)

    const txId = await this.connection.sendTransaction(signedTransaction)

    return { txId, blockhash, message }
  }
}
