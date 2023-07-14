import { Signal } from '@hmans/signal'
import { Wallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { GambaError, GambaPlayParams } from 'gamba-core'
import { useEffect, useMemo } from 'react'
import { parseHouseAccount, parseUserAccount } from '../parsers'
import { randomSeed } from '../utils'
import { useGambaProvider } from './useGambaProvider'
import { useGambaSession, useSessionStore } from './useSession'

const errorSignal = new Signal<GambaError>()

export function useGambaError(callback: (err: GambaError) => void) {
  useEffect(() => {
    errorSignal.add(callback)
    return () => {
      errorSignal.remove(callback)
    }
  }, [callback])
}

export function useGamba() {
  const { connection } = useConnection()
  const provider = useGambaProvider()
  const mainSession = useGambaSession('main')
  const seed = useSessionStore((state) => state.seed)
  const set = useSessionStore((state) => state.set)
  const web3Wallet = useWallet()

  const updateSeed = () => set({ seed: randomSeed() })

  const wallet = mainSession.session?.wallet
  const user = useMemo(() => parseUserAccount(mainSession.session?.user), [mainSession.session?.user?.state])
  const house = useMemo(() => parseHouseAccount(provider.house), [provider.house.state])

  const userBalance = user?.balance ?? 0
  const walletBalance = wallet?.info?.lamports ?? 0
  const bonusBalance = user?.bonusBalance ?? 0

  const connect = async (wallet: Wallet) => {
    const session = await mainSession.create(wallet.adapter as any)
    await session.user.waitForState((e) => {
      if (e.info) {
        return true
      }
    })
    await session.wallet.waitForState((e) => {
      if (e.info) {
        return true
      }
    })
    return session
  }

  const play = async (
    config: number[],
    wager: number,
    params?: GambaPlayParams,
  ) => {
    if (!mainSession.session || !user?.created) {
      errorSignal.emit(GambaError.PLAY_WITHOUT_CONNECTED)
      throw new Error(GambaError.PLAY_WITHOUT_CONNECTED)
    }
    const req = await mainSession.session.play(config, wager, seed, params)
    return req
  }

  const withdraw = (amount?: number) => {
    if (!mainSession.session) {
      throw new Error('NO_SESSION')
    }

    const availableBalance = userBalance

    const a = amount ?? availableBalance

    if (a > availableBalance) {
      throw new Error(GambaError.FAILED_TO_GENERATE_RESULT)
    }

    return mainSession.session.withdraw(a)
  }

  const createAccount = async () => {
    if (!mainSession.session) {
      throw new Error('NO_SESSION')
    }
    return mainSession.session.createUserAccount()
  }

  const closeAccount = async () => {
    if (!mainSession.session) {
      throw new Error('NO_SESSION')
    }
    return mainSession.session.closeUserAccount()
  }

  const approveBonusToken = async () => {
    if (!mainSession.session) {
      throw new Error('NO_SESSION')
    }
    return mainSession.session.approveBonusToken()
  }

  const redeemBonusToken = async () => {
    if (!mainSession.session) {
      throw new Error('NO_SESSION')
    }
    return mainSession.session.redeemBonusToken()
  }

  const refresh = async () => {
    if (!mainSession.session) throw new Error('NO_SESSION')
    await mainSession.session.user.fetchState(connection)
    await mainSession.session.wallet.fetchState(connection)
    await provider.house.fetchState(connection)
  }

  const disconnect = async () => {
    await mainSession.destroy()
    await web3Wallet.disconnect()
  }

  return {
    creator: provider.creator,
    updateSeed,
    wallet,
    user,
    seed,
    withdraw,
    createAccount,
    closeAccount,

    redeemBonusToken,
    approveBonusToken,

    refresh,
    disconnect,
    house,
    session: mainSession.session,
    balances: {
      total: userBalance + walletBalance,
      bonus: bonusBalance,
      wallet: walletBalance,
      user: userBalance,
    },
    connect,
    play,
  }
}
