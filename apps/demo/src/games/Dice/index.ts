import React from 'react'
import image from './logo.png'

export default {
  name: 'Dice',
  short_name: 'dice',
  description: `
    Roll below your specified number to win. Lower numbers increases your potential payout, while higher ones are safer.
  `,
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  image,
  theme_color: '#ff4e80',
  app: React.lazy(() => import('./App')),
}
