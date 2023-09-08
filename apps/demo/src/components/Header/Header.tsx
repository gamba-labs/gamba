import React from 'react'
import { NavLink } from 'react-router-dom'
import styles from './Header.module.css'

export const Header2: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className={styles.wrapper}>
      <div>
        <div>
          <NavLink className={styles.logo} to="/">
            <img src="/logo.svg" height="20px" />
            Gamba Demo
          </NavLink>
        </div>
        {/* <a target="_blank" href="https://github.com/gamba-labs/gamba" rel="noreferrer">
          Github
        </a>
        <a target="_blank" href="https://discord.gg/xjBsW3e8fK" rel="noreferrer">
          Discord
        </a>
        <a target="_blank" href="https://twitter.com/GambaLabs" rel="noreferrer">
          Twitter
        </a> */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
