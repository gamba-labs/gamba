import { useCallback, useEffect, useMemo } from 'react'
import { Player, Gain } from 'tone'
import { StoreApi, create } from 'zustand'

interface PlaySoundParams {
  playbackRate?: number
  gain?: number
}

export interface SoundStore {
  volume: number
  set: (gain: number) => void
  get: StoreApi<SoundStore>['getState']
  /** @deprecated Use "volume" */
  masterGain: number
}

export const useSoundStore = create<SoundStore>(
  (set, get) => ({
    volume: .5,
    masterGain: .5,
    set: (volume) => set({ volume, masterGain: volume }),
    get,
  }),
)

/** @deprecated use "useSoundStore" */
export const useGambaAudioStore = useSoundStore

class Sound {
  player = new Player
  gain = new Gain
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
  const store = useSoundStore()
  const sources = Object.keys(definition)
  const soundById = useMemo(
    () =>
      Object
        .entries(definition)
        .map(([id, url]) => {
          const sound = new Sound(url)
          return { id, sound }
        })
        .reduce((prev, { id, sound }) => ({
          ...prev,
          [id]: sound,
        }), {} as Record<keyof T, Sound>)
    ,
    [...sources],
  )
  const sounds = useMemo(() => Object.entries(soundById).map(([_, s]) => s), [soundById])

  // Mute all sounds on unmount
  useEffect(
    () => {
      return () => {
        sounds.forEach((sound) => {
          sound.player.stop()
          sound.player.dispose()
        })
      }
    },
    [soundById],
  )

  // Update the gain of played sounds
  useEffect(
    () => {
      sounds.forEach((sound) => {
        sound.gain.set({ gain: store.volume })
      })
    },
    [store.volume],
  )

  const play = useCallback(
    (soundId: keyof T, params?: PlaySoundParams) => {
      const gain = params?.gain ?? 1
      const opts: PlaySoundParams = { ...params, gain: gain * store.get().volume }
      soundById[soundId].play(opts)
    },
    [soundById],
  )

  return {
    play,
    sounds: soundById,
  }
}
