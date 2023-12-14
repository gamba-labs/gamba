import React from 'react'
import styled from 'styled-components'

const Responsive = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  width: 100%;
  flex-direction: column;
  max-width: 100vw;
  height: 100%;
  left: 0;
  top: 0;
`

interface Props extends React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>> {
  maxScale?: number
  overlay?: boolean
}

export default function ResponsiveSize({ children, maxScale = 1, overlay, ...props }: Props) {
  const wrapper = React.useRef<HTMLDivElement>(null!)
  const inner = React.useRef<HTMLDivElement>(null!)
  const content = React.useRef<HTMLDivElement>(null!)

  React.useLayoutEffect(() => {
    let timeout: NodeJS.Timeout

    const resize = () => {
      const ww = wrapper.current.clientWidth / (content.current.scrollWidth + 40)
      const hh = wrapper.current.clientHeight / (content.current.clientHeight + 80)
      const zoom = Math.min(maxScale, ww, hh)
      inner.current.style.transform = 'scale(' + zoom + ')'
    }

    const ro = new ResizeObserver(resize)

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
  }, [maxScale])

  return (
    <Responsive {...props} ref={wrapper}>
      <div ref={inner}>
        <div ref={content}>
          {children}
        </div>
      </div>
    </Responsive>
  )
}
