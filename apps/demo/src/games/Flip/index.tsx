import React from 'react'
import image from './image.png'

export default {
  name: 'Flip',
  short_name: 'flip',
  description: '',
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  image,
  app: React.lazy(() => import('./App')),
}
