import { GambaError, useGambaErrorHander } from 'gamba-react'
import { useRef } from 'react'
import { Alerts } from './Alerts'
import { GambaModal } from './GambaModal'
import { GambaUiContext, GambaUiStore, createGambaUiStore, useGambaUi } from './context'
import { GlobalStyle } from './styles'
import { GameBundle } from './types'

export interface GambaUiProps {
  games: GameBundle[]
}

function Inner({ children }: React.PropsWithChildren) {
  const modal = useGambaUi((state) => state.modal)
  const setModal = useGambaUi((state) => state.setModal)

  useGambaErrorHander((err) => {
    if (err === GambaError.PLAY_WITHOUT_CONNECTED) {
      setModal(true)
    }
  })

  return (
    <>
      {modal && <GambaModal onClose={() => setModal(false)} />}
      <GlobalStyle />
      <Alerts />
      {children}
    </>
  )
}

type GambaUiProviderProps = React.PropsWithChildren<GambaUiProps>

export function GambaUiProvider({ children, ...props }: GambaUiProviderProps) {
  const storeRef = useRef<GambaUiStore>()
  if (!storeRef.current) {
    storeRef.current = createGambaUiStore(props)
  }
  return (
    <GambaUiContext.Provider value={storeRef.current}>
      <Inner>
        {children}
      </Inner>
    </GambaUiContext.Provider>
  )
}
