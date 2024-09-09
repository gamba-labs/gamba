import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useGambaContext, useWalletAddress } from 'gamba-react-v2'
import React, { createContext, PropsWithChildren, useEffect, useState } from 'react'
import { useGambaPlatformContext } from '../hooks'
import { fetchReferral, getReferrerPda } from './program'
import { makeReferralPlugin } from './referralPlugin'
import { getReferralAddressFromUrl } from './referralUtils'

const defaultPrefix = 'code'

export interface ReferralContext {
  recipient: PublicKey | null
  onChain: boolean
  prefix: string
  referralStatus: 'local' | 'on-chain' | 'loading'
  clearCache: () => void
}

export const ReferralContext = createContext<ReferralContext>({
  recipient: null,
  onChain: false,
  prefix: defaultPrefix,
  referralStatus: 'local',
  clearCache: () => null,
})

export interface ReferralProviderProps {
  fee: number
  prefix?: string
  storage?: Storage
}

export function ReferralProvider({
  fee,
  prefix = defaultPrefix,
  children,
  storage = sessionStorage,
}: PropsWithChildren<ReferralProviderProps>) {
  const wallet = useWallet()
  const owner = useWalletAddress()
  const gambaContext = useGambaContext()
  const gambaPlatformContext = useGambaPlatformContext()
  const [isFetchingOnChain, setIsFetchingOnChain] = useState(false)
  const [referralCache, setReferralCache] = useState<{
    address: PublicKey | null
    isOnChain: boolean
  }>({ address: null, isOnChain: false })

  const getOnChainAddress = async () => {
    try {
      const pda = getReferrerPda(gambaPlatformContext.platform.creator, owner)
      const address = await fetchReferral(gambaContext.provider.anchorProvider, pda)
      return address
    } catch {
      return null
    }
  }

  const getPublicKeyFromStorage = (key: string) => {
    try {
      const value = storage.getItem(key)
      if (value) return new PublicKey(value)
    } catch {
      return
    }
  }

  useEffect(() => {
    let isCancelled = false

    const handleReferral = async () => {
      // 1. Check if we have an active invite URL (?ref=<address>)
      // (Update localStorage and refresh if found)
      const urlAddress = getReferralAddressFromUrl(prefix)
      if (urlAddress) {
        // Redirect and update localStorage cache.
        sessionStorage.setItem('referral-new', urlAddress.toString())
        const url = new URL(window.location.href)
        const params = url.searchParams
        params.delete(prefix)
        const newUrl = url.origin + url.pathname + (params.toString() ? '?' + params.toString() : '')
        window.history.replaceState({}, document.title, newUrl)
        return
      }

      if (!wallet.publicKey) {
        setReferralCache({ address: null, isOnChain: false })
      }

      if (wallet.publicKey) {
        // Fetch on-chain address determine if the transaction plugin needs to upsert a new one
        setIsFetchingOnChain(true)
        try {
          const onChainAddress = await getOnChainAddress()
          if (isCancelled) return
          if (!onChainAddress) throw new Error
          // Use on-chain address
          setReferralCache({ address: onChainAddress, isOnChain: true })
        } catch {
          if (isCancelled) return
          const storedReferralForAddress = getPublicKeyFromStorage('referral-' + wallet.publicKey.toString())
          if (storedReferralForAddress) {
            // Use local address
            setReferralCache({ address: new PublicKey(storedReferralForAddress), isOnChain: false })
            return
          }
          const newReferral = getPublicKeyFromStorage('referral-new')
          if (newReferral && !newReferral.equals(wallet.publicKey)) {
            // Update and use local address
            setReferralCache({ address: new PublicKey(newReferral), isOnChain: false })
            sessionStorage.setItem('referral-' + wallet.publicKey.toString(), newReferral.toString())
            sessionStorage.removeItem('referral-new')
          }
        } finally {
          if (!isCancelled)
            setIsFetchingOnChain(false)
        }
      }
    }

    handleReferral()

    return () => {
      isCancelled = true
    }
  }, [
    gambaPlatformContext.platform.creator.toString(),
    wallet.publicKey?.toString(),
    prefix,
  ])

  useEffect(() => {
    if (!referralCache.address) return
    return gambaContext.addPlugin(
      makeReferralPlugin(
        referralCache.address,
        !referralCache.isOnChain,
        fee,
      ),
    )
  }, [referralCache])

  const clearCache = () => {
    if (wallet.publicKey) {
      sessionStorage.removeItem('referral-' + wallet.publicKey.toString())
    }
    sessionStorage.removeItem('referral-new')
    setReferralCache({ address: null, isOnChain: false })
  }

  return (
    <ReferralContext.Provider value={{
      prefix,
      onChain: referralCache.isOnChain,
      recipient: referralCache.address,
      referralStatus: isFetchingOnChain ? 'loading' : referralCache.isOnChain ? 'on-chain' : 'local',
      clearCache,
    }}>
      {children}
    </ReferralContext.Provider>
  )
}
