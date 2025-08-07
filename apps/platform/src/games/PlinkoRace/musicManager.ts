// src/musicManager.ts
import { useSoundStore } from 'gamba-react-ui-v2'

type Unsub = () => void

export const musicManager = {
  sound:  null as any,   // Tone.Player+Gain wrapper
  count:  0,
  timer:  0 as any,
  sub:    null as Unsub | null,
}

export function attachMusic(snd: any) {
  // store the player
  musicManager.sound = snd

  // apply initial volume
  snd.gain.set({ gain: useSoundStore.getState().volume })

  // subscribe once to future volume changes
  if (!musicManager.sub) {
    musicManager.sub = useSoundStore.subscribe(state => {
      if (musicManager.sound) {
        musicManager.sound.gain.set({ gain: state.volume })
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
