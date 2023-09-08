import React from 'react'
import { useOnClickOutside } from '../hooks/useOnClickOutside'
import { Icon } from './Icon'
import styles from './Modal.module.css'

export function Modal({ children, onClose }: React.PropsWithChildren<{onClose: () => void}>) {
  const ref = React.useRef<HTMLDivElement>(null!)

  useOnClickOutside(ref, onClose)

  return (
    <div className={styles.container}>
      <div className={styles.modal} ref={ref}>
        <button className={styles.close} onClick={onClose}>
          <Icon.Close2 />
        </button>
        {children}
      </div>
    </div>
  )
}
