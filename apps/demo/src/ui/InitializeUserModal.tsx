import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaError2 } from 'gamba'
import { GambaError, useGamba, useGambaError } from 'gamba/react'
import React from 'react'
import { Modal } from '../components/Modal'
import { Button } from '../components/Button'

function InnerModal({ onDone, onCancel }: {onDone: () => void, onCancel: () => void}) {
  const [creating, setCreating] = React.useState(false)
  const [initUser, setInitUser] = React.useState(false)
  const gamba = useGamba()

  const create = async () => {
    try {
      setCreating(true)
      await gamba.client.initializeAccount()

      await gamba.client.userAccount.waitForState(
        (current) => {
          if (current.decoded?.created) {
            //
            return true
          }
        },
      )

      setInitUser(true)

      await gamba.client.userAccount.waitForState(
        (current) => {
          if (current.decoded?.status?.playing) {
            //
            return true
          }
        },
      )

      onDone()
    } catch {
      onCancel()
    } finally {
      setCreating(false)
    }
  }

  return (
    <Modal onClose={onCancel}>
      <h1>Welcome!</h1>
      <p>
        In order to play you need to create an account to interract with the Solana program.
        <br />
        This only needs to be done once.
      </p>
      <Button color="white" loading={creating} pulse onClick={create}>
        {!initUser ? 'Initialize Account' : 'Initializing user...'}
      </Button>
    </Modal>
  )
}

export function InitializeAccountModal() {
  const gamba = useGamba()
  const wallet = useWallet()
  const walletModal = useWalletModal()
  const [error, setError] = React.useState<GambaError2 | null>(null)
  const [error2, setError2] = React.useState<GambaError2 | null>(null)

  useGambaError(
    (err) => {
      console.error(err)
      if (err.message === GambaError.PLAY_BEFORE_INITIALIZED) {
        if (wallet.connected) {
          err.handle()
          setError(err)
        } else {
          walletModal.setVisible(true)
        }
      }
      if (err.message === GambaError.INSUFFICIENT_BALANCE) {
        setError2(err)
      }
    },
  )

  if (error2) {
    return (
      <Modal onClose={() => setError2(null)}>
        <h1>Insufficient Balance</h1>
        <p>
          You need more funds to make this bet!
          Send funds to this address to continue:
        </p>
        <Button
          onClick={() => navigator.clipboard.writeText(gamba.wallet.publicKey.toBase58())}
          variant="ghost"
          size="small"
        >
          {gamba.wallet.publicKey.toBase58()}
        </Button>
        <Button onClick={() => setError2(null)}>
          Okay
        </Button>
      </Modal>
    )
  }

  if (!error) return null

  return (
    <InnerModal
      onDone={() => {
        error.resolve()
        setError(null)
      }}
      onCancel={() => {
        error.reject()
        setError(null)
      }}
    />
  )
}
