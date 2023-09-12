import React from 'react'
import { useControlsStore } from '../useControlsStore'
import { cx } from '../utils'

type ButtonHTMLAttributesProps = React.ButtonHTMLAttributes<HTMLButtonElement>

interface ButtonProps extends React.PropsWithChildren {
  variant?: 'default' | 'primary'
  selected?: boolean
  disabled?: boolean
  onClick?: ButtonHTMLAttributesProps['onClick']
  className?: ButtonHTMLAttributesProps['className']
}

export default function Button(props: ButtonProps) {
  const globalDisabled = useControlsStore((state) => state.disabled)
  const {
    selected,
    disabled,
    children,
    className,
    variant = 'default',
    ...rest
  } = props

  return (
    <button
      {...rest}
      disabled={globalDisabled || disabled}
      className={cx(
        'gamba-game-button',
        selected && 'selected',
        variant,
        className,
      )}
    >
      {children}
    </button>
  )
}
