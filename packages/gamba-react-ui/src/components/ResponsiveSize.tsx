import React, { HTMLAttributes, useLayoutEffect, useRef } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  width: 100%;
  flex-direction: column;
  max-width: 100vw;
  height: 100%;
`

interface Props {
  maxScale?: number
}

export function ResponsiveSize({ children, maxScale = 1, ...props }: HTMLAttributes<HTMLDivElement> & Props) {
  const wrapper = useRef<HTMLDivElement>(null!)
  const inner = useRef<HTMLDivElement>(null!)
  const okok = useRef<HTMLDivElement>(null!)
  useLayoutEffect(() => {
    let timeout: any
    const resize = () => {
      const ww = wrapper.current.clientWidth / (okok.current.scrollWidth + 40)
      const hh = wrapper.current.clientHeight / (okok.current.clientHeight + 80)
      const zoom = Math.min(maxScale, ww, hh)
      inner.current.style.transform = 'scale(' + zoom + ')'
    }
    resize()
    window.addEventListener('resize', () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        inner.current.style.transition = 'transform .1s'
        resize()
      }, 250)
    })
  }, [])
  return (
    <Wrapper {...props} ref={wrapper}>
      <div ref={inner}>
        <div ref={okok}>
          {children}
        </div>
      </div>
    </Wrapper>
  )
}
