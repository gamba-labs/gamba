import React from 'react'

export const Time: React.FC<{time: number}> = ({ time }) => {
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
