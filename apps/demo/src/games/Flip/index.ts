import React from 'react'
import image from './logo.png'

export default {
  name: 'Flip',
  short_name: 'flip',
  description: `
    Pick Heads or Tails, then flip the coin for a chance to double your money.
  `,
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  image,
  theme_color: '#ffe875',
  app: React.lazy(() => import('./App')),
}
