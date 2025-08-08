// src/musicManager.ts
import { useSoundStore } from 'gamba-react-ui-v2'

type Unsub = () => void

export const musicManager = {
  sound:  null as any,   // Tone.Player+Gain wrapper
  count:  0,
  timer:  0 as any,
  sub:    null as Unsub | null,
  muted:  false,
}

// initialize mute state from localStorage
try {
  const saved = localStorage.getItem('plinkorace_music_muted')
  if (saved != null) musicManager.muted = saved === '1'
} catch {}

export function attachMusic(snd: any) {
  // store the player
  musicManager.sound = snd

  // apply initial volume
  const vol = useSoundStore.getState().volume
  snd.gain.set({ gain: musicManager.muted ? 0 : vol })

  // subscribe once to future volume changes
  if (!musicManager.sub) {
    musicManager.sub = useSoundStore.subscribe(state => {
      if (musicManager.sound) {
        musicManager.sound.gain.set({ gain: musicManager.muted ? 0 : state.volume })
      }
    })
  }
}

export function stopAndDispose() {
  try { musicManager.sound?.player.stop() } catch {}
  musicManager.sound = null

  // unsubscribe from the store
  musicManager.sub?.()
  musicManager.sub = null
}

export function setMuted(muted: boolean) {
  musicManager.muted = muted
  try { localStorage.setItem('plinkorace_music_muted', muted ? '1' : '0') } catch {}
  const vol = useSoundStore.getState().volume
  try { musicManager.sound?.gain.set({ gain: muted ? 0 : vol }) } catch {}
}

export function toggleMuted() {
  setMuted(!musicManager.muted)
}
