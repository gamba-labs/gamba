import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaError2 } from 'gamba'
import { GambaError, useGamba, useGambaError } from 'gamba/react'
import React from 'react'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'

function InitUserModal({ onResolve, onReject }: {onResolve: () => void, onReject: () => void}) {
  const [creating, setCreating] = React.useState(false)
  const [initUser, setInitUser] = React.useState(false)
  const gamba = useGamba()

  React.useEffect(
    () => {
      if (gamba.user.status === 'playing') {
        onResolve()
      }
    },
    [gamba.user.status],
  )

  const create = async () => {
    try {
      setCreating(true)
      await gamba.client.initializeAccount()
      await gamba.client.userAccount.anticipate(
        (current) => {
          if (current.decoded?.created) {
            return true
          }
        },
      )
      setInitUser(true)
    } catch {
      onReject()
    }
  }

  return (
    <Modal onClose={onReject}>
      <h1>Welcome!</h1>
      <p>
        Since this is your first time playing from this wallet, you need to initialize it to start playing.
        <br />
        This only needs to be done once.
      </p>
      <Button color="white" loading={creating} pulse onClick={create}>
        {!initUser ? 'Initialize' : 'Initializing..'}
      </Button>
    </Modal>
  )
}

function LowBalanceModal({ onResolve, onReject }: {onResolve: () => void, onReject: () => void}) {
  const gamba = useGamba()
  const initialBalance = React.useMemo(() => gamba.balances.total, [])

  React.useEffect(
    () => {
      if (gamba.balances.total > initialBalance) {
        onResolve()
      }
    },
    [gamba.balances.total],
  )

  return (
    <Modal onClose={onReject}>
      <h1>Insufficient Balance</h1>
      <p>
        You do not have enough SOL to make this bet.
        Send SOL to this address to continue:
        <Button
          onClick={() => navigator.clipboard.writeText(gamba.wallet.publicKey.toBase58())}
          variant="ghost"
          size="small"
        >
          {gamba.wallet.publicKey.toBase58()}
        </Button>
      </p>

      <Button onClick={onReject}>
        Cancel
      </Button>
    </Modal>
  )
}

export function ErrorHandlers() {
  const wallet = useWallet()
  const walletModal = useWalletModal()
  const [userError, setUserError] = React.useState<GambaError2 | null>(null)
  const [lowBalanceError, setLowBalanceError] = React.useState<GambaError2 | null>(null)

  useGambaError(
    (err) => {
      if (err.message === GambaError.PLAY_BEFORE_INITIALIZED) {
        if (wallet.connected) {
          err.handle()
          setUserError(err)
        } else {
          walletModal.setVisible(true)
        }
      }
      if (err.message === GambaError.INSUFFICIENT_BALANCE) {
        err.handle()
        setLowBalanceError(err)
      }
    },
  )

  return (
    <>
      {lowBalanceError && (
        <LowBalanceModal
          onResolve={() => {
            lowBalanceError.resolve()
            setLowBalanceError(null)
          }}
          onReject={() => {
            lowBalanceError.reject()
            setLowBalanceError(null)
          }}
        />
      )}
      {userError && (
        <InitUserModal
          onResolve={() => {
            userError.resolve()
            setUserError(null)
          }}
          onReject={() => {
            userError.reject()
            setUserError(null)
          }}
        />
      )}
    </>
  )
}
