import { useLayoutEffect, useRef } from 'react'

export interface AnimationFrameData {
  time: number
  delta: number
}

export default function useAnimationFrame(
  cb: (time: AnimationFrameData) => void
): void {
  if (typeof performance === 'undefined' || typeof window === 'undefined') {
    return
  }

  const cbRef = useRef<(x: AnimationFrameData) => void>(cb)
  const frame = useRef<number | undefined>(undefined)
  const init = useRef(performance.now())
  const last = useRef(performance.now())

  cbRef.current = cb

  const animate = (now: number) => {
    const delta = (now - last.current) / 1000
    const time = (now - init.current) / 1000

    cbRef.current({ time, delta })
    last.current = now
    frame.current = requestAnimationFrame(animate)
  }

  useLayoutEffect(() => {
    frame.current = requestAnimationFrame(animate)
    return () => {
      if (frame.current !== undefined) {
        cancelAnimationFrame(frame.current)
      }
    }
  }, [])
}
