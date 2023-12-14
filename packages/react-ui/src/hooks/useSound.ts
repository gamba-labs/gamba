import { signal } from '@preact/signals-react'
import React from 'react'
import * as Tone from 'tone'

const materGain = signal(.5)

interface PlaySoundParams {
  playbackRate?: number
  gain?: number
}

export interface GambaAudioStore {
  masterGain: number
  set: (gain: number) => void
}

export const useGambaAudioStore = () => {
  return {
    masterGain: materGain.value,
    set: (gain: number) => {
      materGain.value = gain
    }
  }
}

class GambaSound {
  player = new Tone.Player
  gain = new Tone.Gain
  ready = false
  private url?: string

  constructor(url: string, autoPlay = false) {
    this.url = url
    this.player.load(url)
      .then((x) => {
        this.ready = x.loaded
        this.player.connect(this.gain)
        this.gain.toDestination()
        if (autoPlay) {
          this.player.loop = true
          this.player.start()
        }
      })
      .catch((err) => console.error('Failed to load audio', err))
  }

  play({ playbackRate = 1, gain = .1 }: PlaySoundParams = {}) {
    try {
      this.player.playbackRate = playbackRate
      this.gain.set({ gain })
      this.player.start()
    } catch (err) {
      console.warn('Failed to play sound', this.url, err)
    }
  }
}

export function useSound<T extends {[s: string]: string}>(definition: T) {
  const sources = Object.keys(definition)

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
    [...sources],
  )

  React.useEffect(
    () => {
      return () => {
        Object.entries(sounds).map(([_, s]) => s.player.stop())
      }
    },
    [sounds]
  )

  const play = React.useCallback(
    (s: keyof typeof sounds, x?: PlaySoundParams) => {
      const gain = x?.gain ?? 1
      const opts: PlaySoundParams = {...x, gain: gain * materGain.value}
      sounds[s].play(opts)
    },
    [sounds]
  )

  return {
    play,
    sounds,
  }
}
