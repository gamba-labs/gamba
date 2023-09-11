import { ExternalLinkIcon, MixIcon, ResetIcon } from '@radix-ui/react-icons'
import { Badge, Box, Button, Card, Code, Container, Flex, Grid, Heading, IconButton, Link, ScrollArea, Table, Tabs, Text, TextField } from '@radix-ui/themes'
import { useConnection } from '@solana/wallet-adapter-react'
import clsx from 'clsx'
import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import styles from './test.module.css'

interface Parsed {
  bet: number[]
  wager: number
  resultIndex: number
  rngSeed: string
  rngSeedHashed: string
  nonce: number
  clientSeed: string
}

const VerificationSection: React.FC<{parsed: Parsed}> = ({ parsed }) => {
  const [clientSeed, setClientSeed] = React.useState(parsed.clientSeed)

  const verifyArgs = [
    parsed.rngSeed,
    parsed.rngSeedHashed,
    clientSeed,
    parsed.nonce,
    parsed.wager,
    parsed.bet,
  ].map((x) => JSON.stringify(x))

  const script = `
  const hmac256 = async (secretKey, message, algorithm = 'SHA-256') => {
    const encoder = new TextEncoder()
    const messageUint8Array = encoder.encode(message)
    const keyUint8Array = encoder.encode(secretKey)
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyUint8Array,
      { name: 'HMAC', hash: algorithm },
      false,
      ['sign'],
    )
    const signature = await window.crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      messageUint8Array,
    )
    const hashArray = Array.from(new Uint8Array(signature))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  ;(async (
    rngSeed,
    rngSeedHashed,
    clientSeed,
    nonce,
    wager,
    bet,
  ) => {
    const hash = await hmac256(rngSeed, [clientSeed, nonce].join('-'))
    const resultIndex = parseInt(hash.substring(0, 5), 16) % bet.length
    const multiplier = bet[resultIndex]
    const payout = wager * multiplier / 1000
    return 'Payout: '+ payout / 1e9 + ' SOL'
  })(${verifyArgs})
  `

  return (
    <Box>
      <Text size="2">
        The result is calculated by combining the <Code>rng_seed</Code> provided by Gamba and the <Code>client_seed</Code> provided by the player, and <Code>nonce</Code>, which increments by 1 after each play.
        <br />
        The sha256 hash for the next RNG Seed is revealed in this transaction as well just like the one prior, <Code>rng_seed_hashed</Code>.
      </Text>

      <Box my="4">
        <Code size="1">
          {script}
        </Code>
      </Box>

      <Flex gap="2">
        <TextField.Root>
          <TextField.Input
            placeholder="Client Seed"
            value={clientSeed}
            onChange={(evt) => setClientSeed(evt.target.value)}
          />
          <TextField.Slot>
            <IconButton onClick={() => setClientSeed(Array.from({ length: 16 })
              .map(() => (Math.random() * 16 | 0).toString(16))
              .join(''))} size="1" variant="ghost">
              <MixIcon />
            </IconButton>
          </TextField.Slot>
          <TextField.Slot>
            <IconButton disabled={clientSeed === parsed.clientSeed} onClick={() => setClientSeed(parsed.clientSeed)} size="1" variant="ghost">
              <ResetIcon />
            </IconButton>
          </TextField.Slot>
        </TextField.Root>
        <Button onClick={(() => eval(script).then(alert))}>
          Simulate
        </Button>
      </Flex>

    </Box>
  )
}

export function TransactionView() {
  const { connection } = useConnection()
  const { txid } = useParams<{txid: string}>()
  const [logs, setLogs] = React.useState<string[]>([])
  const [valid, setValid] = React.useState(false)

  const [parsed, setParsed] = React.useState<Parsed>()

  React.useEffect(
    () => {
      connection.getParsedTransaction(txid!)
        .then((x) => {
          const _logs = x?.meta?.logMessages ?? []

          const extractValue = (key: string) => {
            const arr = _logs.find((x) => x.includes(key + ': '))?.split(key + ': ')
            return arr ? arr[1] : ''
          }
          if (_logs[0].startsWith('Program GambaXcmhJg1vgPm1Gn6mnMKGyyR3X2eSmF6yeU6XWtT')) {
            setValid(true)

            setParsed({
              bet: JSON.parse(extractValue('options')),
              wager: JSON.parse(extractValue('wager')),
              resultIndex: JSON.parse(extractValue('result_index')),
              rngSeed: extractValue('rng_seed'),
              rngSeedHashed: extractValue('rng_seed_hashed'),
              nonce: JSON.parse(extractValue('nonce')),
              clientSeed: extractValue('client_seed'),
            })
          }
          setLogs(_logs)
        })
    }, [txid],
  )

  if (!parsed) return null

  if (!valid) {
    return (
      <Container>
        <Heading mb="3" size="8">
          Not a Gamba Transaction
        </Heading>
        <Link target="_blank" href={`https://explorer.solana.com/tx/${txid}`} rel="noreferrer">
          View in Solana Explorer <ExternalLinkIcon />
        </Link>
      </Container>
    )
  }

  const bet = parsed.bet.map((x) => x / 1000)
  const moreThanOne = bet.filter((x) => x >= 1)
  const sum = bet.reduce((p, x) => p + x, 0)
  const winChange = moreThanOne.length / bet.length
  const potentialWin = Math.max(...bet)
  const oddsScore = sum / bet.length
  const uniqueOutcomes = Array.from(new Set(bet)).sort()
  const multiplier = parsed.bet[parsed.resultIndex] / 1e3
  const payout = parsed.wager * multiplier
  const profit = payout - parsed.wager

  return (
    <Container>
      <Box my="4">
        <Heading mb="3">
          Gamba Transaction
        </Heading>

        <Flex gap="2">
          {/* <Badge color="green">
            <CheckIcon />
            Verified Fair!
          </Badge> */}

          <Link target="_blank" href={`https://explorer.solana.com/tx/${txid}`} rel="noreferrer">
            View in Solana Explorer <ExternalLinkIcon />
          </Link>
        </Flex>
      </Box>

      <Box my="4">
        <Flex gap="4">
          <Card size="2">
            <Grid>
              <Text color="gray" size="1">
                Win Chance
              </Text>
              <Text size="6" weight="bold">
                {parseFloat((winChange * 100).toFixed(2))}%
              </Text>
            </Grid>
          </Card>
          <Card size="2">
            <Grid>
              <Text color="gray" size="1">
                Max Win
              </Text>
              <Text size="6" weight="bold">
                {parseFloat(potentialWin.toFixed(2))}x
              </Text>
            </Grid>
          </Card>
          <Card size="2">
            <Grid>
              <Text color="gray" size="1">
                House Edge
              </Text>
              <Text size="6" weight="bold">
                {parseFloat((100 - oddsScore * 100).toFixed(1))}%
              </Text>
            </Grid>
          </Card>
        </Flex>
      </Box>

      <Box my="4">
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>
                Details
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <Grid columns="2" gap="4">
                  <Text weight="bold">
                    Player
                  </Text>
                  <Link asChild>
                    <NavLink to={'/tx/' + txid}>
                      Coming Soon
                    </NavLink>
                  </Link>
                </Grid>
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell>
                <Grid columns="2" gap="4">
                  <Text weight="bold">
                    Creator
                  </Text>
                  <Link asChild>
                    <NavLink to={'/tx/' + txid}>
                      Coming Soon
                    </NavLink>
                  </Link>
                </Grid>
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell>
                <Grid columns="2" gap="4">
                  <Text weight="bold">
                    Wager
                  </Text>
                  <Text>
                    {parseFloat((parsed.wager / 1e9).toFixed(2))} SOL
                  </Text>
                </Grid>
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell>
                <Grid columns="2" gap="4">
                  <Text weight="bold">
                    Payout
                  </Text>
                  <Text>
                    {parseFloat((payout / 1e9).toFixed(3))} SOL <Badge color={profit >= 0 ? 'green' : 'red'}>{multiplier * 100 - 100}%</Badge>
                  </Text>
                </Grid>
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell>
                <Grid columns="2" gap="4">
                  <Text weight="bold">
                    Outcomes
                  </Text>
                  <Flex gap="1" wrap="wrap">
                    {bet.map((x, i) => {
                      const rank = Math.floor(uniqueOutcomes.indexOf(x) / (uniqueOutcomes.length - 1) * 7)
                      const active = i === parsed.resultIndex
                      return (
                        <Badge
                          key={i}
                          size="1"
                          color="gray"
                          className={clsx(styles.thing, active && styles.active)}
                          style={{ color: `var(--rank-color-${rank})` }}
                        >
                          <Text size="1">
                            {x}x
                          </Text>
                        </Badge>
                      )
                    })}
                  </Flex>
                </Grid>
              </Table.Cell>
            </Table.Row>

          </Table.Body>
        </Table.Root>
      </Box>

      <Tabs.Root defaultValue="verification">
        <Tabs.List size="2">
          <Tabs.Trigger value="verification">Verification</Tabs.Trigger>
          <Tabs.Trigger value="logs">Program Logs</Tabs.Trigger>
        </Tabs.List>

        <Box px="2" pt="2" pb="2">
          <Tabs.Content value="verification">
            <VerificationSection parsed={parsed} />
          </Tabs.Content>

          <Tabs.Content value="logs">
            <Box my="4">
              <ScrollArea type="always" scrollbars="vertical" style={{ maxHeight: 320 }}>
                <Flex direction="column" gap="1">
                  {logs.map((x, i) => (
                    <Code size="1" key={i}>{x}</Code>
                  ))}
                </Flex>
              </ScrollArea>
            </Box>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Container>
  )
}
