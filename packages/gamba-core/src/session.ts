import { AnchorProvider, Wallet as AnchorWallet, BN, Program } from '@coral-xyz/anchor'
import { Keypair, SYSVAR_CLOCK_PUBKEY, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { StateAccount } from './account'
import { BET_UNIT, GambaError, HOUSE_SEED, IDL, PROGRAM_ID, SYSTEM_PROGRAM, USER_SEED } from './constants'
import { Gamba as GambaProgram } from './idl'
import { GambaProvider } from './provider'
import { UserState } from './types'
import { decodeUser, getGameResult, getPdaAddress } from './utils'

export type Wallet = Omit<AnchorWallet, 'payer'> & {payer?: Keypair}

export interface GambaPlayParams {
  deductFees?: boolean
}

export class GambaSession {
  program: Program<GambaProgram>
  provider: GambaProvider

  _wallet: Wallet

  wallet: StateAccount<any>
  user: StateAccount<UserState | undefined>

  private _unsubscribe?: () => void

  constructor(gambaProvider: GambaProvider, wallet: Wallet) {
    const provider = new AnchorProvider(
      gambaProvider.connection,
      wallet,
      { preflightCommitment: 'processed' },
    )

    this.provider = gambaProvider
    this.program = new Program(IDL, PROGRAM_ID, provider)

    this._wallet = wallet

    this.wallet = new StateAccount(
      wallet.publicKey,
      (info) => info,
    )
    this.wallet._debugIdentifier = 'WALLET'

    this.user = new StateAccount(
      getPdaAddress(USER_SEED, this.wallet.publicKey.toBytes()),
      decodeUser,
    )
    this.user._debugIdentifier = 'USER'

    const accountListeners = [
      this.user,
      this.wallet,
    ].map((acc) => acc.listen(gambaProvider.connection))

    this._unsubscribe = () => {
      accountListeners.forEach((unsubscribe) => unsubscribe && unsubscribe())
    }
  }

  async destroy() {
    if (this._unsubscribe) {
      this._unsubscribe()
    }
  }

  private async createAndSendTransaction(instruction: TransactionInstruction) {
    const blockhash = await this.provider.connection.getLatestBlockhash()
    const messageV0 = new TransactionMessage({
      payerKey: this.wallet.publicKey,
      recentBlockhash: blockhash.blockhash,
      instructions: [instruction],
    }).compileToV0Message()
    const transaction = new VersionedTransaction(messageV0)
    const signedTransaction = await this._wallet.signTransaction(transaction)
    const txId = await this.provider.connection.sendTransaction(signedTransaction)
    return { txId, blockhash }
  }

  async play(
    gameConfigInput: number[],
    wager: number,
    seed: string,
    params: GambaPlayParams = { deductFees: false },
  ) {
    if (!this.provider.creator) {
      throw new Error('NO_CREATOR')
    }

    const houseFee = this.provider.house.state?.houseFee.toNumber() / 1000
    const creatorFee = this.provider.house.state?.creatorFee.toNumber() / 1000
    const totalFee = houseFee + creatorFee

    const _wager = params?.deductFees ? Math.ceil(wager / (1 + totalFee)) : wager

    const gameConfig = gameConfigInput.map((x) => x * BET_UNIT)
    const instruction = await this.program.methods
      .play(
        this.provider.creator,
        new BN(_wager),
        gameConfig,
        seed,
      )
      .accounts({
        owner: this.wallet.publicKey,
        house: getPdaAddress(HOUSE_SEED),
        user: this.user.publicKey,
        creator: this.provider.creator,
      })
      .instruction()

    const { txId } = await this.createAndSendTransaction(instruction)

    return {
      txId,
      result: async () => {
        console.debug('Game nonce:', this.user.state?.nonce.toNumber())
        const result = await this.user.waitForState(
          (current, previous) => {
            if (!current?.decoded?.created) {
              throw new Error(GambaError.USER_ACCOUNT_CLOSED_BEFORE_RESULT)
            }
            if (current.decoded && previous.decoded) {
              // Game nonce increased
              // We can now derive a result
              const previousNonce = previous.decoded.nonce.toNumber()
              const currentNonce = current.decoded.nonce.toNumber()
              if (currentNonce === previousNonce + 1)
                return getGameResult(previous.decoded, current.decoded)
              // nonce skipped
              if (currentNonce > previousNonce + 1)
                throw new Error(GambaError.FAILED_TO_GENERATE_RESULT)
            }
            // unexpected status
            if (!current?.decoded?.status.playing && !current?.decoded?.status.hashedSeedRequested) {
              console.error('Unexpected status', current?.decoded?.status)
              throw new Error(GambaError.FAILED_TO_GENERATE_RESULT)
            }
          },
        )
        return result
      },
    }
  }

  async createUserAccount() {
    const instruction = await this.program.methods
      .initializeUser(
        this.wallet.publicKey,
      )
      .accounts({
        user: this.user.publicKey,
        owner: this.wallet.publicKey,
        systemProgram: SYSTEM_PROGRAM,
      })
      .remainingAccounts([
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
      ])
      .instruction()

    const { txId } = await this.createAndSendTransaction(instruction)

    return {
      txId,
      result: () => {
        return this.user.waitForState(
          (current) => {
            if (current.decoded?.created) {
              return true
            }
          },
        )
      },
    }
  }

  async withdraw(amount: number) {
    const instruction = await this.program.methods
      .userWithdraw(new BN(amount))
      .accounts({
        user: this.user.publicKey,
        owner: this.wallet.publicKey,
      })
      .instruction()

    const { txId, blockhash } = await this.createAndSendTransaction(instruction)

    return {
      txId,
      result: async () => {
        const result = await this.provider.connection.confirmTransaction({
          signature: txId,
          blockhash: blockhash.blockhash,
          lastValidBlockHeight: blockhash.lastValidBlockHeight,
        }, 'confirmed')
        if (result.value.err) {
          throw new Error(result.value.err.toString())
        }
        return { status: result.value }
      },
    }
  }

  async closeUserAccount() {
    const instruction = await this.program.methods
      .close()
      .accounts({
        user: this.user.publicKey,
        house: getPdaAddress(HOUSE_SEED),
        owner: this.wallet.publicKey,
      })
      .instruction()

    const { txId } = await this.createAndSendTransaction(instruction)

    return {
      txId,
      result: () => {
        return this.user.waitForState(
          (current) => {
            if (!current.decoded?.created) {
              return true
            }
          },
        )
      },
    }
  }
}
