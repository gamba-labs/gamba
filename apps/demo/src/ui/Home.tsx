import React from 'react'
import { Button } from '../components/Button'
import { Section } from '../components/Section'
import { Icon } from '../components/Icon'
import styles from './Home.module.css'

const Carousel: React.FC<{children: (JSX.Element[]) | JSX.Element}> = ({ children: _children }) => {
  const [messageIndex, setMessageIndex] = React.useState(0)

  const children = React.Children.toArray(_children)

  React.useEffect(
    () => {
      const timeout = setInterval(() => {
        setMessageIndex((x) => (x + 1) % children.length)
      }, 2500)

      return () => clearTimeout(timeout)
    },
    [children],
  )

  return (
    <div key={messageIndex} className={styles.test}>
      <div className={styles.side}>
        {children[messageIndex]}
      </div>

      <div className={styles.yes}>
        {children.map((_, i) => (
          <button key={i} onClick={() => setMessageIndex(i)} />
        ))}
      </div>
    </div>
  )
}
export function Home() {
  return (
    <div className={styles.banner}>
      <Section>
        <Carousel>
          <>
            <h2>
              A decentralized, provably-fair casino built on <Button size="small" variant="soft" as="a" href="https://gamba.so" target="_blank">Gamba</Button>.
            </h2>
            <p style={{ wordWrap: 'break-word' }}>
            Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba Gamba !!!!!!!!!!
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
                variant="ghost"
                href="https://discord.gg/TkGr9bAZ"
                target="_blank"
                icon={<Icon.ExternalLink />}
              >
                Discord
              </Button>
              <Button
                as="a"
                color="white"
                variant="ghost"
                href="https://twitter.com/GambaLabs"
                target="_blank"
                icon={<Icon.ExternalLink />}
              >
                Twitter
              </Button>
            </div>
          </>
          {/* <>
            <h2>
              Nope
            </h2>
            <p>
              I dont know
            </p>
          </> */}
        </Carousel>
      </Section>
    </div>
  )
}
