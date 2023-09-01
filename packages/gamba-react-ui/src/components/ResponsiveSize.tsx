import { HTMLAttributes, useLayoutEffect, useRef } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  width: 100%;
  flex-direction: column;
  max-width: 100vw;
  height: 100%;
  & > div {
    // transition: transform .1s ease;
  }
`

interface Props {
  maxScale?: number
}

export function ResponsiveSize({ children, maxScale = 1, ...props }: HTMLAttributes<HTMLDivElement> & Props) {
  const wrapper = useRef<HTMLDivElement>(null!)
  const inner = useRef<HTMLDivElement>(null!)
  const content = useRef<HTMLDivElement>(null!)

  useLayoutEffect(() => {
    let timeout: any

    const resize = () => {
      const ww = wrapper.current.clientWidth / (content.current.scrollWidth + 40)
      const hh = wrapper.current.clientHeight / (content.current.clientHeight + 80)
      const zoom = Math.min(maxScale, ww, hh)
      inner.current.style.transform = 'scale(' + zoom + ')'
    }

    const ro = new ResizeObserver(() => resize())

    ro.observe(wrapper.current)

    const resizeHandler = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        resize()
      }, 250)
    }

    window.addEventListener('resize', resizeHandler)

    return () => {
      window.removeEventListener('resize', resizeHandler)
      ro.disconnect()
      clearTimeout(timeout)
    }
  }, [])

  return (
    <Wrapper {...props} ref={wrapper}>
      <div ref={inner}>
        <div ref={content}>
          {children}
        </div>
      </div>
    </Wrapper>
  )
}
