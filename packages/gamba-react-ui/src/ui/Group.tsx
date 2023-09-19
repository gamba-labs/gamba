import React from 'react'
import { cx } from '../utils'

interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Group(props: GroupProps) {
  const {
    children,
    className,
    ...rest
  } = props

  return (
    <div
      {...rest}
      className={cx('gamba-game-ui-group', className)}
    >
      {children}
    </div>
  )
}
