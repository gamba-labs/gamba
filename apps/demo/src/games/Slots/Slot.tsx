import React, { useMemo } from 'react'
import { REVEAL_SLOT_DELAY, SLOT_ITEMS, SlotItem } from './constants'
import styles from './App.module.css'

interface SlotProps {
  spinning:boolean
  good: boolean
  index: number
  item?: SlotItem
}

export function Slot({ spinning, good, index, item }: SlotProps) {
  // Add the first item to the end so the animation loops seamlessly
  const items = useMemo(() =>
    [...SLOT_ITEMS].sort(() => Math.random() - .5)
  , [],
  )

  const delay = good ? 250 : REVEAL_SLOT_DELAY

  return (
    <div
      className={styles.slot}
      data-index={index}
    >
      <div
        className={styles.spinner}
        data-spinning={spinning}
        style={{ animationDelay: (index * delay / 1000) + 's' }}
      >
        {items.map((item, i) => (
          <div key={i}>
            <img className={styles.slotImage} src={item.image} />
          </div>
        ))}
      </div>
      {item && (
        <>
          <div
            className={styles.revealedSlot}
            data-revealed={!spinning}
            data-good={good}
            data-index={index}
            style={{ animationDelay: (index * delay / 1000) + 's' }}
          >
            <img className={styles.slotImage} src={item.image} />
          </div>
        </>
      )}
    </div>
  )
}
