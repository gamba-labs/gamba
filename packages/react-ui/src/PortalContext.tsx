import React from "react"
import ReactDOM from "react-dom"

interface PortalStore {
  refs: Record<string, React.MutableRefObject<HTMLElement>>
  setRef: (target: string, ref: React.MutableRefObject<HTMLElement>) => void
}

const PortalContext = React.createContext<PortalStore>(null!)

export const PortalProvider = (props: React.PropsWithChildren) => {
  const [refs, _setRefs] = React.useState<Record<string, React.MutableRefObject<HTMLElement>>>({})
  const context: PortalStore = {
    refs,
    setRef(target, ref) {
      _setRefs((refs) => ({...refs, [target]: ref}))
    },
  }
  return (
    <PortalContext.Provider value={context}>
      {props.children}
    </PortalContext.Provider>
  )
}

/**
 * Renders the child elements to a <PortalTarget />.
 */
export function Portal(props: React.PropsWithChildren<{target: string}>) {
  const { refs } = React.useContext(PortalContext)
  return (
    <>
      {refs[props.target]?.current && ReactDOM.createPortal(props.children, refs[props.target]?.current)}
    </>
  )
}

/**
 * Renders the elements passed to a <Portal />.
 */
export function PortalTarget(props: React.PropsWithChildren<{target: string}>) {
  const { setRef } = React.useContext(PortalContext)
  const ref = React.useRef<HTMLDivElement>(null!)

  React.useEffect(
    () => {
      setRef(props.target, ref)
      return () => setRef(props.target, null!)
    },
    [props.target]
  )

  return (
    <div style={{display: 'contents'}} ref={ref}>
      {props.children}
    </div>
  )
}
