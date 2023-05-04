import { lamportsToSol } from 'gamba-core'
import { useGamba, useGambaError, useGambaEvent } from 'gamba-react'
import { useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { create } from 'zustand'
import { formatLamports } from './utils'

type StatusType = 'error' | 'warning' | 'notification'

interface Alert {
  type: StatusType
  title: string
  id: number
}

interface AlertsState {
  alerts: Alert[]
  addAlert: (input: Omit<Alert, 'id'>) => void
  removeAlert: (id: number) => void
}

const statusToColor = (status: StatusType) => {
  if (status === 'error') {
    return '#ff0000'
  }
  if (status === 'notification') {
    return '#00ff33'
  }
  if (status === 'warning') {
    return '#ffff00'
  }
}

const useAlerts = create<AlertsState>((set) => ({
  alerts: [],
  addAlert: (input) => {
    const alert = { ...input, id: Date.now() }
    set(({ alerts }) => ({ alerts: [alert, ...alerts] }))
  },
  removeAlert: (id: number) => {
    set(({ alerts }) =>
      ({ alerts: alerts.filter((a) => a.id !== id) }),
    )
  },
}))

interface AlertProps {
  alert: Alert
  onRemove: () => void
}

function Alert({ alert, onRemove }: AlertProps) {
  const timeout = useRef<any>()
  const stopTimer = () => {
    clearTimeout(timeout.current)
  }
  const startTimer = () => {
    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => {
      onRemove()
    }, 10000)
  }

  useEffect(() => {
    startTimer()
    return () => {
      stopTimer()
    }
  }, [])

  return (
    <StyledAlert onMouseEnter={stopTimer} onMouseLeave={startTimer} onClick={onRemove}>
      <div>{alert.title}</div>
      <StatusIndicator $status={alert.type} />
    </StyledAlert>
  )
}

const appear = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0%);
  }
`

const Wrapper = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  padding: 20px;
  padding-top: 80px;
  flex-direction: column;
  gap: 20px;
  z-index: 10;
  pointer-events: none;
  align-items: end;
`

const StatusIndicator = styled.div<{$status: StatusType}>`
  background: ${({ $status }) => statusToColor($status)};
  width: 1em;
  height: 1em;
  border-radius: 50%;
`

const StyledAlert = styled.div`
  padding: 10px;
  pointer-events: auto;
  width: 300px;
  border-radius: var(--border-radius);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  background: #ffffff;
  color: #333333;
  animation: ${appear} .2s ease;
`

export function Alerts() {
  const gamba = useGamba()
  const alerts = useAlerts((state) => state.alerts)
  const addAlert = useAlerts((state) => state.addAlert)
  const removeAlert = useAlerts((state) => state.removeAlert)

  useGambaEvent((event) => {
    if (gamba.wallet?.publicKey?.equals(event.player)) {
      const profit = event.resultMultiplier * event.wager - event.wager
      const wonLost = profit >= 0 ? ' won ' : ' lost '
      addAlert({ title: 'You' + wonLost + formatLamports(Math.abs(profit)), type: 'notification' })
    }
  }, [gamba.user])

  useGambaError((err) => {
    addAlert({ title: err, type: 'error' })
  })

  return (
    <Wrapper>
      {alerts.map((alert, i) => (
        <Alert
          key={alert.id}
          alert={alert}
          onRemove={() => removeAlert(alert.id)}
        />
      ))}
    </Wrapper>
  )
}
