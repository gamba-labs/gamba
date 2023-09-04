import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton, useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaError2 } from 'gamba'
import { GambaError, useGamba, useGambaError } from 'gamba/react'
import { Button, Modal } from 'gamba/react-ui'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import View from './View'
import ScrollToTop from './components/ScrollToTop'

function Guide({ onDone, onCancel }: {onDone: () => void, onCancel: () => void}) {
  const wallet = useWallet()
  const walletModal = useWalletModal()
  const [creating, setCreating] = React.useState(false)
  const [initUser, setInitUser] = React.useState(false)
  const gamba = useGamba()

  // useOnClickOutside(dialog, () => onCancel())

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

  // React.useEffect(
  //   () => {
  //     if (!wallet.connected)
  //       walletModal.setVisible(true)
  //   }
  //   , [wallet.connected])

  // React.useEffect(
  //   () => {
  //     if (wallet.connected && gamba.user?.created && gamba.user?.status === 'playing') {
  //       onDone()
  //     }
  //   }
  //   , [wallet.connected, gamba.user])

  // if (!wallet.connected) return null

  return (
    <Modal onClose={onCancel}>
      {!wallet.connected ? (
        <WalletMultiButton />
      ) : (
        <>
          {initUser ? (
            'Initializing user!'
          ) : (
            <>
              In order to play you need to create an account to interract with the Solana program.<br />
              This only needs to be done once.<br />
              <Button loading={creating} pulse onClick={create}>
                Initialize Account
              </Button>
            </>
          )}
        </>
      )}
    </Modal  >
  )
}

export function App() {
  const [error, setError] = React.useState<GambaError2>()

  useGambaError(
    (err) => {
      if (err.message === GambaError.PLAY_BEFORE_INITIALIZED) {
        err.handle()
        setError(err)
      }
    },
  )

  return (
    <>
      <ScrollToTop />
      {error && (
        <Guide
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
