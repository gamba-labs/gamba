import React from 'react'
import * as Tone from 'tone'

interface PlaySoundParams {
  playbackRate?: number
}

class GambaSound {
  player = new Tone.Player
  ready = false

  constructor(url: string) {
    this.player.load(url)
      .then((x) => {
        this.ready = x.loaded
      })
      .catch((err) => console.error('Failed to load audio', err))
  }

  play({ playbackRate = 0 }: PlaySoundParams = {}) {
    try {
      this.player.playbackRate = playbackRate
      this.player.start()
    } catch (err) {
      console.warn('Failed to play sound', err)
    }
  }
}

export function useSounds<T extends {[s: string]: string}>(definition: T) {
  React.useEffect(() => {

  }, [definition])

  const sounds = React.useMemo(
    () =>
      Object
        .entries(definition)
        .map(([id, url]) => {
          const sound = new GambaSound(url)
          return { id, sound }
        })
        .reduce((prev, { id, sound }) => ({
          ...prev,
          [id]: sound,
        }), {} as Record<keyof T, GambaSound>)
    ,
    [definition],
  )

  return sounds
}
