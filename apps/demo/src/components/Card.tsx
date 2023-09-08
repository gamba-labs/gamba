import React from 'react'
import styles from './Card.module.css'
import { NavLink } from 'react-router-dom'

interface Props {
  backgroundImage?: string
  backgroundColor?: string
  to: string
  logo?: string
}

export function Card({ to, logo, backgroundColor }: Props) {
  return (
    <NavLink
      to={to}
      className={styles.card}
      style={{ backgroundColor }}
    >
      <div className={styles.background} />
      {logo && (
        <div
          className={styles.logo}
          style={{ backgroundImage: 'url(' + logo + ')' }}
        />
      )}
    </NavLink>
  )
}
