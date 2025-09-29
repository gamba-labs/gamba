// src/games/PvpFlip/components/GameScreen.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useGame, useMultiplayer, useGambaPlay, useGambaProvider } from 'gamba-react-v2'
import { GambaUi, Multiplayer } from 'gamba-react-ui-v2'
import { BPS_PER_WHOLE } from 'gamba-core-v2'
import {
  PLATFORM_CREATOR_ADDRESS,
  MULTIPLAYER_FEE,
  PLATFORM_REFERRAL_FEE,
} from '../../../constants'
import { Coin } from '../three/Coin'
import { Effect } from '../three/Effect'
import HEADS_IMG from '../assets/heads.png'
import TAILS_IMG from '../assets/tails.png'
import SOUND_COIN from '../assets/coin.mp3'
import SOUND_WIN from '../assets/win.mp3'
import SOUND_LOSE from '../assets/lose.mp3'
import { useSound } from 'gamba-react-ui-v2'

export default function GameScreen({
  pk,
  onBack,
}: {
  pk: PublicKey
  onBack: () => void
}) {
  const { game: chainGame, metadata } = useGame(pk, { fetchMetadata: true })
  const { publicKey } = useWallet()
  const { join } = useMultiplayer()
  const play = useGambaPlay()
  const { anchorProvider } = useGambaProvider()
  const uiGame = GambaUi.useGame()
  const sounds = useSound({ coin: SOUND_COIN, win: SOUND_WIN, lose: SOUND_LOSE })
  const [timeLeft, setTimeLeft] = useState(0)
  const [busy, setBusy] = useState(false)
  const [chosenSide, setChosenSide] = useState<'heads' | 'tails'>()
  const [flipping, setFlipping] = useState(false)
  const [resultIndex, setResultIndex] = useState(0) // 0=heads, 1=tails
  const [revealed, setRevealed] = useState(false)
  const [botMode, setBotMode] = useState(false)
  const [botMakerSide, setBotMakerSide] = useState<'heads' | 'tails'>('heads')
  const [botOppSide, setBotOppSide] = useState<'heads' | 'tails'>('tails')
  const [botWager, setBotWager] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!chainGame?.softExpirationTimestamp) return
    const end = Number(chainGame.softExpirationTimestamp) * 1000
    const tick = () => setTimeLeft(Math.max(end - Date.now(), 0))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [chainGame?.softExpirationTimestamp])

  const formatTime = (ms: number) => {
    const tot = Math.ceil(ms / 1000)
    const m = Math.floor(tot / 60)
    const s = tot % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const waiting = !!chainGame?.state.waiting
  const isWaitingUi = botMode ? false : waiting

  // Normalize metadata to map pubkey -> 'heads' | 'tails' | undefined
  const sidesByPlayer = useMemo(() => {
    const out = new Map<string, 'heads' | 'tails' | undefined>()
    const md = metadata ?? {}
    chainGame?.players.forEach((p, idx) => {
      const key = p.user.toBase58()
      const raw = (md[key] ?? '').toLowerCase().trim()
      const side = raw === 'heads' || raw === 'head' ? 'heads' : raw === 'tails' || raw === 'tail' ? 'tails' : undefined
      // fallback deterministic assignment for UI-only if missing metadata
      out.set(key, side ?? (idx === 0 ? 'heads' : 'tails'))
    })
    return out
  }, [chainGame, metadata])

  const takenSides = useMemo(() => {
    const set = new Set<'heads' | 'tails'>()
    chainGame?.players.forEach((p, idx) => {
      const key = p.user.toBase58()
      const meta = (metadata ?? {})[key]
      const raw = (meta ?? '').toLowerCase().trim()
      const side = raw === 'heads' || raw === 'head' ? 'heads' : raw === 'tails' || raw === 'tail' ? 'tails' : undefined
      if (side) set.add(side)
    })
    return set
  }, [chainGame, metadata])

  const iAmInGame = !!publicKey && !!chainGame?.players.some(p => p.user.equals(publicKey))
  const canPickHeads = !takenSides.has('heads')
  const canPickTails = !takenSides.has('tails')

  const sol = (lamports: number) => lamports / 1_000_000_000
  const short = (pk: PublicKey) => pk.toBase58().slice(0, 4) + '…'

  const betLabel = useMemo(() => {
    if (botMode && botWager != null) return `${sol(botWager).toFixed(2)} SOL`
    if (!chainGame) return ''
    const a: any = chainGame
    if ('sameWager' in a.wagerType) {
      return `${sol(chainGame.wager.toNumber()).toFixed(2)} SOL`
    } else if ('customWager' in a.wagerType) {
      return 'Custom'
    }
    const min = sol(a.minBet?.toNumber?.() ?? chainGame.wager.toNumber())
    const max = sol(a.maxBet?.toNumber?.() ?? chainGame.wager.toNumber())
    return `${min.toFixed(2)} – ${max.toFixed(2)} SOL`
  }, [chainGame])

  const sideAssignments = useMemo(() => {
    const out: {
      heads?: { pk?: PublicKey; label: string; specified: boolean }
      tails?: { pk?: PublicKey; label: string; specified: boolean }
    } = {}
    if (!chainGame) return out
    chainGame.players.forEach((p, idx) => {
      const key = p.user.toBase58()
      const raw = (metadata?.[key] ?? '').toLowerCase().trim()
      const specified = raw.length > 0
      const side = raw === 'heads' || raw === 'head' ? 'heads' : raw === 'tails' || raw === 'tail' ? 'tails' : (idx === 0 ? 'heads' : 'tails')
      out[side] = { pk: p.user, label: short(p.user), specified }
    })
    return out
  }, [chainGame, metadata])

  const uiAssignments = useMemo(() => {
    if (botMode) {
      return {
        [botMakerSide]: { label: 'You', specified: true } as any,
        [botOppSide]:   { label: 'BOT', specified: true } as any,
      }
    }
    return sideAssignments
  }, [botMode, botMakerSide, botOppSide, sideAssignments])

  useEffect(() => {
    // Auto-select the only available side if one is taken
    if (!chosenSide) {
      if (canPickHeads && !canPickTails) setChosenSide('heads')
      if (!canPickHeads && canPickTails) setChosenSide('tails')
    }
  }, [canPickHeads, canPickTails, chosenSide])

  const handleJoin = async () => {
    if (!chainGame || !publicKey || !chosenSide) return
    setBusy(true)
    try {
      sounds.play('coin', { playbackRate: .5 })
      const isFixed = 'sameWager' in (chainGame as any).wagerType
      const lamports = isFixed
        ? chainGame.wager.toNumber()
        : ((chainGame as any).minBet?.toNumber?.() ?? chainGame.wager.toNumber())

      await join({
        gameAccount: pk,
        mint: chainGame.mint,
        wager: lamports,
        creatorAddress: PLATFORM_CREATOR_ADDRESS,
        creatorFeeBps: Math.round(MULTIPLAYER_FEE * BPS_PER_WHOLE),
        metadata: chosenSide,
      })
      sounds.play('coin')
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  // When result is available, spin for ~2s then reveal landing side
  useEffect(() => {
    const settled = !!chainGame && !chainGame.state.waiting && (chainGame.winnerIndexes?.length ?? 0) > 0
    if (!settled || revealed) return

    // compute winning side from winner index and player metadata (with fallback)
    const w = Number(chainGame!.winnerIndexes[0] ?? 0)
    const player = chainGame!.players[w]
    if (!player) return
    const winSide = sidesByPlayer.get(player.user.toBase58()) === 'tails' ? 'tails' : 'heads'
    const idx = winSide === 'tails' ? 1 : 0

    setFlipping(true)
    try { sounds.play('coin', { playbackRate: .5 }) } catch {}
    const t = setTimeout(() => {
      setResultIndex(idx)
      setFlipping(false)
      setRevealed(true)
      // basic win/lose feedback (optional)
      // Note: multiplayer payout not immediately known; here we just use side result
      try {
        if (idx === 1) sounds.play('win'); else sounds.play('lose')
      } catch {}
    }, 2000)
    return () => clearTimeout(t)
  }, [chainGame, revealed, sidesByPlayer])

  const winningSide = useMemo<('heads' | 'tails') | undefined>(() => {
    if (!chainGame || chainGame.state.waiting) return undefined
    const w = Number(chainGame.winnerIndexes?.[0] ?? 0)
    const player = chainGame.players[w]
    if (!player) return undefined
    return sidesByPlayer.get(player.user.toBase58()) === 'tails' ? 'tails' : 'heads'
  }, [chainGame, sidesByPlayer])

  const winningSideUi = useMemo<('heads' | 'tails') | undefined>(() => {
    if (botMode && revealed) return resultIndex === 1 ? 'tails' : 'heads'
    return winningSide
  }, [botMode, revealed, resultIndex, winningSide])

  const canCallBot = useMemo(() => {
    if (!chainGame || !publicKey) return false
    if (!chainGame.state?.waiting) return false
    const myIdx = chainGame.players.findIndex(p => p.user.equals(publicKey))
    return myIdx !== -1 && chainGame.players.length === 1
  }, [chainGame, publicKey])

  const handleCallBot = async () => {
    if (!chainGame || !publicKey) return
    try {
      setBusy(true)
      // Determine maker side
      const makerSide = sidesByPlayer.get(publicKey.toBase58()) ?? 'heads'
      const oppSide = makerSide === 'heads' ? 'tails' : 'heads'
      setBotMakerSide(makerSide)
      setBotOppSide(oppSide)
      // Determine wager (prefer player's actual wager)
      const me = chainGame.players.find(p => p.user.equals(publicKey)) as any
      const lamports = me?.wager?.toNumber?.() ?? chainGame.wager.toNumber()
      setBotWager(lamports)

      // Build leave-game instruction
      const { leaveGameIx } = await import('@gamba-labs/multiplayer-sdk')
      const leaveIx = await leaveGameIx(anchorProvider as any, {
        accounts: {
          gameAccount: pk,
          mint: chainGame.mint,
          playerAccount: publicKey,
        },
      } as any)

      // Send leave + singleplayer play in one TX
      const bet = makerSide === 'heads' ? [2, 0] : [0, 2]
      await play(
        {
          bet,
          wager: lamports,
          metadata: [makerSide],
          token: chainGame.mint,
          creator: PLATFORM_CREATOR_ADDRESS.toString(),
        } as any,
        [leaveIx],
      )

      // Simulate bot opponent and coin spin using singleplayer result
      setBotMode(true)
      setFlipping(true)
      try { sounds.play('coin', { playbackRate: .5 }) } catch {}
      const res = await uiGame.result()
      // 0=heads, 1=tails mapping
      const idx = res.resultIndex % 2
      // spin for ~2s then land
      setTimeout(() => {
        setResultIndex(idx)
        setFlipping(false)
        setRevealed(true)
        try {
          if (idx === 1) sounds.play('win'); else sounds.play('lose')
        } catch {}
      }, 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {/* Flip 3D scene */}
      <GambaUi.Portal target="screen">
        <Canvas
          linear
          flat
          orthographic
          camera={{ zoom: 80, position: [0, 0, 100] }}
        >
          <React.Suspense fallback={null}>
            <Coin result={resultIndex} flipping={botMode ? flipping : (flipping || waiting)} />
          </React.Suspense>
          {flipping && <Effect color="white" />}
          {revealed && <Effect color="#42ff78" />}
          <ambientLight intensity={3} />
          <directionalLight position-z={1} position-y={1} castShadow color="#CCCCCC" />
          <hemisphereLight intensity={.5} position={[0, 1, 0]} scale={[1, 1, 1]} color="#ffadad" groundColor="#6666fe" />
        </Canvas>
      </GambaUi.Portal>

      {/* centered info rail: bespoke, minimal, production tone */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 18, color: '#ddd', fontSize: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28,
          background: 'linear-gradient(180deg, rgba(20,20,30,.75), rgba(12,12,20,.65))',
          padding: '14px 18px', borderRadius: 16, border: '1px solid rgba(255,255,255,.06)',
          boxShadow: '0 10px 35px rgba(0,0,0,0.35)'
        }}>
          {/* Left: Heads card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            opacity: uiAssignments.heads ? 1 : .6,
            borderRadius: 12, padding: '8px 10px',
            background: 'linear-gradient(180deg, rgba(66,255,120,.06), rgba(66,255,120,.02))',
            boxShadow: revealed && winningSideUi === 'heads' ? '0 0 18px rgba(66,255,120,.25)' : 'none',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 20, overflow: 'hidden',
              border: '1px solid rgba(66,255,120,.35)', background: 'rgba(0,0,0,.25)', display: 'grid', placeItems: 'center'
            }}>
              <img src={HEADS_IMG} height={20} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#fff', fontWeight: 700, letterSpacing: .2 }}>Heads</span>
              <span style={{ opacity: .9 }}>• {uiAssignments.heads?.label ?? '—'}</span>
              {uiAssignments.heads && !uiAssignments.heads.specified && (
                <span style={{ opacity: .6, fontStyle: 'italic' }}>random</span>
              )}
            </div>
          </div>

          {/* Center: VS + Bet */}
          <div style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 30,
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,.2), rgba(255,255,255,.06))',
              border: '1px solid rgba(255,255,255,.1)', display: 'grid', placeItems: 'center', color: '#fff',
              fontWeight: 800, letterSpacing: .5
            }}>VS</div>
            <div style={{
              padding: '4px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,.08)',
              background: 'rgba(255,255,255,.03)', color: '#fff', fontSize: 12
            }}>{betLabel}</div>
          </div>

          {/* Right: Tails card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            opacity: uiAssignments.tails ? 1 : .6,
            borderRadius: 12, padding: '8px 10px',
            background: 'linear-gradient(180deg, rgba(98,134,255,.06), rgba(98,134,255,.02))',
            boxShadow: revealed && winningSideUi === 'tails' ? '0 0 18px rgba(66,255,120,.25)' : 'none',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 20, overflow: 'hidden',
              border: '1px solid rgba(98,134,255,.35)', background: 'rgba(0,0,0,.25)', display: 'grid', placeItems: 'center'
            }}>
              <img src={TAILS_IMG} height={20} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#fff', fontWeight: 700, letterSpacing: .2 }}>Tails</span>
              <span style={{ opacity: .9 }}>• {uiAssignments.tails?.label ?? '—'}</span>
              {uiAssignments.tails && !uiAssignments.tails.specified && (
                <span style={{ opacity: .6, fontStyle: 'italic' }}>random</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top-right status + countdown */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 200, textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 10px', borderRadius: 8, fontSize: 12, textTransform: 'uppercase', border: '1px solid #333' }}>
          <span style={{ width: 8, height: 8, borderRadius: 10, background: isWaitingUi ? '#ffc107' : '#42ff78' }} />
          {isWaitingUi ? 'Waiting for players' : (revealed ? 'Settled' : 'Spinning…')}
        </div>
        {isWaitingUi && timeLeft > 0 && (
          <div style={{ marginTop: 6, color: '#fff', fontSize: 12, opacity: .9 }}>Starts in {formatTime(timeLeft)}</div>
        )}
      </div>

      {/* Controls bar */}
      <GambaUi.Portal target="controls">
        <button
          onClick={onBack}
          style={{ padding: '8px 16px', marginRight: 12, fontWeight: 600, background: '#222', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          ← Lobby
        </button>

        {chainGame && !botMode ? (
          publicKey && !iAmInGame ? (
            <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <div style={{ display: 'inline-flex', gap: 6 }}>
                <button
                  disabled={!canPickHeads || busy}
                  onClick={() => setChosenSide('heads')}
                  style={{ padding: '8px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', background: chosenSide === 'heads' ? '#fff' : '#333', color: chosenSide === 'heads' ? '#111' : '#fff' }}
                >Heads</button>
                <button
                  disabled={!canPickTails || busy}
                  onClick={() => setChosenSide('tails')}
                  style={{ padding: '8px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', background: chosenSide === 'tails' ? '#fff' : '#333', color: chosenSide === 'tails' ? '#111' : '#fff' }}
                >Tails</button>
              </div>
              <button
                disabled={!chosenSide || busy}
                onClick={handleJoin}
                style={{ padding: '8px 16px', fontWeight: 600, background: '#fff', color: '#111', border: 'none', borderRadius: 6, cursor: 'pointer' }}
              >{busy ? 'Joining…' : 'Join'}</button>
            </div>
            ) : (
            canCallBot ? (
              <button
                onClick={handleCallBot}
                disabled={busy}
                style={{ padding: '8px 16px', fontWeight: 700, background: '#fff', color: '#111', border: 'none', borderRadius: 6, cursor: 'pointer' }}
              >{busy ? 'Calling…' : 'Call a Bot'}</button>
            ) : null
          )
        ) : null}
      </GambaUi.Portal>
    </>
  )
}


