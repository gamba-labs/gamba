import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useBonusBalance, useClaim, useGamba, useRedeemBonus } from 'gamba/react'
import { formatLamports } from 'gamba/react-ui'
import React, { useState } from 'react'
import { Button, CopyButton } from '../components/Button'
import { Dropdown } from '../components/Dropdown'
import { useOnClickOutside } from '../hooks/useOnClickOutside'
import { UserModal } from './UserModal'

function RedeemBonusButton() {
  const [redeemBonus, loading] = useRedeemBonus()
  const bonusBalance = useBonusBalance()

  if (bonusBalance === 0) {
    return null
  }

  return (
    <Button onClick={() => redeemBonus(bonusBalance)} loading={loading}>
      Redeem {formatLamports(bonusBalance, 'gSOL')}
    </Button>
  )
}

export function ClaimButton() {
  const gamba = useGamba()
  const [claim, loading] = useClaim()

  if (gamba.balances.user < 1000) {
    return null
  }


  return (
    <Button variant="ghost" onClick={() => claim()} loading={loading}>
      Claim {formatLamports(gamba.balances.user)}
    </Button>
  )
}

function ConnectedButton() {
  const [modal, setModal] = React.useState(false)
  const gamba = useGamba()
  const wallet = useWallet()
  const ref = React.useRef<HTMLDivElement>(null!)
  const [visible, setVisible] = useState(false)

  useOnClickOutside(ref, () => setVisible(false))

  return (
    <>
      {modal && (
        <UserModal
          onClose={() => setModal(false)}
        />
      )}
      <div style={{ position: 'relative' }} ref={ref}>
        <Button
          onClick={() => setVisible(!visible)}
          icon={<img src={wallet.wallet?.adapter.icon} height="20px" />}
          loading={gamba.user.created && gamba.user.status !== 'playing'}
        >
          {formatLamports(gamba.balances.total)}
        </Button>
        <Dropdown visible={visible}>
          <CopyButton variant="ghost" content={gamba.wallet.publicKey.toBase58()}>
            Copy Address
          </CopyButton>
          <ClaimButton />
          <RedeemBonusButton />
          {wallet.connected && (
            <Button variant="ghost" onClick={() => wallet.disconnect()}>
              Disconnect
            </Button>
          )}
          <Button variant="ghost" onClick={() => setModal(true)}>
            More Options
          </Button>
        </Dropdown>
      </div>
    </>
  )
}

export function UserButton() {
  const walletModal = useWalletModal()
  const wallet = useWallet()

  const connect = () => {
    if (wallet.wallet) {
      wallet.connect()
    } else {
      walletModal.setVisible(true)
    }
  }

  return (
    <>
      {wallet.connected ? <ConnectedButton /> : (
        <Button onClick={connect}>
          {wallet.connecting ? 'Connecting...' : 'Connect'}
        </Button>
      )}
    </>
  )
}
