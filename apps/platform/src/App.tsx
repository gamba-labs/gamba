import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useTransactionError } from 'gamba-react-v2'
import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Modal } from './components/Modal'
import { StyledSection } from './components/Slider'
import { useToast } from './hooks/useToast'
import Dashboard, { Games } from './sections/Dashboard/Dashboard'
import Game from './sections/Game/Game'
import Header from './sections/Header'
import RecentPlays from './sections/RecentPlays/RecentPlays'
import Toasts from './sections/Toasts'

function ScrollToTop() {
  const { pathname } = useLocation()
  React.useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function ErrorHandler() {
  const walletModal = useWalletModal()
  const toast = useToast()
  const [error, setError] = React.useState<Error>()

  useTransactionError(
    (error) => {
      if (error.message === 'NOT_CONNECTED') {
        walletModal.setVisible(true)
        return
      }
      toast({ title: '❌ Transaction error', description: error?.error?.errorMessage ?? error.message })
    },
  )

  // const walletAddress = useWalletAddress()
  // useGambaEventListener(
  //   'GameSettled',
  //   (event) => {
  //     if (event.data.user.equals(walletAddress)) {
  //       setTimeout(() => {
  //         if (event.data.payout.toNumber() > 0) {
  //           // const profit = event.data.payout.toNumber() - event.data.wager.toNumber()
  //           // toast({title: `🎉 ${(profit / (10 ** token.decimals))} ${token.symbol}`, description: ""})
  //         }
  //       }, 1000)
  //     }
  //   },
  //   [walletAddress],
  // )

  return (
    <>
      {error && (
        <Modal onClose={() => setError(undefined)}>
          <h1>Error occured</h1>
          <p>{error.message}</p>
        </Modal>
      )}
    </>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <ErrorHandler />
      <Header />
      <Toasts />
      <StyledSection>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/:gameId" element={<Game />} />
        </Routes>
        <div>
          <div>Demo Games</div>
          <Games />
        </div>
        <div>
          <div style={{ paddingBottom: 10 }}>Recent Plays</div>
          <RecentPlays />
        </div>
      </StyledSection>
    </>
  )
}
