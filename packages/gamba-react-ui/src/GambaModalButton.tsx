import { useWallet } from '@solana/wallet-adapter-react'
import { lamportsToSol } from 'gamba-core'
import { useGamba } from 'gamba-react'
import { Button } from './components/Button'
import { useGambaUi } from './context'

export function GambaModalButton() {
  const gamba = useGamba()
  const { wallet, connected } = useWallet()
  const setModal = useGambaUi((state) => state.setModal)
  return (
    <div>
      <Button icon={wallet?.adapter.icon} onClick={() => setModal(true)}>
        {connected && wallet && gamba.wallet ? (
          <>
            {lamportsToSol(gamba.balances.total).toFixed(3)} SOL
          </>
        ) : connected && !gamba.user?.created ? (
          <>
            Create Account
          </>
        ) : (
          <>
            Select Wallet
          </>
        )}
      </Button>
    </div>
  )
}
