import React from 'react'
import styled from 'styled-components'

const StyledDropdown = styled.div`
  opacity: 0;
  transition: transform .2s ease, opacity .2s;
  pointer-events: none;
  width: 100%;
  overflow: hidden;
  position: absolute;

  background: #222233 ;
  border-radius: 10px;

  &.top {
    top: 100%;
    margin-top: 10px;
    transform: translateY(-10px);
  }
  &.bottom {
    bottom: 100%;
    margin-bottom: 10px;
    transform: translateY(10px);
  }
  &.visible {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0px);
  }
`

export function Dropdown({ visible, children }: React.PropsWithChildren<{visible: boolean}>) {
  const ref = React.useRef<HTMLDivElement>(null!)

  const anchor = React.useMemo(
    () => {
      if (!ref.current) return 'bottom'
      return ref.current.getBoundingClientRect().y > window.innerHeight / 2 ? 'bottom' : 'top'
    }
    , [children, visible],
  )

  return (
    <StyledDropdown ref={ref} className={'menu ' + (visible ? 'visible ' :  '') + anchor}>
      {children}
    </StyledDropdown>
  )
}
