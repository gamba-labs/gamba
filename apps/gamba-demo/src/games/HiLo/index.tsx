import React from 'react'
import { FaHandPointUp } from 'react-icons/fa'

export default {
  name: 'HiLo',
  shortName: 'hilo',
  description: '',
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  app: React.lazy(() => import('./App')),
  icon: () => <FaHandPointUp />,
}
