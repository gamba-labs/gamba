import { useEffect, useState } from 'react'

export const Time = ({ time: _time }: {time: number}) => {
  const [time, setTime] = useState(_time)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const tick = setInterval(() => {
      setElapsed((x) => x + 1000)
    }, 1000)
    return () => {
      clearTimeout(tick)
    }
  }, [_time])

  const diff = (Date.now() - time)

  const d = (() => {
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours >= 1) {
      return hours + 'h'
    }
    if (minutes >= 1) {
      return minutes + 'm'
    }
    return seconds + 's'
  })()

  return (
    <>{d}</>
  )
}
