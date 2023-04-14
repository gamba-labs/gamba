import { LAMPORTS_PER_SOL } from 'gamba-core'
import { useGamba } from 'gamba-react'
import { GambaLogo } from './Svg'
import { useGambaUi } from './context'
import { Button } from './styles'

export function GambaButton() {
  const gamba = useGamba()
  const setModal = useGambaUi((state) => state.setModal)
  return (
    <div>
      <Button onClick={() => setModal(true)}>
        <GambaLogo />
        {
          !gamba.user ? 'Select Wallet' : !gamba.user.created ? 'Create Account' : `${(gamba.balances.total / LAMPORTS_PER_SOL).toFixed(3)} SOL`
        }
      </Button>
    </div>
  )
}
