import React from 'react'
import image from './logo.png'

export default {
  name: 'Roulette',
  short_name: 'roulette',
  description: '',
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  image,
  theme_color: '#00da69',
  app: React.lazy(() => import('./App')),
}
