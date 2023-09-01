import React from 'react'
import image from './logo.png'

export default {
  name: 'Mines',
  short_name: 'mines',
  description: '',
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  theme_color: '#784eff',
  image,
  app: React.lazy(() => import('./App')),
}
