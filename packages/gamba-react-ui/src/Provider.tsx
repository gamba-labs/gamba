import { useConnection } from '@solana/wallet-adapter-react'
import { getRecentEvents } from 'gamba-core'
import { GambaError, useGamba, useGambaErrorHander, useGambaEvent } from 'gamba-react'
import { PropsWithChildren, useEffect, useRef } from 'react'
import { BrowserRouter, useInRouterContext } from 'react-router-dom'
import { GambaModal } from './GambaModal'
import { Header } from './components/Header'
import { GambaUiContext, createGambaUiStore, useGambaUi } from './context'
import { GameBundle } from './types'

export interface GambaUiProps {
  games: GameBundle[]
}

type GambaUiProviderProps = React.PropsWithChildren<GambaUiProps>

function useRecentPlays() {
  const { connection } = useConnection()
  const { house } = useGamba()
  const addRecentPlays = useGambaUi((state) => state.addRecentPlays)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current || !house?.state.rng) {
      return
    }
    fetched.current = true
    getRecentEvents(connection, { signatureLimit: 20, rngAddress: house.state.rng }).then((events) => {
      addRecentPlays(events)
    }).catch((err) => {
      console.error('Failed to get events', err)
    })
  }, [house])

  useGambaEvent((event) => {
    addRecentPlays([event])
  })
}

export function GambaUiProvider({ children, games }: GambaUiProviderProps) {
  const store = useRef(createGambaUiStore({ games })).current
  return (
    <GambaUiContext.Provider value={store}>
      {children}
    </GambaUiContext.Provider>
  )
}

function Content({ children }: PropsWithChildren) {
  const inRouter = useInRouterContext()
  const modal = useGambaUi((state) => state.modal)
  const setModal = useGambaUi((state) => state.setModal)

  useGambaErrorHander((err) => {
    if (err === GambaError.PLAY_WITHOUT_CONNECTED) {
      setModal(true)
    }
  })

  useRecentPlays()

  const content = (
    <>
      {modal && <GambaModal onClose={() => setModal(false)} />}
      {children}
    </>
  )

  return inRouter ? content : (
    <BrowserRouter>
      {content}
    </BrowserRouter>
  )
}

export function GambaUi({ children, games }: GambaUiProviderProps) {
  return (
    <GambaUiProvider games={games}>
      <Content>
        {children}
      </Content>
    </GambaUiProvider>
  )
}
