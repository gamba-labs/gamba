import { AnchorProvider, BN, Program } from '@coral-xyz/anchor'
import { Connection, PublicKey, SYSVAR_CLOCK_PUBKEY, TransactionInstruction } from '@solana/web3.js'
import { BET_UNIT, PROGRAM_ID, SYSTEM_PROGRAM } from './constants'
import { IDL } from './idl'
import { GambaProgram, Wallet } from './types'
import { getPdaAddress } from './utils'
import { SentTransaction } from './GambaClient'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

export interface PlayMethodParams {
  /**
   * Outcomes for the bet
   */
  bet: number[]
  /**
   * Number of lamports to wager
   */
  wager: number
  /**
   * The address that should receive the fees
   */
  creator: PublicKey | string
  /**
   * Fee sent to the creator address (0.05 = 5%)
   */
  creatorFee: number
  /**
   * Client seed used to generate the result
   */
  seed: string
}

export type SendFunction = (
  instruction: TransactionInstruction | Promise<TransactionInstruction>,
  params?: {requiresAccount?: boolean}
) => Promise<SentTransaction>

export class GambaAnchorClient {
  private program: GambaProgram
  private wallet: Wallet
  private sender: SendFunction

  get addresses() {
    const wallet = this.wallet.publicKey
    const user = getPdaAddress(Buffer.from('user2'), this.wallet.publicKey.toBytes())
    const house = getPdaAddress(Buffer.from('house'))
    return { wallet, user, house }
  }

  constructor(
    connection: Connection,
    wallet: Wallet,
    sender: SendFunction,
  ) {
    const anchorProvider = new AnchorProvider(
      connection,
      wallet,
      { preflightCommitment: connection.commitment },
    )
    this.wallet = wallet
    this.program = new Program(IDL, PROGRAM_ID, anchorProvider)
    this.sender = sender
  }

  /** Plays a bet against the Program */
  play = (params: PlayMethodParams) => {
    return this.sender(
      this.program.methods
        .playWithCustomCreatorFee(
          new BN(params.wager),
          params.bet.map((x) => x * BET_UNIT),
          params.seed,
          new BN(params.creatorFee * 1000),
        )
        .accounts({
          owner: this.addresses.wallet,
          house: this.addresses.house,
          user: this.addresses.user,
          creator: params.creator,
        })
        .instruction(),
      { requiresAccount: true },
    )
  }

  /** Closes the user account */
  closeAccount = () => {
    return this.sender(
      this.program.methods
        .close()
        .accounts({
          owner: this.addresses.wallet,
          house: this.addresses.house,
          user: this.addresses.user,
        })
        .instruction(),
    )
  }

  /** Initialize user account */
  initializeAccount = () => {
    return this.sender(
      this.program.methods
        .initializeUser(this.addresses.wallet)
        .accounts({
          user: this.addresses.user,
          owner: this.addresses.wallet,
          systemProgram: SYSTEM_PROGRAM,
        })
        .remainingAccounts([
          { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        ])
        .instruction(),
    )
  }

  /** Withdraws amount from user account */
  withdraw = (amount: number) => {
    return this.sender(
      this.program.methods
        .userWithdraw(new BN(amount))
        .accounts({
          user: this.addresses.user,
          owner: this.addresses.wallet,
        })
        .instruction(),
    )
  }

  /**
   * Redeems bonus tokens by burning them and adds them to the user's bonus balance
   * @param mint The mint address of the bonus token. Has to match house.bonusMint
   * @param associatedTokenAccount The users ATA
   * @param amountToRedeem Bonus tokens to redeem.
   */
  redeemBonusToken = (
    mint: PublicKey,
    associatedTokenAccount: PublicKey,
    amountToRedeem: number,
  ) => {
    return this.sender(
      this.program.methods
        .redeemBonusToken(new BN(amountToRedeem))
        .accounts({
          mint,
          tokenProgram: TOKEN_PROGRAM_ID,
          from: associatedTokenAccount,
          authority: this.addresses.wallet,
          user: this.addresses.user,
          house: this.addresses.house,
        })
        .instruction(),
    )
  }
}
