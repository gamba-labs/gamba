import { ExternalLinkIcon, MixIcon, ResetIcon } from '@radix-ui/react-icons'
import { Badge, Box, Button, Card, Code, Container, Flex, Grid, Heading, IconButton, Link, ScrollArea, Table, Tabs, Text, TextField } from '@radix-ui/themes'
import { useConnection } from '@solana/wallet-adapter-react'
import { ParsedTransactionWithMeta } from '@solana/web3.js'
import clsx from 'clsx'
import { GameResult, parseGambaTransaction } from 'gamba'
import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { Money } from './Money'
import { getCreatorMeta } from './data'
import styles from './test.module.css'
import { isSignature } from './utils'

const VerificationSection: React.FC<{parsed: GameResult}> = ({ parsed }) => {
  const [clientSeed, setClientSeed] = React.useState(parsed.clientSeed)

  const verifyArgs = [
    parsed.rngSeed,
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
    clientSeed,
    nonce,
    wager,
    bet,
  ) => {
    const hash = await hmac256(rngSeed, [clientSeed, nonce].join('-'))
    const resultIndex = parseInt(hash.substring(0, 5), 16) % bet.length
    const multiplier = bet[resultIndex]
    const payout = wager * multiplier
    return 'Payout: '+ payout / 1e9 + ' SOL'
  })(${verifyArgs})
  `

  return (
    <Box>
      <Text size="2">
        This bet is provably fair.
        The result is calculated by combining the <Code>rng_seed</Code> provided by Gamba and the <Code>client_seed</Code> provided by the player, and <Code>nonce</Code>, which increments by 1 after each play.
        <br />
        The sha256 hash for the next RNG Seed is revealed in this transaction as well just like the one prior, <Code>rng_seed_hashed</Code>.<br />
        You can simulate the bet here with a custom client seed, to see how it would affect the result:
      </Text>

      <Flex gap="2" my="4">
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

      <Text size="2">
        Here is the code to generate the result:
      </Text>

      <Box my="4">
        <Code size="1">
          {script}
        </Code>
      </Box>
    </Box>
  )
}

export function TransactionView() {
  const { connection } = useConnection()
  const { txid } = useParams<{txid: string}>()
  const [transaction, setTransaction] = React.useState<ParsedTransactionWithMeta>()

  React.useEffect(
    () => {
      isSignature(txid!) && connection.getParsedTransaction(txid!)
        .then((transaction) => {
          if (transaction) {
            setTransaction(transaction)
          }
        })
    }, [txid],
  )

  const logs = transaction?.meta?.logMessages ?? []
  const parsed = React.useMemo(() => {
    if (transaction) {
      return parseGambaTransaction(transaction)
    }
  }, [transaction])

  if (!parsed?.event.gameResult) return null

  const { gameResult } = parsed.event

  const moreThanOne = gameResult.bet.filter((x) => x >= 1)
  const sum = gameResult.bet.reduce((p, x) => p + x, 0)
  const winChange = moreThanOne.length / gameResult.bet.length
  const potentialWin = Math.max(...gameResult.bet)
  const oddsScore = sum / gameResult.bet.length
  const uniqueOutcomes = Array.from(new Set(gameResult.bet)).sort()

  return (
    <Container>
      <Box my="4">
        <Heading mb="3">
          Transaction
        </Heading>

        <Flex gap="2">
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
                {parseFloat((winChange * 100).toFixed(3))}%
              </Text>
            </Grid>
          </Card>
          <Card size="2">
            <Grid>
              <Text color="gray" size="1">
                Max Win
              </Text>
              <Text size="6" weight="bold">
                {parseFloat(potentialWin.toFixed(3))}x
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
                    Platform
                  </Text>
                  <Link asChild>
                    <NavLink to={'/address/' + gameResult.creator.toBase58()}>
                      <img src={getCreatorMeta(gameResult.creator).image} height="20px" width="20px" style={{ marginRight: '.5em', verticalAlign: 'middle' }} />
                      {getCreatorMeta(gameResult.creator).name} ({gameResult.creator.toBase58()})
                    </NavLink>
                  </Link>
                </Grid>
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell>
                <Grid columns="2" gap="4">
                  <Text weight="bold">
                    Player
                  </Text>
                  <Link asChild>
                    <NavLink to={'/address/' + gameResult.player.toBase58()}>
                      {gameResult.player.toBase58()}
                    </NavLink>
                  </Link>
                </Grid>
              </Table.Cell>
            </Table.Row>
            {/*
            <Table.Row>
              <Table.Cell>
                <Grid columns="2" gap="4">
                  <Text weight="bold">
                    Previous
                  </Text>
                  <Text>
                    Coming Soon
                  </Text>
                </Grid>
              </Table.Cell>
            </Table.Row> */}

            <Table.Row>
              <Table.Cell>
                <Grid columns="2" gap="4">
                  <Text weight="bold">
                    Time
                  </Text>
                  <Text>
                    {new Date(parsed.time).toLocaleString()}
                  </Text>
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
                    <Money lamports={gameResult.wager} />
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
                  <Flex>
                    <Text mr="2">
                      <Money lamports={gameResult.payout} />
                    </Text>
                    <Badge color={gameResult.profit >= 0 ? 'green' : 'red'}>
                      {parseFloat((gameResult.multiplier * 100 - 100).toFixed(3))}%
                    </Badge>
                  </Flex>
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
                    {gameResult.bet.map((x, i) => {
                      const rank = Math.floor(uniqueOutcomes.indexOf(x) / (uniqueOutcomes.length - 1) * 7)
                      const active = i === gameResult.resultIndex
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
            <VerificationSection parsed={gameResult} />
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
