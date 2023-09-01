import { BN } from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token'
import { PublicKey, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js'
import { GambaClient } from './client'
import { BET_UNIT, GambaError, HOUSE_SEED, SYSTEM_PROGRAM } from './constants'
import { GambaError2 } from './error'
import { getGameResult, getPdaAddress, getTokenBalance } from './utils'

export interface PlayOptions {
  creator: PublicKey | string
  wager: number
  seed: string
  gameConfig: number[]
  deductFees?: boolean
}

export type GambaMethods = ReturnType<typeof createMethods>

export function createMethods(
  client: GambaClient,
) {
  return {
    createAccount: async () => {
      const instruction = await client.program.methods
        .initializeUser(
          client.wallet.publicKey,
        )
        .accounts({
          user: client.user.publicKey,
          owner: client.wallet.publicKey,
          systemProgram: SYSTEM_PROGRAM,
        })
        .remainingAccounts([
          { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        ])
        .instruction()

      const { txId } = await client._createAndSendTransaction(instruction)

      return {
        txId,
        result: () => {
          return client.user.waitForState(
            (current) => {
              // if (current.decoded?.created) {
              //   return true
              // }
              if (current.decoded?.status.playing) {
                return true
              }
            },
          )
        },
      }
    },

    play: async (opts: PlayOptions) => {
      if (!client.user.state?.created) {
        throw new GambaError2(GambaError.PLAY_BEFORE_INITIALIZED, 'play', [opts])
      }

      const houseFee = client.house.state?.houseFee.toNumber() / 1000
      const creatorFee = client.house.state?.creatorFee.toNumber() / 1000
      const totalFee = houseFee + creatorFee

      const _wager = opts?.deductFees ? Math.ceil(opts.wager / (1 + totalFee)) : opts.wager

      const gameConfig = opts.gameConfig.map((x) => x * BET_UNIT)

      const instruction = await client.program.methods
        .play(
          new BN(_wager),
          gameConfig,
          opts.seed,
        )
        .accounts({
          owner: client.wallet.publicKey,
          house: client.house.publicKey,
          user: client.user.publicKey,
          creator: new PublicKey(opts.creator),
        })
        .instruction()

      console.log(instruction)

      const { txId } = await client._createAndSendTransaction(instruction)

      return {
        txId,
        result: async () => {
          console.debug('Game nonce:', client.user.state?.nonce.toNumber())
          const result = await client.user.waitForState(
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
    },

    approveBonusToken: async () => {
      const mint = client.house.state!.bonusMint

      const associatedTokenAccount = await getAssociatedTokenAddress(
        mint,
        client.wallet.publicKey,
      )

      const instruction = await client.program.methods
        .approveBonusToken(new BN(1))
        .accounts({
          to: associatedTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          delegate: client.wallet.publicKey,
          authority: client.wallet.publicKey,
        })
        .instruction()

      const { txId } = await client._createAndSendTransaction(instruction)

      return {
        txId,
        result: () => {
          return client.user.waitForState(
            (current) => {
              if (current.decoded?.created) {
                return true
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
