import { createContext, useContext, useState } from 'react'
import { GambaUiProps } from './Provider'

interface GambaUiState extends GambaUiProps {
  tos?: JSX.Element
  modal: boolean
  setModal: (modal: boolean) => void
}

export const GambaUiContext = createContext<GambaUiState>(null!)

export function useGambaUi() {
  const store = useContext(GambaUiContext)
  return store
}

export function GambaUiProvider({ children, ...props }: React.PropsWithChildren<GambaUiProps>) {
  const [modal, setModal] = useState(false)
  return (
    <GambaUiContext.Provider value={{ modal, setModal, ...props }}>
      {children}
    </GambaUiContext.Provider>
  )
}
