import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { SLOT_ITEMS, SlotItem } from '../constants'
import { SlotImage } from '../styles'

export const StyledItemPreview = styled.div`
  display: flex;
  gap: 5px;
  & > div {
    position: relative;
    width: 40px;
    aspect-ratio: 1/1.5;
    border-radius: 5px;
    border: 1px solid #2d2d57;
    &.hidden {
      opacity: .5;
    }
    & > .icon {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity .5s ease;
      &.visible {
        opacity: 1;
      }
    }
    & > .multiplier {
      position: absolute;
      right: 0;
      top: 0;
      transform: translate(50%, -50%);
      color: black;
      background: #ffec63;
      z-index: 10;
      font-size: 10px;
      padding: 0 2px;
      border-radius: 2px;
      z-index: 1;
    }
  }
`

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
      <StyledItemPreview>
        {itemsByMultiplier.map(({ items, multiplier }, i) => (
          <div className={!betArray.includes(multiplier) ? 'hidden' : ''} key={i}>
            <div className="multiplier">{multiplier}x</div>
            {items.map((item, i) => (
              <div key={i} className={'icon ' + ((rotation % items.length === i) ? 'visible' : '')}>
                <SlotImage src={item.image} />
              </div>
            ))}
          </div>
        ))}
      </StyledItemPreview>
    </div>
  )
}
