import { useWallet } from '@solana/wallet-adapter-react'
import { GambaError, useGamba, useGambaError } from 'gamba-react'
import { Button } from './components/Button'
import { useGambaUi } from './context'
import { formatLamports } from './utils'

export function GambaConnectButton() {
  const gamba = useGamba()
  const { wallet, connected } = useWallet()
  const { setModal } = useGambaUi()

  const content = (() => {
    if (connected && wallet && gamba.wallet) {
      return formatLamports(gamba.balances.total)
    }
    if (connected && !gamba.user?.created) {
      return 'Create Account'
    }
    return 'Connect Wallet'
  })()

  useGambaError((err) => {
    if (err === GambaError.PLAY_WITHOUT_CONNECTED) {
      setModal(true)
    }
  })

  return (
    <>
      <Button icon={wallet?.adapter.icon} className="gamba-connect-button" onClick={() => setModal(true)}>
        {content}
      </Button>
    </>
  )
}

/**
 * @deprecated Use GambaConnectButton instead
**/
export function GambaModalButton() {
  return (
    <GambaConnectButton />
  )
}
