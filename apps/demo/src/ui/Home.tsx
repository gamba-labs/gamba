import React from 'react'
import { Button } from '../components/Button'
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
        <Button
          as="a"
          color="white"
          href="https://gamba.so"
          target="_blank"
          icon={<Icon.ExternalLink />}
        >
          Learn More
        </Button>
      </Section>
    </div>
  )
}
