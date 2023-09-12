import React from 'react'
// import { useControlsStore } from '../useControlsStore'
import { cx } from '../utils'

// type ButtonHTMLAttributesProps = React.ButtonHTMLAttributes<HTMLButtonElement>

interface GroupProps extends React.PropsWithChildren {
  align?: 'left' | 'right'
}

export default function Group(props: GroupProps) {
  // const globalDisabled = useControlsStore((state) => state.disabled)
  const {
    children,
    ...rest
  } = props

  return (
    <div
      {...rest}
      // disabled={globalDisabled || disabled}
      className={cx(
        'gamba-game-ui-group',
        // selected && 'selected',
        // className,
      )}
    >
      {children}
    </div>
  )
}
