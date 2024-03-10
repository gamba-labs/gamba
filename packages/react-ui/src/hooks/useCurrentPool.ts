import { UiPoolState, usePool } from 'gamba-react-v2'
import { useContext } from 'react'
import { GambaPlatformContext } from '../GambaPlatformProvider'
import { useFakeToken } from './useFakeToken'

export const useCurrentPool = (): UiPoolState => {
  const { selectedPool } = useContext(GambaPlatformContext)
  const pool = usePool(selectedPool.token, selectedPool.authority)
  const fake = useFakeToken()
  if (fake.isActive) {
    return fake.pool
  }
  return pool
}
