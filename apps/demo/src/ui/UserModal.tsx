import { useCloseAccount, useCreateAccount, useGamba } from 'gamba/react'
import { formatLamports } from 'gamba/react-ui'
import React from 'react'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { Modal } from '../components/Modal'

interface Props {
  onClose: () => void
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

export function UserModal({ onClose }: Props) {
  const gamba = useGamba()

  return (
    <Modal onClose={onClose}>
      <h1>{formatLamports(gamba.balances.total)}</h1>
      <p>{gamba.wallet.publicKey.toBase58()}</p>
      <div style={{ display: 'grid', gap: '10px' }}>
        <Button
          onClick={() => gamba.updateSeed()}
          icon={<Icon.Shuffle />}
        >
          SEED: {gamba.seed}
        </Button>
        <CloseAccountButton onClosed={onClose} />
        <CreateAccountButton />
        <Button
          as="a"
          icon={<Icon.ExternalLink />}
          href="https://www.gamba.so/docs/account"
          target="_blank"
        >
          More info
        </Button>
      </div>
    </Modal>
  )
}
