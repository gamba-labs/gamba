import React from 'react'

/**
 * Basic UI related stuff
 */
interface AppContext {
  modal: JSX.Element | undefined
  setModal: (modal: JSX.Element | undefined) => void
}

const AppContext = React.createContext<AppContext>(null!)

export function AppContextProvider({ children }: React.PropsWithChildren) {
  const [modal, setModal] = React.useState<JSX.Element>()

  return (
    <AppContext.Provider value={{ modal, setModal }}>
      {children}
    </AppContext.Provider>
  )
}
