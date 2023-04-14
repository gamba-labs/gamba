import { useEffect, useRef } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  background: #090a0d;
  color: white;
  border-radius: 10px;
  min-width: 320px;
  max-width: 100vw;
  overflow: hidden;
`

const Container = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  background: #00000099;
`

function useOnClickOutside(ref: any, handler: (event: MouseEvent | TouchEvent) => void) {
  useEffect(
    () => {
      const listener = (event: MouseEvent | TouchEvent) => {
        if (!ref.current || ref.current.contains(event.target)) {
          return
        }
        handler(event)
      }
      document.addEventListener('mousedown', listener)
      document.addEventListener('touchstart', listener)
      return () => {
        document.removeEventListener('mousedown', listener)
        document.removeEventListener('touchstart', listener)
      }
    },
    [ref, handler],
  )
}

export function Modal({ children, onClose }: React.PropsWithChildren<{onClose: () => void}>) {
  const ref = useRef<HTMLDivElement>(null!)

  useOnClickOutside(ref, onClose)

  return (
    <Container>
      <Wrapper ref={ref}>
        {children}
      </Wrapper>
    </Container>
  )
}
