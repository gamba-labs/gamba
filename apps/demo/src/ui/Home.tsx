import React from 'react'
import { Button2 } from '../components/Button/Button'
import { Section } from '../components/Section'
import { Icon } from '../components/Icon'
import styles from './Home.module.css'

export function Home() {
  return (
    <div className={styles.banner}>
      <Section>
        <h1>
          Gamba Demo
        </h1>
        <p>
          A decentralized, provably-fair casino built on gamba.
        </p>
        <Button2
          as="a"
          color="white"
          href="https://gamba.so"
          target="_blank"
          icon={<Icon.ExternalLink />}
        >
          Learn More
        </Button2>
      </Section>
    </div>
  )
}
