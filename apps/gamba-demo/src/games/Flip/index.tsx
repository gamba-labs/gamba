import React from 'react'
import { FaCoins } from 'react-icons/fa'

export default {
  name: 'Flip',
  shortName: 'flip',
  description: '',
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  app: React.lazy(() => import('./App')),
  icon: () => <FaCoins />,
}
