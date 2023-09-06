import React, { useLayoutEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { useOnClickOutside } from '../hooks/useOnClickOutside'

const appear = keyframes`
  0% { opacity: 0;}
  100% { opacity: 1;}
`

const appear2 = keyframes`
  0% { transform: scale(.9); }
  100% { transform: scale(1); }
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

const Wrapper = styled.div`
  h1 {
    text-align: center;
    padding: 40px 0 20px 0;
    font-size: 24px;
  }
  position: relative;
  box-shadow: 0 0 #0000, 0 0 #0000, 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  z-index: 1040;
  padding-bottom: 20px;
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
  animation ${appear} .3s, ${appear2} .1s;
  @media (min-height: 460px) {
    max-width: 400px;
    height: auto;
    border-radius: 10px;
  }
`

const CloseButton = styled.button`
  margin: 0;
  position: absolute;
  right: 10px;
  top: 10px;
  border: none;
  z-index: 11;
  opacity: .75;
  transition: opacity .2s, background .2s;
  background: #ffffff00;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  &:hover {
    opacity: 1;
    background: #ffffff11;
  }
  & svg {
    color: white;
    width: 75%;
    height: 75%;
  }
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

export function Modal({ children, onClose }: React.PropsWithChildren<{onClose: () => void}>) {
  const ref = useRef<HTMLDivElement>(null!)

  useOnClickOutside(ref, onClose)
  useLockBodyScroll()

  return (
    <Container className="gamba-connect-modal-container">
      <Wrapper className="gamba-connect-modal" ref={ref}>
        <CloseButton onClick={onClose}>
          <svg width="242" height="242" viewBox="0 0 242 242" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M241.208 29.0759L212.924 0.791748L121 92.7156L29.076 0.791748L0.79187 29.0762L92.7157 121L0.791748 212.924L29.076 241.208L121 149.284L212.924 241.208L241.208 212.924L149.284 121L241.208 29.0759Z" fill="currentColor" />
          </svg>
        </CloseButton>
        {children}
      </Wrapper>
    </Container>
  )
}
