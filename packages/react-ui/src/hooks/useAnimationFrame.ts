import { useLayoutEffect, useRef } from 'react'

export interface AnimationFrameData {
  time: number
  delta: number
}

export default (cb: (time: AnimationFrameData) => void) => {
  if (typeof performance === 'undefined' || typeof window === 'undefined') {
    return
  }

  const cbRef = useRef<(x: any) => void>(null!)
  const frame = useRef<number>()
  const init = useRef(performance.now())
  const last = useRef(performance.now())

  cbRef.current = cb

  const animate = (now: number) => {
    cbRef.current({
      time: (now - init.current) / 1000,
      delta: (now - last.current) / 1000,
    })
    last.current = now
    frame.current = requestAnimationFrame(animate)
  }

  useLayoutEffect(() => {
    frame.current = requestAnimationFrame(animate)
    return () => {
      frame.current && cancelAnimationFrame(frame.current)
    }
  }, [])
}
