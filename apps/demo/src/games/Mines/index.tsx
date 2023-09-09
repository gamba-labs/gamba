import React from 'react'
import image from './logo.png'

export default {
  name: 'Mines',
  short_name: 'mines',
  description: `
    Click the squares to collect money. Your reward will increase the longer your play, but watch out for the hidden mines. Touch one and you'll go broke. You can cash out at any time.
  `,
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  theme_color: '#784eff',
  image,
  app: React.lazy(() => import('./App')),
}
