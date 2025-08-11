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

export const useSoundStore = create<SoundStore>((set, get) => ({
  volume: 0.5,
  masterGain: 0.5,
  set: (volume) => set({ volume, masterGain: volume }),
  get,
}))

class Sound {
  player = new Player()
  gain = new Gain()
  ready = false
  private url?: string

  constructor(url: string, autoPlay = false) {
    this.url = url
    this.player.load(url)
      .then(x => {
        this.ready = x.loaded
        this.player.connect(this.gain)
        this.gain.toDestination()
        if (autoPlay) {
          this.player.loop = true
          this.player.start()
        }
      })
      .catch(err => console.error('Failed to load audio', err))
  }

  play({ playbackRate = 1, gain = 0.1 }: PlaySoundParams = {}) {
    try {
      this.player.playbackRate = playbackRate
      this.gain.set({ gain })
      this.player.start()
    } catch (err) {
      console.warn('Failed to play sound', this.url, err)
    }
  }
}

/**
 * definition:  { id: url, ... }
 * options.disposeOnUnmount: default true (old behavior). 
 *                            set to false to keep sounds alive after unmount.
 */
export function useSound<T extends Record<string,string>>(
  definition: T,
  options?: { disposeOnUnmount?: boolean }
) {
  const store = useSoundStore()
  const keys = Object.keys(definition)

  const soundById = useMemo(() => {
    return keys.reduce((acc, id) => {
      acc[id as keyof T] = new Sound(definition[id])  
      return acc
    }, {} as Record<keyof T, Sound>)
  }, [ ...keys ])

  const sounds = useMemo(() => Object.values(soundById), [soundById])

  // cleanup effect: only run if disposeOnUnmount !== false
  useEffect(() => {
    if (options?.disposeOnUnmount === false) return
    return () => {
      sounds.forEach(s => {
        try { s.player.stop() } catch {}
        try { s.player.dispose() } catch {}
      })
    }
  }, [soundById, options?.disposeOnUnmount])

  // update gain on volume change
  useEffect(() => {
    sounds.forEach(s => s.gain.set({ gain: store.get().volume }))
  }, [store.volume, sounds])

  const play = useCallback((id: keyof T, params?: PlaySoundParams) => {
    const base = params?.gain ?? 1
    const gain = base * store.get().volume
    soundById[id].play({ ...params, gain })
  }, [soundById])

  return { play, sounds: soundById }
}
