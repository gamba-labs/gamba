import { useWallet } from '@solana/wallet-adapter-react'
import { useContext, useMemo } from 'react'
import { ReferralContext } from './ReferralContext'
import { getReferralLink } from './referralUtils'
import { closeReferral, fetchReferral, getReferrerPda } from './program'
import { SendTransactionOptions, useGambaProvider, useSendTransaction } from 'gamba-react-v2'
import { useGambaPlatformContext } from '../hooks'

export function useReferral() {
  const { clearCache, onChain, recipient, referralStatus, prefix } = useContext(ReferralContext)
  const wallet = useWallet()
  const platform = useGambaPlatformContext()
  const provider = useGambaProvider()
  const sendTransaction = useSendTransaction()
  const referralLink = useMemo(() => wallet.publicKey && getReferralLink(prefix, wallet.publicKey), [prefix, wallet.publicKey?.toString()])

  const getOnChainAddress = async () => {
    try {
      if (!wallet.publicKey) return null
      const pda = getReferrerPda(platform.platform.creator, wallet.publicKey)
      const address = await fetchReferral(provider.anchorProvider, pda)
      return address
    } catch {
      return null
    }
  }

  const copyLinkToClipboard = () => {
    if (!wallet.publicKey) {
      throw new Error('NOT_CONNECTED')
    }
    if (referralLink) {
      navigator.clipboard.writeText(referralLink)
    }
  }

  const removeReferral = async (options?: SendTransactionOptions) => {
    const onChain = await getOnChainAddress()
    if (onChain) {
      const txId = await sendTransaction(
        closeReferral(
          provider.anchorProvider,
          platform.platform.creator,
        ),
        { confirmation: 'confirmed', ...options },
      )
      clearCache()
      return txId
    } else {
      clearCache()
    }
  }

  return { copyLinkToClipboard, removeReferral, recipient, onChain, referralStatus, referralLink }
}
