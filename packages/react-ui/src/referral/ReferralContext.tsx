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
  referrerAddress: PublicKey | null
  isOnChain: boolean
  prefix: string
  referralStatus: 'local' | 'on-chain' | 'fetching'
  clearCache: () => void
  setCache: (address: PublicKey, isOnChain?: boolean) => void
}

export const ReferralContext = createContext<ReferralContext>({
  referrerAddress: null,
  isOnChain: false,
  prefix: defaultPrefix,
  referralStatus: 'local',
  clearCache: () => null,
  setCache: () => null,
})

export interface ReferralProviderProps {
  fee: number
  prefix?: string
  autoAccept?: boolean
  /** localStorage or sessionStorage */
  storage?: Storage
}

export function ReferralProvider({
  fee,
  prefix = defaultPrefix,
  children,
  storage = localStorage,
  autoAccept = true,
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
      // Check if we have an active invite URL (?ref=<address>)
      const urlAddress = getReferralAddressFromUrl(prefix)
      if (autoAccept && urlAddress) {
        // Store the referral address in "referral-new", since user might not have connected in this step
        storage.setItem('referral-new', urlAddress.toString())

        // Refresh
        const url = new URL(window.location.href)
        const params = url.searchParams
        params.delete(prefix)
        const newUrl = url.origin + url.pathname + (params.toString() ? '?' + params.toString() : '')
        window.history.replaceState({}, document.title, newUrl)
        return
      }

      if (!wallet.publicKey) {
        setReferralCache({ address: null, isOnChain: false })
        return
      }

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
          setReferralCache({ address: storedReferralForAddress, isOnChain: false })
          return
        }
        const newReferral = getPublicKeyFromStorage('referral-new')
        if (newReferral && !newReferral.equals(wallet.publicKey)) {
          // Update and use local address
          setReferralCache({ address: newReferral, isOnChain: false })
          storage.setItem('referral-' + wallet.publicKey.toString(), newReferral.toString())
          storage.removeItem('referral-new')
        }
      } finally {
        if (!isCancelled)
          setIsFetchingOnChain(false)
      }
    }

    handleReferral()

    return () => {
      isCancelled = true
    }
  }, [
    autoAccept,
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
        1,
      ),
    )
  }, [fee, referralCache.address, referralCache.isOnChain])

  const clearCache = () => {
    if (wallet.publicKey) {
      storage.removeItem('referral-' + wallet.publicKey.toString())
    }
    storage.removeItem('referral-new')
    setReferralCache({ address: null, isOnChain: false })
  }

  const setCache = (address: PublicKey, isOnChain = false) => {
    if (wallet.publicKey) {
      storage.setItem('referral-' + wallet.publicKey.toString(), address.toString())
    }
    storage.setItem('referral-new', address.toString())
    setReferralCache({ address: address, isOnChain })
  }

  return (
    <ReferralContext.Provider value={{
      prefix,
      isOnChain: referralCache.isOnChain,
      referrerAddress: referralCache.address,
      referralStatus: isFetchingOnChain ? 'fetching' : referralCache.isOnChain ? 'on-chain' : 'local',
      clearCache,
      setCache,
    }}>
      {children}
    </ReferralContext.Provider>
  )
}
