import styled from 'styled-components'
import { create } from 'zustand'

interface Alert {
  type: 'error' | 'warning'
  title: string
}

interface AlertsState {
  alerts: Alert[]
  addAlert: (alert: Alert) => void
}

const useAlerts = create<AlertsState>((set) => ({
  alerts: [],
  addAlert: (alert) => null,
}))

function Alert({ alert }: {alert: Alert}) {
  return (
    <StyledAlert>
      {alert.title}
    </StyledAlert>
  )
}

const Wrapper = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  pointer-events: none;
  align-items: end;
`

const StyledAlert = styled.div`
  padding: 10px;
  background: white;
  color: black;
  pointer-events: auto;
  width: 300px;
`

export function Alerts() {
  const alerts = useAlerts((state) => state.alerts)
  const addAlert = useAlerts((state) => state.addAlert)
  return (
    <Wrapper>
      {alerts.map((alert, i) => (
        <Alert key={i} alert={alert} />
      ))}
    </Wrapper>
  )
}
