import React, { useEffect, useState } from 'react'
import { SLOT_ITEMS, SlotItem } from './constants'
import styles from './styles.module.css'

const itemsByMultiplier = Object.entries(
  SLOT_ITEMS.reduce<Record<string, SlotItem[]>>(
    (prev, item) => {
      const previousItems = prev[item.multiplier] ?? []
      return {
        ...prev,
        [item.multiplier]: [...previousItems, item],
      }
    }
    , {},
  ),
)
  .map(([multiplier, items]) => ({ multiplier: Number(multiplier), items }))
  .sort((a, b) => a.multiplier - b.multiplier)


export function ItemPreview({ betArray }: {betArray: number[]}) {
  const [rotation, setRotation] = useState(0)

  // Rotate slot images
  // Todo: can probably do with CSS animations
  useEffect(() => {
    const interval = setInterval(() => setRotation((ci) => ci + 1), 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div className={styles.items}>
        {itemsByMultiplier.map(({ items, multiplier }, i) => (
          <div className={!betArray.includes(multiplier) ? 'hidden' : ''} key={i}>
            <div className={styles.multiplier}>{multiplier}x</div>
            {items.map((item, i) => (
              <div key={i} className={styles.icon + ' ' + ((rotation % items.length === i) ? styles.visible : '')}>
                <img className={styles.slotImage} src={item.image} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
