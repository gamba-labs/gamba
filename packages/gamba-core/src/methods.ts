import { BN } from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token'
import { PublicKey, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js'
import { GambaClient } from './client'
import { BET_UNIT, GambaError, HOUSE_SEED, SYSTEM_PROGRAM, USER_SEED } from './constants'
import { GambaProgram } from './types'
import { getGameResult, getPdaAddress, getTokenBalance } from './utils'

export interface GambaPlayParams {
  creator: PublicKey | string
  wager: number
  seed: string
  bet: number[]
  deductFees?: boolean
}

export type GambaMethods = ReturnType<typeof createMethods>

const createAccountMethod = (
  program: GambaProgram,
  owner: PublicKey,
) => {
  return program.methods
    .initializeUser(
      owner,
    )
    .accounts({
      user: getPdaAddress(USER_SEED, owner.toBytes()),
      owner,
      systemProgram: SYSTEM_PROGRAM,
    })
    .remainingAccounts([
      { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    ])
}

const playMethod = (
  program: GambaProgram,
  owner: PublicKey,
  _wager: number,
  bet: number[],
  clientSeed: string,
  creator: PublicKey,
) => {
  return program.methods
    .play(
      new BN(_wager),
      bet.map((x) => x * BET_UNIT),
      clientSeed,
    )
    .accounts({
      owner,
      house: getPdaAddress(HOUSE_SEED),
      user: getPdaAddress(USER_SEED, owner.toBytes()),
      creator,
    })
}

export function createMethods(
  client: GambaClient,
) {
  return {
    /**
     * @param opts
     * @returns
     */
    createAccount: async () => {
      const instruction = await createAccountMethod(client.program, client.wallet.publicKey).instruction()
      const { txId } = await client._createAndSendTransaction(instruction)
      return {
        txId,
        result: () =>
          client.user.waitForState(
            (current) => {
              // if (current.decoded?.created) {
              //   return true
              // }
              if (current.decoded?.status.playing) {
                return true
              }
            },
          ),
      }
    },
    /**
     * @param opts
     * @returns
     */
    play: async (opts: GambaPlayParams) => {
      if (!client.user.state?.created) {
        throw GambaError.PLAY_BEFORE_INITIALIZED
      }

      const houseFee = client.house.state?.houseFee.toNumber() / 1000
      const creatorFee = client.house.state?.creatorFee.toNumber() / 1000
      const totalFee = houseFee + creatorFee

      const _wager = opts?.deductFees ? Math.ceil(opts.wager / (1 + totalFee)) : opts.wager

      const instruction = await playMethod(
        client.program,
        client.wallet.publicKey,
        _wager,
        opts.bet,
        opts.seed,
        new PublicKey(opts.creator),
      )
        .instruction()

      const { txId } = await client._createAndSendTransaction(instruction)

      const nonce = client.user.state.nonce.toNumber() as number

      return {
        txId,
        nonce,
        result: async () => {
          console.debug('Game nonce:', client.user.state?.nonce.toNumber())
          return client.user.waitForState(
            (current, previous) => {
              if (!current?.decoded?.created) {
                throw new Error(GambaError.USER_ACCOUNT_CLOSED_BEFORE_RESULT)
              }
              if (current.decoded && previous.decoded) {
                // Game nonce increased
                // We can now derive a result
                const previousNonce = previous.decoded.nonce.toNumber()
                const currentNonce = current.decoded.nonce.toNumber()
                if (currentNonce === previousNonce + 1) {
                  return getGameResult(previous.decoded, current.decoded)
                }
                // Nonce skipped
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
        },
      }
    },

    redeemBonusToken: async () => {
      const mint = client.house.state!.bonusMint

      const associatedTokenAccount = await getAssociatedTokenAddress(
        mint,
        client.wallet.publicKey,
      )

      const balance = await getTokenBalance(client.connection, client.wallet.publicKey, mint)

      const instruction = await client.program.methods
        .redeemBonusToken(new BN(balance))
        .accounts({
          mint,
          tokenProgram: TOKEN_PROGRAM_ID,
          from: associatedTokenAccount,
          authority: client.wallet.publicKey,
          user: client.user.publicKey,
          house: client.house.publicKey,
        })
        .instruction()

      const { txId } = await client._createAndSendTransaction(instruction)

      return {
        txId,
        result: () => {
          return client.user.waitForState(
            (current, previous) => {
              if (current.decoded?.bonusBalance > previous.decoded?.bonusBalance) {
                return true
              }
            },
          )
        },
      }
    },

    withdraw: async (desiredAmount?: number) => {
      const availableBalance: number = client.user.state?.balance ?? 0

      const amount = desiredAmount ?? availableBalance

      if (amount > availableBalance) {
        throw new Error(GambaError.INSUFFICIENT_BALANCE)
      }

      const instruction = await client.program.methods
        .userWithdraw(new BN(amount))
        .accounts({
          user: client.user.publicKey,
          owner: client.wallet.publicKey,
        })
        .instruction()

      const { txId, blockhash } = await client._createAndSendTransaction(instruction)

      return {
        txId,
        result: async () => {
          const result = await client.connection.confirmTransaction({
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
    },

    closeAccount: async () => {
      const instruction = await client.program.methods
        .close()
        .accounts({
          user: client.user.publicKey,
          house: getPdaAddress(HOUSE_SEED),
          owner: client.wallet.publicKey,
        })
        .instruction()

      const { txId } = await client._createAndSendTransaction(instruction)

      return {
        txId,
        result: () => {
          return client.user.waitForState(
            (current) => {
              if (!current.decoded?.created) {
                return true
              }
            },
          )
        },
      }
    },
  }
}
