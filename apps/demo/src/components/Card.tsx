import { GameBundle } from 'gamba/react-ui'
import React from 'react'
import { NavButton } from './Button'
import styles from './Card.module.css'

interface Props {
  game: GameBundle
}

export function Card({ game }: Props) {
  // const [modal, setModal] = React.useState<GameBundle>()
  return (
    <>
      {/* {modal && (
        <Modal onClose={() => setModal(undefined)}>
          <h1>{game.name}</h1>
          <NavButton color="white" to={'/' + game.short_name}>
            Play Game
          </NavButton>
        </Modal>
      )} */}
      <NavButton
        // onClick={() => setModal(game)}
        to={'/' + game.short_name}
        className={styles.card}
        style={{ backgroundColor: game.theme_color }}
      >
        <div className={styles.background} />
        {game.image && (
          <div
            className={styles.logo}
            style={{ backgroundImage: 'url(' + game.image + ')' }}
          />
        )}
      </NavButton>
    </>
  )
}
