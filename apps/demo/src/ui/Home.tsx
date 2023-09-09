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
          A decentralized, provably-fair casino built on <Button size="small" variant="soft" as="a" href="https://gamba.so" target="_blank">Gamba</Button>.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            as="a"
            color="white"
            href="https://github.com/gamba-labs"
            target="_blank"
            icon={<Icon.ExternalLink />}
          >
            Github
          </Button>
          <Button
            as="a"
            color="white"
            href="https://discord.gg/TkGr9bAZ"
            target="_blank"
            icon={<Icon.ExternalLink />}
          >
            Discord
          </Button>
          <Button
            as="a"
            color="white"
            href="https://twitter.com/GambaLabs"
            target="_blank"
            icon={<Icon.ExternalLink />}
          >
            Twitter
          </Button>
        </div>
      </Section>
    </div>
  )
}
