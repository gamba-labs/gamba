import { UiPoolState, usePool } from 'gamba-react-v2'
import { useContext } from 'react'
import { GambaPlatformContext } from '../GambaPlatformProvider'
import { useFakeToken } from './useFakeToken'

export const useCurrentPool = (): UiPoolState => {
  const { selectedPool } = useContext(GambaPlatformContext)
  const fake = useFakeToken()
  const pool = usePool(selectedPool.token, selectedPool.authority)
  if (fake.isActive) {
    return fake.pool
  }
  return pool
}
