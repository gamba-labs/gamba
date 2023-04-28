import { ButtonHTMLAttributes } from 'react'
import { Loader, StyledButton } from '../styles'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  icon?: string
}

export function Button({ children, icon, loading, disabled, ...props }: Props) {
  return (
    <StyledButton disabled={disabled || loading} {...props}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {icon && <img width="20" height="20" src={icon} />}
        {children}
      </span>
      {loading && <span><Loader /></span>}
    </StyledButton>
  )
}
