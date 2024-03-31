import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { NATIVE_MINT, SYSTEM_PROGRAM, getPoolAddress } from 'gamba-core-v2'
import React from 'react'
import { useGambaProvider } from '.'
import { GambaContext } from '../GambaProvider'
import { SendTransactionOptions, throwTransactionError, useSendTransaction } from './useSendTransaction'
import { GambaPluginInput } from '../plugins'

export interface GambaPlayInput {
  wager: number
  bet: number[]
  creator: string | PublicKey
  creatorFee?: number
  jackpotFee?: number
  clientSeed?: string
  token?: string | PublicKey
  poolAuthority?: string | PublicKey
  metadata?: (string | number)[]
  useBonus?: boolean
}

export function useGambaPlay() {
  const { connected } = useWallet()
  const sendTx = useSendTransaction()
  const context = React.useContext(GambaContext)
  const provider = useGambaProvider()

  return async function play(
    input: GambaPlayInput,
    instructions: TransactionInstruction[] = [],
    opts?: SendTransactionOptions,
  ) {
    const creator = new PublicKey(input.creator)
    const creatorFee = input.creatorFee ?? 0
    const jackpotFee = input.jackpotFee ?? 0
    const meta = input.metadata?.join(':') ?? ''
    const token = new PublicKey(input.token ?? NATIVE_MINT)
    const poolAuthority = new PublicKey(input.poolAuthority ?? SYSTEM_PROGRAM)

    const pluginInput: GambaPluginInput = {
      wallet: provider.user,
      creator,
      token,
      wager: input.wager,
      bet: input.bet,
      input,
    }

    const pluginInstructions = (await Promise.all(
      context.plugins
        .map((x) => {
          return x(pluginInput, provider)
        }),
    )).flat()

    if (!connected) {
      throw throwTransactionError(new Error('NOT_CONNECTED'))
    }

    const pool = getPoolAddress(token, poolAuthority)

    return sendTx(
      [
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
        ...pluginInstructions,
        ...instructions,
      ],
      { ...opts, label: 'play' },
    )
  }
}
