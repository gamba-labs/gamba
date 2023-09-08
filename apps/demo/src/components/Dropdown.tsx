import React from 'react'
import styled from 'styled-components'

const StyledDropdown = styled.div<{visible: boolean}>`
  opacity: 0;
  transition: transform .2s ease, opacity .2s;
  position: absolute;
  visibility: hidden;
  z-index: 10;
  right: 0;
  & > div {
    display: grid;
    background: #222233;
    border-radius: var(--border-radius);
    overflow: hidden;
  }
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
  ${({ visible }) => visible && `
    opacity: 1;
    transform: translateY(0px)!important;
    visibility: visible;
  `}
`

export function Dropdown({ visible, children, anchor: _anchor }: React.PropsWithChildren<{visible: boolean, anchor?: 'bottom' | 'top'}>) {
  const ref = React.useRef<HTMLDivElement>(null!)

  const anchor = React.useMemo(
    () => {
      if (_anchor) return _anchor
      if (!ref.current) return 'bottom'
      return ref.current.getBoundingClientRect().y > window.innerHeight / 2 ? 'bottom' : 'top'
    }
    , [children, visible, _anchor],
  )

  return (
    <StyledDropdown ref={ref} visible={visible} className={anchor}>
      <div>
        {children}
      </div>
    </StyledDropdown>
  )
}
