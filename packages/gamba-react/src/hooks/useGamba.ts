import { Signal } from '@hmans/signal'
import { Wallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { GambaError } from 'gamba-core'
import { useEffect, useMemo } from 'react'
import { parseHouseAccount, parseUserAccount } from '../parsers'
import { useGambaProvider } from './useGambaProvider'
import { useGambaSession, useSessionStore } from './useSession'

const errorSignal = new Signal<GambaError>()

export function useGambaErrorHander(callback: (err: GambaError) => void) {
  useEffect(() => {
    errorSignal.add(callback)
    return () => {
      errorSignal.remove(callback)
    }
  }, [callback])
}

interface GambaPlayParams {
  deductFees?: boolean
}

export function useGamba() {
  const provider = useGambaProvider()
  const mainSession = useGambaSession('main')
  const seed = useSessionStore((state) => state.seed)
  const web3Wallet = useWallet()

  const wallet = mainSession.session?.wallet
  const user = useMemo(() => parseUserAccount(mainSession.session?.user), [mainSession.session?.user?.state])
  const house = useMemo(() => parseHouseAccount(provider.house), [provider.house.state])

  const userBalance = user?.balance ?? 0
  const walletBalance = wallet?.info?.lamports ?? 0

  const { connection } = useConnection()

  const connect = async (wallet: Wallet) => {
    await wallet.adapter.connect()
    const session = await mainSession.create(wallet.adapter as any)

    await session.user.waitForState((e) => {
      if (e.info) {
        return { result: true }
      }
    })

    await session.wallet.waitForState((e) => {
      if (e.info) {
        return { result: true }
      }
    })

    return session
  }

  const play = (
    config: number[],
    wager: number,
    params: GambaPlayParams = { deductFees: false },
  ) => {
    if (!mainSession.session || !user?.created) {
      errorSignal.emit(GambaError.PLAY_WITHOUT_CONNECTED)
      throw new Error(GambaError.PLAY_WITHOUT_CONNECTED)
    }

    const _wager = params?.deductFees ? Math.ceil(wager / (1 + house!.fees.total)) : wager

    return mainSession.session.play(config, _wager, seed)
  }

  const withdraw = (amount?: number) => {
    if (!mainSession.session) {
      throw new Error('NO_SESSION')
    }

    return mainSession.session.withdraw(amount ?? userBalance)
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

  return {
    creator: provider.creator,
    wallet,
    user,
    seed,
    withdraw,
    createAccount,
    closeAccount,
    refresh: async () => {
      if (!mainSession.session) throw new Error('NO_SESSION')
      await mainSession.session.user.fetchState(connection)
      await mainSession.session.wallet.fetchState(connection)
      await provider.house.fetchState(connection)
    },
    house,
    session: mainSession.session,
    balances: {
      total: userBalance + walletBalance,
      wallet: walletBalance,
      user: userBalance,
    },
    disconnect: async () => {
      await mainSession.destroy()
      await web3Wallet.disconnect()
    },
    connect,
    play,
  }
}
