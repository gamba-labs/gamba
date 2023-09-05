import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton, useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaError2 } from 'gamba'
import { GambaError, useGamba, useGambaError } from 'gamba/react'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import View from './View'
import { Button } from './components/Button'
import { Modal } from './components/Modal'
import ScrollToTop from './components/ScrollToTop'

function InitializeAccountModal({ onDone, onCancel }: {onDone: () => void, onCancel: () => void}) {
  // const walletModal = useWalletModal()
  const [creating, setCreating] = React.useState(false)
  const [initUser, setInitUser] = React.useState(false)
  const gamba = useGamba()

  const create = async () => {
    try {
      setCreating(true)
      const req = await gamba.methods.createAccount()
      await req.result()
      onDone()
    } finally {
      setCreating(false)
    }
  }

  return (
    <Modal onClose={onCancel}>
      <h1>Wecome!</h1>
      {initUser ? (
        'Initializing user...'
      ) : (
        <>
          In order to play you need to create an account to interract with the Solana program.<br />
          This only needs to be done once.
          <br />
          <br />
          <Button loading={creating} pulse onClick={create}>
            Initialize Account
          </Button>
        </>
      )}
    </Modal  >
  )
}

export function App() {
  const wallet = useWallet()
  const walletModal = useWalletModal()
  const [error, setError] = React.useState<GambaError2>()

  useGambaError(
    (err) => {
      if (err.message === GambaError.PLAY_BEFORE_INITIALIZED) {
        if (wallet.connected) {
          err.handle()
          setError(err)
        } else {
          walletModal.setVisible(true)
        }
      }
    },
  )

  return (
    <>
      <ScrollToTop />
      {error && (
        <InitializeAccountModal
          onDone={() => {
            error.resolve()
            setError(undefined)
          }}
          onCancel={() => {
            error.reject()
            setError(undefined)
          }}
        />
      )}
      <Routes>
        <Route
          path="/:shortName?"
          element={<View />}
        />
      </Routes>
    </>
  )
}
