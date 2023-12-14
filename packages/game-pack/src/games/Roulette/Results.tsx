import React from 'react'
import { StyledResults } from './Results.styles'
import { results } from './signals'

export function Results() {
  return (
    <StyledResults>
      {results.value.map((index, i) => {
        return (
          <div key={i}>
            {index + 1}
          </div>
        )
      })}
    </StyledResults>
  )
}
