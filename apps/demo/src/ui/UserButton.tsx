import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useBonusBalance, useGamba } from 'gamba/react'
import { formatLamports, useClaim, useCloseAccount, useCreateAccount, useRedeemBonus } from 'gamba/react-ui'
import React, { useState } from 'react'
import { useOnClickOutside } from '../hooks/useOnClickOutside'
import { Button2 } from '../components/Button/Button'
import { Dropdown } from '../components/Dropdown'
import { Modal2 } from '../components/Modal/Modal'
import { Icon } from '../components/Icon'

function RedeemBonusButton() {
  const [redeemBonus, loading] = useRedeemBonus()
  const bonusBalance = useBonusBalance()

  if (bonusBalance === 0) {
    return null
  }

  return (
    <Button2 onClick={() => redeemBonus(bonusBalance)} loading={loading}>
      Redeem {formatLamports(bonusBalance, 'gSOL')}
    </Button2>
  )
}

export function ClaimButton() {
  const gamba = useGamba()
  const [claim, loading] = useClaim()

  if (gamba.balances.user < 1000) {
    return null
  }


  return (
    <Button2 onClick={() => claim()} loading={loading}>
      Claim {formatLamports(gamba.balances.user)}
    </Button2>
  )
}

function CopyAddressButton() {
  const gamba = useGamba()
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(gamba.wallet.publicKey.toBase58())
    setCopied(true)
    setTimeout(() => setCopied(false), 500)
  }

  return (
    <Button2 onClick={copy}>
      {copied ? 'Copied' : 'Copy Address'}
    </Button2>
  )
}

function ShuffleSeedButton() {
  const gamba = useGamba()

  const shuffle = () => {
    gamba.updateSeed()
  }

  return (
    <Button2 onClick={shuffle} icon={<Icon.Shuffle />}>
      SEED: {gamba.seed}
    </Button2>
  )
}

function CloseAccountButton({ onClosed }: {onClosed?: () => void}) {
  const gamba = useGamba()
  const [closeAccount, loading] = useCloseAccount()

  const close = async () => {
    await closeAccount()
    onClosed && onClosed()
  }

  if (!gamba.user.created) return null

  return (
    <Button2 loading={loading} onClick={close}>
      Close Account
    </Button2>
  )
}

function CreateAccountButton() {
  const gamba = useGamba()
  const [createAccount, loading] = useCreateAccount()

  if (gamba.user.created) return null

  return (
    <Button2 loading={loading} onClick={createAccount}>
      Create Account
    </Button2>
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
        <Modal2 onClose={() => setModal(false)}>
          <h1>More Options</h1>
          <ShuffleSeedButton />
          <CloseAccountButton onClosed={() => setModal(false)} />
          <CreateAccountButton />
          <Button2
            as="a"
            icon={<Icon.ExternalLink />}
            href="https://gamba.so/"
            target="_blank"
          >
            More info
          </Button2>
        </Modal2>
      )}
      <div style={{ position: 'relative' }} ref={ref}>
        <Button2
          onClick={() => setVisible(!visible)}
          icon={<img src={wallet.wallet?.adapter.icon} height="20px" />}
          loading={gamba.user.created && gamba.user.status !== 'playing'}
        >
          {formatLamports(gamba.balances.total)}
        </Button2>
        <Dropdown visible={visible}>
          <CopyAddressButton />
          <ClaimButton />
          <RedeemBonusButton />
          {wallet.connected && (
            <Button2 onClick={() => wallet.disconnect()}>
              Disconnect
            </Button2>
          )}
          <Button2 onClick={() => setModal(true)}>
            More Options <Icon.ArrowRight />
          </Button2>
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
        <Button2 onClick={connect}>
          {wallet.connecting ? 'Connecting...' : 'Connect'}
        </Button2>
      )}
    </>
  )
}
