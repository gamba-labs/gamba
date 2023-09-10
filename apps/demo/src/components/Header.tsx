import React from 'react'
import { Button, NavButton } from './Button'
import styles from './Header.module.css'

export const Header: React.FC<React.PropsWithChildren> = ({ children }) => {
  const toggle = () => {
    console.log(document.body.classList)
    const prev = document.documentElement.getAttribute('data-theme')
    const theme = prev === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
  }
  return (
    <div className={styles.wrapper}>
      <div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <NavButton variant="ghost" className={styles.logo} to="/">
            <img src="/logo.svg" height="20px" />
            <span className={styles.title}>Gamba Demo</span>
          </NavButton>
          <Button onClick={toggle} variant="soft" color="white">
            LIGHT
          </Button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
