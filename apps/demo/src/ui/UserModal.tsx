import { useCloseAccount, useCreateAccount, useGamba } from 'gamba/react'
import { formatLamports } from 'gamba/react-ui'
import React from 'react'
import { Button, CopyButton } from '../components/Button'
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
      <CopyButton
        content={gamba.wallet.publicKey.toBase58()}
        variant="ghost"
        size="small"
        style={{ width: '100%' }}
      >
        {gamba.wallet.publicKey.toBase58()}
      </CopyButton>
      <div>
        {gamba.user.status}
      </div>
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
