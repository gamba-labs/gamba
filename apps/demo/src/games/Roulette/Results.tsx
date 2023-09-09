import React from 'react'
import styles from './Results.module.css'
import { useRoulette } from './useRoulette'

export function Results({ loading }: {loading?: boolean}) {
  const results = useRoulette((state) => state.results)
  const [firstResult] = results

  return (
    <div className={styles.wrapper}>
      <div className={styles.result}>
        {loading ? '..' : typeof firstResult === 'number' ? firstResult + 1 : '-'}
      </div>
      {results.slice(loading ? 0 : 1, loading ? 10 : 11).map((x, i) => {
        return (
          <div key={i} className={styles.result}>
            {x + 1}
          </div>
        )
      })}
    </div>
  )
}
