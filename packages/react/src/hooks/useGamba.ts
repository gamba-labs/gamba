import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { ComputeBudgetProgram, PublicKey } from '@solana/web3.js'
import { NATIVE_MINT, decodeGame, getGameAddress, getNextResult, getPoolAddress } from 'gamba-core-v2'
import { useAccount, useGambaProvider } from '.'
import { useWalletAddress } from './useBalances'
import { throwTransactionError, useSendTransaction, useTransactionStore } from './useSendTransaction'

export interface GambaPlayInput {
  wager: number
  bet: number[]
  creator: string | PublicKey
  creatorFee?: number
  jackpotFee?: number
  clientSeed?: string
  token?: string | PublicKey
  metadata?: (string | number)[]
  useBonus?: boolean
}

export function useNextResult() {
  const { connection } = useConnection()
  const userAddress = useWalletAddress()
  const game = useAccount(getGameAddress(userAddress), decodeGame)
  return () => {
    const prevNonce = game?.nonce?.toNumber() ?? 0
    return getNextResult(connection, userAddress, prevNonce)
  }
}

export function useGamba() {
  const userAddress = useWalletAddress()
  const game = useAccount(getGameAddress(userAddress), decodeGame)
  const userCreated = !!game
  const nextRngSeedHashed = game?.nextRngSeedHashed
  const txStore = useTransactionStore()
  const isPlaying = txStore.state === 'sending' || !!game?.status.resultRequested

  const play = useGambaPlay()
  const result = useNextResult()

  return {
    play,
    result,
    userCreated,
    nonce: Number(game?.nonce?.toNumber()),
    nextRngSeedHashed,
    game,
    isPlaying,
  }
}

export function useGambaPlay() {
  const { connected } = useWallet()
  const sendTx = useSendTransaction()
  const provider = useGambaProvider()

  const play = (input: GambaPlayInput) => {
    const creator = new PublicKey(input.creator)
    const creatorFee = input.creatorFee ?? 0
    const jackpotFee = input.jackpotFee ?? 0
    const meta = input.metadata?.join(':') ?? ''
    const token = new PublicKey(input.token ?? NATIVE_MINT)
    if (!connected) {
      throw throwTransactionError(new Error('NOT_CONNECTED'))
    }

    const pool = getPoolAddress(token)

    return sendTx(
      provider.play(
        input.wager,
        input.bet,
        input.clientSeed ?? '',
        pool,
        token,
        creator,
        creatorFee,
        jackpotFee,
        meta,
        input.useBonus ?? false,
      ),
    )
  }

  return play
}


export function useGambaPlay2() {
  const { connected } = useWallet()
  const sendTx = useSendTransaction()
  const provider = useGambaProvider()

  const play = async (input: GambaPlayInput) => {
    const creator = new PublicKey(input.creator)
    const creatorFee = input.creatorFee ?? 0
    const jackpotFee = input.jackpotFee ?? 0
    const meta = input.metadata?.join(':') ?? ''
    const token = new PublicKey(input.token ?? NATIVE_MINT)
    
    if (!connected) {
      throw throwTransactionError(new Error('NOT_CONNECTED'))
    }

    const pool = getPoolAddress(token)

    // Create the priority fee instruction
    const PRIORITY_RATE = 10000 // Define the priority rate (in microLamports)
    const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: PRIORITY_RATE })

    // Get the game play instruction
    const gamePlayInstruction = provider.play(
      input.wager,
      input.bet,
      input.clientSeed ?? '',
      pool,
      token,
      creator,
      creatorFee,
      jackpotFee,
      meta,
      input.useBonus ?? false,
    )

    // Prepend the priority fee instruction to the game play instruction
    const transactionInstructions = [priorityFeeInstruction, gamePlayInstruction]

    // Send the transaction
    return await sendTx(transactionInstructions)
  }

  return play
}