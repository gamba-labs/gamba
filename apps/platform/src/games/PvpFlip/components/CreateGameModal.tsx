// src/games/PvpFlip/components/CreateGameModal.tsx
import React, { useState } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useMultiplayer, useGambaProvider } from 'gamba-react-v2'
import { NATIVE_MINT } from '@solana/spl-token'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { GambaUi } from 'gamba-react-ui-v2'
import { BN } from '@coral-xyz/anchor'
import { createGameIx, deriveGamePdaFromSeed } from '@gamba-labs/multiplayer-sdk'
import { BPS_PER_WHOLE } from 'gamba-core-v2'
import { PLATFORM_CREATOR_ADDRESS, MULTIPLAYER_FEE } from '../../../constants'

const Backdrop = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const Modal = styled(motion.div)`
  background: #1c1c1c;
  padding: 24px;
  border-radius: 8px;
  width: 92%;
  max-width: 420px;
  color: #fff;
  border: 1px solid #333;
  box-shadow: 0 12px 36px rgba(0,0,0,0.5);
`

const Title = styled.h2`
  margin: 0 0 16px;
  font-size: 1.4rem;
  font-weight: 700;
`

const Field = styled.div`
  margin-bottom: 16px;
`

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  margin-bottom: 6px;
  color: #a9a9b8;
`

const Input = styled.input`
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #333;
  border-radius: 6px;
  background: #222;
  color: #fff;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  &:focus { outline: none; border-color: #555; }
`

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
`

const Button = styled.button<{ variant?: 'primary' }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease;
  background: ${({ variant }) => (variant === 'primary' ? '#fff' : '#333')};
  color: ${({ variant }) => (variant === 'primary' ? '#111' : '#fff')};
  &:hover:not(:disabled) { background: ${({ variant }) => (variant === 'primary' ? '#eee' : '#444')}; }
  &:disabled { opacity: .5; cursor: not-allowed; }
`

const ErrorMessage = styled.p`
  color: #e74c3c;
  margin: 10px 0 0;
  text-align: center;
  font-size: 0.9rem;
`

const ToggleGroup = styled.div`
  display: flex;
  gap: 8px;
`

const ToggleButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px;
  border: 1px solid ${({ active }) => (active ? '#fff' : '#333')};
  border-radius: 6px;
  background: ${({ active }) => (active ? '#fff' : '#222')};
  color: ${({ active }) => (active ? '#111' : '#fff')};
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
  &:hover:not(:disabled) {
    background: ${({ active }) => (active ? '#eee' : '#333')};
  }
`

const PresetGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`

const PresetButton = styled.button`
  padding: 6px 10px;
  border: 1px solid #333;
  border-radius: 6px;
  background: #222;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover { background: #333; }
`

export default function CreateGameModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean
  onClose: () => void
  onCreated?: (pk: PublicKey) => void
}) {
  const { publicKey } = useWallet()
  const { join } = useMultiplayer()
  const { anchorProvider } = useGambaProvider()

  const [wagerSol, setWagerSol] = useState<number>(0.1) // maker's wager
  const [wagerType, setWagerType] = useState<'sameWager' | 'betRange' | 'customWager'>('sameWager')
  const [minBetSol, setMinBetSol] = useState<number>(0.1)
  const [maxBetSol, setMaxBetSol] = useState<number>(5)
  const [side, setSide] = useState<'heads' | 'tails'>('heads')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!publicKey) return setError('Connect wallet first')
    setSubmitting(true)
    setError(null)

    const lam = Math.floor(wagerSol * LAMPORTS_PER_SOL)
    const minLam = Math.floor(minBetSol * LAMPORTS_PER_SOL)
    const maxLam = Math.floor(maxBetSol * LAMPORTS_PER_SOL)

    // Create+Join in one TX: derive game PDA from our own seed
    const rand = crypto.getRandomValues(new Uint8Array(8))
    const gameSeed = new BN(rand, 'le')
    const gamePda = deriveGamePdaFromSeed(gameSeed)

    const params = {
      preAllocPlayers: 2,
      maxPlayers: 2,
      numTeams: 0,
      winnersTarget: 1,
      wagerType: ['sameWager','customWager','betRange'].indexOf(wagerType),
      payoutType: 0,
      wager: wagerType === 'betRange' ? minLam : (wagerType === 'sameWager' ? lam : 0),
      softDuration: 60,
      hardDuration: 240,
      gameSeed,
      minBet: wagerType === 'betRange' ? minLam : (wagerType === 'sameWager' ? lam : 0),
      maxBet: wagerType === 'betRange' ? maxLam : (wagerType === 'sameWager' ? lam : 0),
      accounts: {
        gameMaker: publicKey,
        mint: NATIVE_MINT,
      },
    } as const

    try {
      const createIx = await createGameIx(anchorProvider as any, params)
      // Decide initial maker wager for join
      const joinLam = (() => {
        if (wagerType === 'sameWager') return lam
        if (wagerType === 'betRange') {
          return Math.max(minLam, Math.min(maxLam, lam))
        }
        return lam // custom: any amount
      })()
      await join(
        {
          gameAccount: gamePda,
          mint: NATIVE_MINT,
          wager: joinLam,
          creatorAddress: PLATFORM_CREATOR_ADDRESS,
          creatorFeeBps: Math.round(MULTIPLAYER_FEE * BPS_PER_WHOLE),
          metadata: side,
        },
        [createIx],
      )
      onCreated?.(gamePda)
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to create game')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <GambaUi.Portal target="screen">
      <AnimatePresence>
        {isOpen && (
          <Backdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Modal initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
              <Title>Create 1v1 Flip</Title>

              <Field>
                <Label>Wager (SOL)</Label>
                <Input type="number" lang="en-US" inputMode="decimal" min={0.01} step={0.01} value={wagerSol} onChange={(e) => setWagerSol(Number(e.target.value))} />
                <PresetGroup>
                  {[0.1, 0.5, 1, 2].map(v => (
                    <PresetButton key={v} onClick={() => setWagerSol(v)}>{v} SOL</PresetButton>
                  ))}
                </PresetGroup>
              </Field>

              <Field>
                <Label>Wager Type</Label>
                <ToggleGroup>
                  <ToggleButton active={wagerType === 'sameWager'} onClick={() => setWagerType('sameWager')}>Fixed</ToggleButton>
                  <ToggleButton active={wagerType === 'betRange'} onClick={() => setWagerType('betRange')}>Range</ToggleButton>
                  <ToggleButton active={wagerType === 'customWager'} onClick={() => setWagerType('customWager')}>Unlimited</ToggleButton>
                </ToggleGroup>
              </Field>

              {wagerType === 'betRange' && (
                <Field>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <Label>Min Bet (SOL)</Label>
                      <Input type="number" min={0.01} step={0.01} value={minBetSol} onChange={(e) => setMinBetSol(Number(e.target.value))} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Label>Max Bet (SOL)</Label>
                      <Input type="number" min={minBetSol} step={0.01} value={maxBetSol} onChange={(e) => setMaxBetSol(Number(e.target.value))} />
                    </div>
                  </div>
                  <PresetGroup>
                    <PresetButton onClick={() => { setMinBetSol(0.1); setMaxBetSol(1) }}>0.1 – 1</PresetButton>
                    <PresetButton onClick={() => { setMinBetSol(0.5); setMaxBetSol(5) }}>0.5 – 5</PresetButton>
                  </PresetGroup>
                </Field>
              )}

              {wagerType !== 'sameWager' && (
                <p style={{ margin: '8px 0 0', color: '#bbb', fontSize: 12, lineHeight: 1.3 }}>
                  ⚠️ Without a fixed amount, larger bets gain a proportionally higher chance to win.
                </p>
              )}

              <Field>
                <Label>Choose Side</Label>
                <ToggleGroup>
                  <ToggleButton active={side === 'heads'} onClick={() => setSide('heads')}>
                    Heads
                  </ToggleButton>
                  <ToggleButton active={side === 'tails'} onClick={() => setSide('tails')}>
                    Tails
                  </ToggleButton>
                </ToggleGroup>
              </Field>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <ButtonRow>
                <Button onClick={onClose} disabled={submitting}>Cancel</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Creating…' : 'Create'}
                </Button>
              </ButtonRow>
            </Modal>
          </Backdrop>
        )}
      </AnimatePresence>
    </GambaUi.Portal>
  )
}


