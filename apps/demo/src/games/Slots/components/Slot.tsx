import React, { useMemo } from 'react'
import { SLOT_ITEMS, SlotItem } from '../constants'
import { SlotImage, StyledSlot } from '../styles'

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
  , [])

  return (
    <StyledSlot
      $numberOfItems={items.length}
      $index={index}
      good={good}
      spinning={spinning}
    >
      <div className="background" />
      <div className="spinner">
        {items.map((item, i) => (
          <div key={i}>
            <SlotImage src={item.image} />
          </div>
        ))}
      </div>
      {item && (
        <>
          <div className="result">
            <SlotImage src={item.image} />
          </div>
          <div className="blur">
            <SlotImage src={item.image} />
          </div>
        </>
      )}
    </StyledSlot>
  )
}
