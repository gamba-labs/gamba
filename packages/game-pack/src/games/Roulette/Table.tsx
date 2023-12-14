import React from 'react'
import { Chip } from './Chip'
import { ChipContainer, StyledBetButton, StyledTable } from './Table.styles'
import { tableLayout } from './constants'
import { addChips, getChips, hover, hovered, removeChips, selectedChip } from './signals'

export function Table() {
  return (
    <StyledTable>
      {Object.entries(tableLayout)
        .map(([id, square]) => {
          const amount = getChips(id)
          return (
            <StyledBetButton
              key={id}
              onClick={(evt) => {
                evt.preventDefault()
                if (evt.button !== 2)
                  addChips(id, selectedChip.value)
                else
                  removeChips(id)
              }}
              onContextMenu={() => removeChips(id)}
              style={{
                gridRow: square.row,
                gridColumn: square.column,
              }}
              $highlighted={hovered.value.includes(Number(id))}
              $color={square.color}
              onMouseOver={() => hover(square.numbers)}
              onMouseLeave={() => hover([])}
            >
              {square.label}
              {amount > 0 && (
                <ChipContainer key={amount}>
                  <Chip value={amount} />
                </ChipContainer>
              )}
            </StyledBetButton>
          )
        })}
    </StyledTable>
  )
}
