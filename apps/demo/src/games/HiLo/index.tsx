import React from 'react'
import App from './App'
import image from './logo.png'

const game = {
  name: 'HiLo',
  short_name: 'hilo',
  description: 'Guess if the next card is going to be higher or lower than the current one. Continue until you want to cash out!',
  image,
  theme_color: '#a38eff',
  app: () => <App />,
}

export default game
