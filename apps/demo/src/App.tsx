import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { GambaError2 } from 'gamba'
import { GambaError, useGamba, useGambaError } from 'gamba-react'
import { Button, Modal } from 'gamba/react-ui'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import View from './View'
import ScrollToTop from './components/ScrollToTop'

function Guide({ onDone, onCancel }: {onDone: () => void, onCancel: () => void}) {
  const wallet = useWallet()
  const [creating, setCreating] = React.useState(false)
  const [initUser, setInitUser] = React.useState(false)
  const gamba = useGamba()

  const create = async () => {
    try {
      setCreating(true)
      const req = await gamba.createAccount()
      await req.result()
      setInitUser(true)
      // await gamba._client.user.waitForState((state) => {
      //   if (state.decoded?.status.playing) {
      //     return true
      //   }
      // })
      onDone()
    } finally {
      setCreating(false)
      setInitUser(false)
    }
  }

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
              Create an account to continue playing.<br />
              This only needs to be done once.
              <Button loading={creating} pulse onClick={create}>
                Create account!
              </Button>
            </>
          )}
        </>
      )}
    </Modal>
  )
}

export function App() {
  const [error, setError] = React.useState<GambaError2>()
  const { connection } = useConnection()
  const wallet = useWallet()
  console.debug('App Connection', connection)
  console.debug('App Wallet', wallet)

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
