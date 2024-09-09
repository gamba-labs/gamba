import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaUi, useReferral } from 'gamba-react-ui-v2'
import React, { useState } from 'react'
import { Modal } from '../components/Modal'
import { PLATFORM_REFERRAL_FEE } from '../constants'
import { useToast } from '../hooks/useToast'
import { useUserStore } from '../hooks/useUserStore'
import { truncateString } from '../utils'

function UserModal() {
  const user = useUserStore()
  const wallet = useWallet()
  const toast = useToast()
  const walletModal = useWalletModal()
  const referral = useReferral()
  const [removing, setRemoving] = useState(false)

  const copyInvite = () => {
    try {
      referral.copyLinkToClipboard()
      toast({
        title: '📋 Copied to clipboard',
        description: 'Your referral code has been copied!',
      })
    } catch {
      walletModal.setVisible(true)
    }
  }

  const revokeInvite = async () => {
    try {
      setRemoving(true)
      await referral.removeReferral()
    } finally {
      setRemoving(false)
    }
  }

  return (
    <Modal onClose={() => user.set({ userModal: false })}>
      <h1>
        {truncateString(wallet.publicKey?.toString() ?? '', 6, 3)}
      </h1>
      <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', width: '100%', padding: '0 20px' }}>
        <GambaUi.Button onClick={copyInvite}>
          💸 Copy Invite
        </GambaUi.Button>
        <div style={{ opacity: '.8', fontSize: '80%' }}>
          Share your link to earn a {(PLATFORM_REFERRAL_FEE * 100)}% fee when players use this platform.
        </div>
        {referral.recipient && (
          <GambaUi.Button disabled={removing} onClick={revokeInvite}>
            Revoke invite
          </GambaUi.Button>
        )}
        <GambaUi.Button onClick={() => wallet.disconnect()}>
          Disconnect
        </GambaUi.Button>
      </div>
    </Modal>
  )
}

export function UserButton() {
  const walletModal = useWalletModal()
  const wallet = useWallet()
  const user = useUserStore()

  const connect = () => {
    if (wallet.wallet) {
      wallet.connect()
    } else {
      walletModal.setVisible(true)
    }
  }

  return (
    <>
      {wallet.connected && user.userModal && (
        <UserModal />
      )}
      {wallet.connected ? (
        <div style={{ position: 'relative' }}>
          <GambaUi.Button
            onClick={() => user.set({ userModal: true })}
          >
            <div style={{ display: 'flex', gap: '.5em', alignItems: 'center' }}>
              <img src={wallet.wallet?.adapter.icon} height="20px" />
              {truncateString(wallet.publicKey?.toBase58(), 3)}
            </div>
          </GambaUi.Button>
        </div>
      ) : (
        <GambaUi.Button onClick={connect}>
          {wallet.connecting ? 'Connecting' : 'Connect'}
        </GambaUi.Button>
      )}
    </>
  )
}
