import React from 'react'
import { RouletteSvg } from '../../Svg'

export default {
  name: 'Roulette',
  shortName: 'roulette',
  description: '',
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  app: React.lazy(() => import('./App')),
  icon: () => <RouletteSvg />,
}
