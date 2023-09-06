import { AnchorProvider, BN, Program } from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { Connection, Keypair, PublicKey, SYSVAR_CLOCK_PUBKEY, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { Account } from './Account'
import { Event } from './Event'
import { GambaError2 } from './GambaError'
import { BET_UNIT, GambaError, HOUSE_SEED, PROGRAM_ID, SYSTEM_PROGRAM, USER_SEED } from './constants'
import { Gamba as GambaProgram, IDL } from './idl'
import { parseHouseAccount, parseUserAccount, parseWalletAccount } from './parsers'
import { HouseState, UserState, Wallet } from './types'
import { decodeHouse, decodeUser, getPdaAddress, zeroUnless } from './utils'

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

  walletAccount: Account<null>
  userAccount: Account<UserState>
  houseAccount: Account<HouseState>

  get owner() {
    return parseWalletAccount(this.walletAccount)
  }

  get house() {
    return parseHouseAccount(this.houseAccount)
  }

  get user() {
    return parseUserAccount(this.userAccount)
  }

  private errorEvent = new Event<[GambaError2]>
  onError = (listener: (error: GambaError2) => void) => this.errorEvent.subscribe(listener)

  /**
   * If the used wallet is an inline burner wallet
   */
  burnerWalletIsPrimary = false

  private makeMethodCall = <T extends unknown[] = []>(
    methodName: string,
    instructionBuilder: (...dsa: T) => Promise<TransactionInstruction>,
  ) => {
    return async (...args: T) => {
      const runMethod: () => ReturnType<typeof this._createAndSendTransaction> = async () => {
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
  play = this.makeMethodCall('play', ({ wager: _wager, ...params }: GambaPlayParams) => {
    if (!this.user.created) {
      throw GambaError.PLAY_BEFORE_INITIALIZED
    }

    const houseFee = zeroUnless(this.house?.fees.house)
    const creatorFee = zeroUnless(this.house?.fees.creator)
    const totalFee = houseFee + creatorFee

    const wager = params?.deductFees ? Math.ceil(_wager / (1 + totalFee)) : _wager

    return this.program.methods
      .play(
        new BN(wager),
        params.bet.map((x) => x * BET_UNIT),
        params.seed,
      )
      .accounts({
        owner: this.owner.publicKey,
        house: this.house.publicKey,
        user: this.user.publicKey,
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
        owner: this.owner.publicKey,
        house: this.house.publicKey,
        user: this.user.publicKey,
      })
      .instruction()
  })

  /**
   * Initialize user account
   */
  initializeAccount = this.makeMethodCall('initializeAccount', () => {
    return this.program.methods
      .initializeUser(this.owner.publicKey)
      .accounts({
        user: this.user.publicKey,
        owner: this.owner.publicKey,
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

    if (amount > this.user.balance) {
      throw GambaError.INSUFFICIENT_BALANCE
    }

    return this.program.methods
      .userWithdraw(new BN(amount))
      .accounts({
        user: this.user.publicKey,
        owner: this.owner.publicKey,
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
      this.owner.publicKey,
    )

    return this.program.methods
      .redeemBonusToken(new BN(amountToRedeem ?? associatedTokenAccount))
      .accounts({
        mint: this.house.bonusMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        from: associatedTokenAccount,
        authority: this.owner.publicKey,
        user: this.user.publicKey,
        house: this.house.publicKey,
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
      this.burnerWalletIsPrimary = true
    }

    this.connection = connection

    const anchorProvider = new AnchorProvider(
      connection,
      this._wallet,
      { preflightCommitment: connection.commitment },
    )

    this.program = new Program(IDL, PROGRAM_ID, anchorProvider)

    this.walletAccount = new Account(
      this._wallet.publicKey,
      () => null,
    )

    this.userAccount = new Account(
      getPdaAddress(USER_SEED, this._wallet.publicKey.toBytes()),
      decodeUser,
    )

    this.houseAccount = new Account(
      getPdaAddress(HOUSE_SEED),
      decodeHouse,
    )
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
