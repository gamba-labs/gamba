import { useEffect, useLayoutEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { Close } from '../Svg'

const appear = keyframes`
  0% { opacity: 0; transform: scale(.9); }
  100% { opacity: 1; transform: scale(1); }
`

const Wrapper = styled.dialog`
  h1 {
    text-align: center;
  }
  box-shadow: 0 0 #0000, 0 0 #0000, 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  z-index: 1040;
  padding: 0;
  border: none;
  background: #10141f;
  color: white;
  width: 100%;
  height: 100vh;
  max-width: 100vw;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: .4em;
  }
  &::-webkit-scrollbar-thumb {
    bg-color: #cccccc33;
  }
  display: grid;
  grid-template-rows: auto 1fr;
  animation ${appear} .1s;
  @media (min-height: 460px) {
    width: 320px;
    height: 420px;
    border-radius: 10px;
  }

  ::backdrop {
    position: fixed;
    background: red;
  }

  &::modal {
    position: fixed;
    inset-block-start: 0px;
    inset-block-end: 0px;
    max-width: calc((100% - 6px) - 2em);
    max-height: calc((100% - 6px) - 2em);
    user-select: text;
    visibility: visible;
    overflow: auto;
    background: red;
  }
`

const CloseButton = styled.button`
  background: none;
  margin: 0;
  font-size: 18px;
  color: white;
  position: absolute;
  right: 10px;
  top: 10px;
  border: none;
  z-index: 11;
  opacity: .75;
  transition: opacity .2s;
  &:hover {
    opacity: 1;
  }
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
  z-index: 1000;
  background: #00000099;
`

function useLockBodyScroll() {
  useLayoutEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    // document.body.style.overflow = 'scroll'
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])
}

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
  const ref = useRef<HTMLDialogElement>(null!)

  useOnClickOutside(ref, onClose)
  useLockBodyScroll()

  return (
    <Container className="gamba-connect-modal-container">
      <Wrapper open className="gamba-connect-modal" ref={ref}>
        <CloseButton onClick={onClose}>
          <Close />
        </CloseButton>
        {children}
      </Wrapper>
    </Container>
  )
}
