import { useGamba } from 'gamba/react'
import {
  ResponsiveSize,
  formatLamports,
  useGameControls,
  useSounds,
} from 'gamba/react-ui'
import React, { useMemo, useState } from 'react'
import { ItemPreview } from './components/ItemPreview'
import { Slot } from './components/Slot'
import { FINAL_DELAY, INITIAL_WAGER, LEGENDARY_THRESHOLD, NUM_SLOTS, REVEAL_SLOT_DELAY, SLOT_ITEMS, SPIN_DELAY, SlotItem } from './constants'
import { Perspective, Result, SlotContainer } from './styles'
import { generateBetArray, getSlotCombination } from './utils'

import loseSrc from './lose.mp3'
import selectSrc from './selected.mp3'
import spinStartSrc from './spinstart.mp3'
import unicornSelectSrc from './unicornselect.mp3'
import winSrc from './win.mp3'

export default function Slots() {
  const gamba = useGamba()
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(0)
  const [wager, setWager] = useState(INITIAL_WAGER)
  const [good, setGood] = useState(false)
  const [slots, setSlots] = useState<{spinning: boolean, item?: SlotItem}[]>(
    Array.from({ length: NUM_SLOTS }).map(() => ({ spinning: false, item: SLOT_ITEMS[0] })),
  )
  const maxPayout = gamba.house?.maxPayout ?? 0
  const bet = useMemo(
    () => generateBetArray(maxPayout, wager),
    [maxPayout, wager, gamba.user?.nonce],
  )

  const sounds = useSounds({
    win: winSrc,
    lose: loseSrc,
    select: selectSrc,
    spinStart: spinStartSrc,
    selectLegendary: unicornSelectSrc,
  })

  useGameControls({
    wager: { type: 'wager', value: wager, onChange: setWager },
    play: {
      type: 'button',
      disabled: spinning,
      onClick: () => play(),
    },
  })

  const updateSlot = (index: number, value: typeof slots[0]) => {
    setSlots(
      (slots) =>
        slots.map((x, i) => i === index ? value : x),
    )
  }

  const revealSlot = (combination: SlotItem[], slot = 0) => {
    updateSlot(slot, { spinning: false, item: combination[slot] })

    sounds.select.play()

    const allSame = combination.slice(0, slot + 1).every((item, index, arr) => !index || item === arr[index - 1])

    if (combination[slot].multiplier >= LEGENDARY_THRESHOLD) {
      if (allSame) {
        sounds.selectLegendary.play()
      }
    }

    if (slot === slots.length - 1) {
      setTimeout(() => {
        setSpinning(false)
        if (allSame) {
          setGood(true)
          sounds.win.play()
        } else {
          sounds.lose.play()
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

      await gamba.play({
        wager,
        bet,
      })

      setGood(false)

      const startTime = Date.now()

      setSlots(slots.map((cell) => ({ ...cell, spinning: true })))

      sounds.spinStart.play({ playbackRate: 1.2 })

      const result = await gamba.awaitResult()

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
      setSpinning(false)
    }
  }

  return (
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
  )
}
