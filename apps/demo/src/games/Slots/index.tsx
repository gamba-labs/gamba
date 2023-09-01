import React from 'react'

export default {
  name: 'Slots',
  short_name: 'slots',
  description: '',
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  image: new URL('./logo.png', import.meta.url).href,
  theme_color: '#ad6bff',
  app: React.lazy(() => import('./App')),
}
