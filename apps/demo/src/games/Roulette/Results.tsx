import React from 'react'
import styles from './Results.module.css'
import { useRoulette } from './useRoulette'
import { SQUARES } from './constants'

export function Results({ loading }: {loading?: boolean}) {
  const results = useRoulette((state) => state.results)
  const [firstResult] = results
  const firstResultColor = !loading && firstResult + 1 && SQUARES[firstResult].color

  return (
    <div className={styles.wrapper}>
      <div className={styles.result} data-color={firstResultColor}>
        {loading ? '..' : typeof firstResult === 'number' ? firstResult + 1 : '-'}
      </div>
      {results.slice(loading ? 0 : 1, loading ? 9 : 10).map((index, i) => {
        return (
          <div
            key={i}
            className={styles.result}
            data-color={SQUARES[index].color}
          >
            {index + 1}
          </div>
        )
      })}
    </div>
  )
}
