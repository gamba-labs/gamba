import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useBonusBalance, useClaim, useCloseAccount, useCreateAccount, useGamba, useRedeemBonus } from 'gamba/react'
import { formatLamports } from 'gamba/react-ui'
import React, { useState } from 'react'
import { Button } from '../components/Button'
import { Dropdown } from '../components/Dropdown'
import { Icon } from '../components/Icon'
import { Modal } from '../components/Modal'
import { useOnClickOutside } from '../hooks/useOnClickOutside'

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

function CopyAddressButton() {
  const gamba = useGamba()
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(gamba.wallet.publicKey.toBase58())
    setCopied(true)
    setTimeout(() => setCopied(false), 500)
  }

  return (
    <Button variant="ghost" onClick={copy}>
      {copied ? 'Copied' : 'Copy Address'}
    </Button>
  )
}

function ShuffleSeedButton() {
  const gamba = useGamba()

  const shuffle = () => {
    gamba.updateSeed()
  }

  return (
    <Button onClick={shuffle} icon={<Icon.Shuffle />}>
      SEED: {gamba.seed}
    </Button>
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
    <Button loading={loading} onClick={close}>
      Close Account
    </Button>
  )
}

function CreateAccountButton() {
  const gamba = useGamba()
  const [createAccount, loading] = useCreateAccount()

  if (gamba.user.created) return null

  return (
    <Button loading={loading} onClick={createAccount}>
      Create Account
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
        <Modal onClose={() => setModal(false)}>
          <h1>{formatLamports(gamba.balances.total)}</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', textAlign: 'center' }}>
            <div>
              {formatLamports(gamba.balances.user)}
              <div>Claimable</div>
            </div>
            <div>
              {formatLamports(gamba.balances.bonus)}
              <div>Bonus</div>
            </div>
          </div>
          <Button
            onClick={() => navigator.clipboard.writeText(gamba.wallet.publicKey.toBase58())}
            variant="ghost"
            size="small"
          >
            {gamba.wallet.publicKey.toBase58()}
          </Button>
          <div>
            {gamba.user.status}
          </div>
          <ShuffleSeedButton />
          <CloseAccountButton onClosed={() => setModal(false)} />
          <CreateAccountButton />
          <Button
            as="a"
            icon={<Icon.ExternalLink />}
            href="https://gamba.so/"
            target="_blank"
          >
            More info
          </Button>
        </Modal>
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
          <CopyAddressButton />
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
