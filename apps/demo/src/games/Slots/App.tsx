import { useGamba } from 'gamba/react'
import {
  ActionBar,
  Button,
  ResponsiveSize,
  formatLamports,
} from 'gamba/react-ui'
import React, { useMemo, useState } from 'react'
import * as Tone from 'tone'
import { Dropdown } from '../../components/Dropdown'
import { ItemPreview } from './components/ItemPreview'
import { Slot } from './components/Slot'
import { FINAL_DELAY, INITIAL_WAGER, LEGENDARY_THRESHOLD, NUM_SLOTS, REVEAL_SLOT_DELAY, SLOT_ITEMS, SPIN_DELAY, SlotItem, WAGER_OPTIONS } from './constants'
import { Perspective, Result, SlotContainer } from './styles'
import { generateBetArray, getSlotCombination } from './utils'

import loseSrc from './lose.mp3'
import selectSrc from './selected.mp3'
import spinStartSrc from './spinstart.mp3'
import unicornSelectSrc from './unicornselect.mp3'
import winSrc from './win.mp3'

const createSound = (url: string) => new Tone.Player({ url }).toDestination()

const soundWin = createSound(winSrc)
const soundLose = createSound(loseSrc)
const soundSelect = createSound(selectSrc)
const soundSpinStart = createSound(spinStartSrc)
const soundSelectLegendary = createSound(unicornSelectSrc)

export default function Slots() {
  const gamba = useGamba()
  const [result, setResult] = useState(0)
  const [wager, setWager] = useState(INITIAL_WAGER)
  const [good, setGood] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [slots, setSlots] = useState<{spinning: boolean, item?: SlotItem}[]>(
    Array.from({ length: NUM_SLOTS }).map(() => ({ spinning: false, item: SLOT_ITEMS[0] })),
  )
  const maxPayout = gamba.house?.maxPayout ?? 0
  const bet = useMemo(
    () => generateBetArray(maxPayout, wager),
    [maxPayout, wager, gamba.user?.nonce],
  )

  const updateSlot = (index: number, value: typeof slots[0]) => {
    setSlots(
      (slots) =>
        slots.map((x, i) => i === index ? value : x),
    )
  }

  const revealSlot = (combination: SlotItem[], slot = 0) => {
    updateSlot(slot, { spinning: false, item: combination[slot] })

    soundSelect.start()

    const allSame = combination.slice(0, slot + 1).every((item, index, arr) => !index || item === arr[index - 1])

    if (combination[slot].multiplier >= LEGENDARY_THRESHOLD) {
      if (allSame) {
        soundSelectLegendary.start()
      }
    }

    if (slot === slots.length - 1) {
      setTimeout(() => {
        if (allSame) {
          setGood(true)
          soundWin.start()
        } else {
          soundLose.start()
        }
      }, FINAL_DELAY)
    }

    if (slot < slots.length - 1) {
      setTimeout(() => revealSlot(combination, slot + 1), REVEAL_SLOT_DELAY)
    }
  }

  const play = async () => {
    try {
      setSpinning(true)

      const res = await gamba.play({
        wager,
        bet,
      })

      setGood(false)

      const startTime = Date.now()

      setSlots(slots.map((cell) => ({ ...cell, spinning: true })))

      soundSpinStart.start()
      soundSpinStart.playbackRate = 1.2

      const result = await gamba.awaitResult()

      // gamba.suspense(result.profit, SPIN_DELAY + REVEAL_SLOT_DELAY * NUM_SLOTS)

      const multiplier = result.options[result.resultIndex] / 1000
      // Make sure we wait a minimum time of SPIN_DELAY before slots are revealed:
      const resultDelay = Date.now() - startTime
      const revealDelay = Math.max(0, SPIN_DELAY - resultDelay)

      const combination = getSlotCombination(slots.length, multiplier, bet)

      setResult(result.payout)

      setTimeout(() => revealSlot(combination), revealDelay)
    } catch (err) {
      console.error(err)
      setSlots(slots.map((cell) => ({ ...cell, spinning: false })))
    } finally {
      setSpinning(false)
    }
  }

  return (
    <>
      <ResponsiveSize maxScale={1.25}>
        <Perspective>
          <div>
            <ItemPreview betArray={bet} />
            <SlotContainer>
              {slots.map((slot, i) => (
                <Slot
                  key={i}
                  index={i}
                  spinning={slot.spinning}
                  item={slot.item}
                  good={good}
                />
              ))}
            </SlotContainer>
            <Result>
              {good ? (
                <>
                  Payout: {formatLamports(result)}
                </>
              ) : (
                <>
                  FEELING LUCKY?
                </>
              )}
            </Result>
          </div>
        </Perspective>
      </ResponsiveSize>
      <ActionBar>
        <Dropdown
          value={wager}
          format={formatLamports}
          label="Wager"
          onChange={setWager}
          options={WAGER_OPTIONS.map((value) => ({
            label: formatLamports(value),
            value,
          }))}
        />
        <Button loading={spinning} onClick={play}>
          Spin
        </Button>
      </ActionBar>
    </>
  )
}
