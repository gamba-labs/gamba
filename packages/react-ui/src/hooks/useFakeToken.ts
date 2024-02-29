import { GambaPlayInput, GameResult, UiPoolState, throwTransactionError, useWalletAddress } from 'gamba-react-v2'
import React from 'react'
import { StoreApi, create } from 'zustand'
import { GambaPlatformContext } from '../GambaPlatformProvider'
import { FAKE_TOKEN_MINT } from '../tokens'
import { getPoolAddress, SYSTEM_PROGRAM } from 'gamba-core-v2'

let betBuffer: GambaPlayInput

interface FakeAccountStore {
  balance: number
  set: StoreApi<FakeAccountStore>['setState']
}

export const useFakeAccountStore = create<FakeAccountStore>(
  (set) => ({
    balance: 1000e9,
    set,
  }),
)

useNextFakeResult.delay = 500

export function useNextFakeResult() {
  const store = useFakeAccountStore()
  const context = React.useContext(GambaPlatformContext)
  const user = useWalletAddress()

  return async function getNextFakeResult(): Promise<GameResult> {
    if (!betBuffer) throw new Error('No game in progress')

    await new Promise((resolve) => setTimeout(resolve, useNextFakeResult.delay))
    const resultIndex = Math.random() * betBuffer.bet.length | 0
    const multiplier = betBuffer.bet[resultIndex]
    const wager = betBuffer.wager
    const payout = multiplier * wager
    const profit = payout - wager

    store.set(
      (state) => ({ balance: state.balance + payout }),
    )

    return {
      creator: context.platform.creator,
      user,
      rngSeed: 'fake_rng_seed',
      clientSeed: betBuffer.clientSeed ?? '',
      nonce: 0,
      bet: betBuffer.bet,
      resultIndex,
      wager,
      payout,
      profit,
      multiplier,
      token: context.selectedPool.token,
      bonusUsed: 0,
      jackpotWin: 0,
    }
  }
}

export function useFakeToken() {
  const context = React.useContext(GambaPlatformContext)
  const balance = useFakeAccountStore()
  const result = useNextFakeResult()

  const isActive = context.selectedPool.token.equals(FAKE_TOKEN_MINT)

  const play = (input: GambaPlayInput) => {
    if (balance.balance < input.wager) {
      throw throwTransactionError(new Error('Insufficient funds'))
    }
    balance.set(({ balance }) => ({ balance: balance - input.wager }))
    betBuffer = input
    return 'fake_game'
  }

  const pool: UiPoolState = {
    publicKey: getPoolAddress(context.selectedPool.token),
    authority: SYSTEM_PROGRAM,
    token: context.selectedPool.token,
    minWager: 0,
    gambaFee: 0,
    poolFee: 0,
    jackpotBalance: 0,
    liquidity: BigInt(1e99),
    maxPayout: 1e99,
  }

  return { isActive, balance, result, play, pool }
}
