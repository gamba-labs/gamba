import React, {
  useRef,
  useLayoutEffect,
  PropsWithChildren,
  HTMLAttributes,
} from 'react'
import styled from 'styled-components'

// styled wrapper
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

// Omit 'contentEditable' to avoid the type mismatch
type DivProps = Omit<HTMLAttributes<HTMLDivElement>, 'contentEditable'>

interface Props extends PropsWithChildren<DivProps> {
  maxScale?: number
  overlay?: boolean
}

export default function ResponsiveSize({
  children,
  maxScale = 1,
  overlay, // kept for future use
  ...props
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    let timeout: NodeJS.Timeout

    const resize = () => {
      if (
        !wrapperRef.current ||
        !innerRef.current ||
        !contentRef.current
      ) {
        return
      }
      const ww =
        wrapperRef.current.clientWidth /
        (contentRef.current.scrollWidth + 40)
      const hh =
        wrapperRef.current.clientHeight /
        (contentRef.current.clientHeight + 80)
      const zoom = Math.min(maxScale, ww, hh)
      innerRef.current.style.transform = `scale(${zoom})`
    }

    // observe size changes on the wrapper
    const ro = new ResizeObserver(resize)
    if (wrapperRef.current) {
      ro.observe(wrapperRef.current)
    }

    // also debounce window resizes
    const resizeHandler = () => {
      clearTimeout(timeout)
      timeout = setTimeout(resize, 250)
    }
    window.addEventListener('resize', resizeHandler)

    // initial scale
    resize()

    return () => {
      window.removeEventListener('resize', resizeHandler)
      ro.disconnect()
      clearTimeout(timeout)
    }
  }, [maxScale])

  return (
    <Responsive ref={wrapperRef} {...props}>
      <div ref={innerRef}>
        <div ref={contentRef}>{children}</div>
      </div>
    </Responsive>
  )
}
