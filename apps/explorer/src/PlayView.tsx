import { CodeIcon, ExternalLinkIcon, MixIcon, ResetIcon } from '@radix-ui/react-icons'
import { Badge, Box, Button, Callout, Card, Code, Container, Dialog, Flex, Grid, IconButton, Link, Table, Tabs, Text, TextField } from '@radix-ui/themes'
import { useConnection } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'
import clsx from 'clsx'
import { GameResult, ParsedGambaTransaction, parseGambaTransaction } from 'gamba'
import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import useSWR from 'swr'
import { Money } from './Money'
import { PlatformAccountItem, PlayerAccountItem } from './components/AccountItem'
import { CodeBlock } from './components/CodeBlock'
import { Loader } from './components/Loader'
import styles from './test.module.css'
import { isSignature } from './utils'

const VerificationSection: React.FC<{parsed: GameResult, nextRngSeed: string}> = ({ parsed, nextRngSeed }) => {
  const [output, setOutput] = React.useState<string>()
  const [clientSeed, setClientSeed] = React.useState(parsed.clientSeed)

  const verifyArgs = [
    parsed.rngSeed,
    clientSeed,
    parsed.nonce,
    parsed.wager,
    parsed.bet,
  ].map((x) => JSON.stringify(x))

  const script = `
  const hmac256 = async (secretKey, message) => {
    const encoder = new TextEncoder();
    const messageUint8Array = encoder.encode(message);
    const keyUint8Array = encoder.encode(secretKey);
    const cryptoKey = await window.crypto.subtle.importKey('raw', keyUint8Array, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, messageUint8Array);
    return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
  };
  (async (rngSeed, clientSeed, nonce, wager, bet) => {
    const hash = await hmac256(rngSeed, [clientSeed, nonce].join('-'));
    const resultIndex = parseInt(hash.substring(0, 5), 16) % bet.length;
    const multiplier = bet[resultIndex];
    const payout = wager * multiplier;
    return payout / 1e9 + ' SOL';
  })(${verifyArgs});
  `

  React.useEffect(() => {
    eval(script).then(setOutput)
  }, [script])

  return (
    <Box>
      <Grid gap="4">
        <Text size="4" weight="bold">
          This game is provably fair.
        </Text>
        <Text size="2">
          The result is calculated by combining the <Code>rng_seed</Code> provided by Gamba, the <Code>client_seed</Code> provided by the player, and a <Code>nonce</Code>, which increments by 1 for each player after every play.
          <br />
          The sha256 hash for the next RNG Seed is revealed in this transaction just like the one prior.
          <br />
          You can simulate the bet here with a custom client seed, to see how it would affect the result.<br />

          <Dialog.Root>
            <Dialog.Trigger>
              <Link size="2">
                View code <CodeIcon />
              </Link>
            </Dialog.Trigger>
            <Dialog.Content style={{ maxWidth: 450 }}>
              <Dialog.Title>
                Javascript Code
              </Dialog.Title>
              <Dialog.Description size="2">
                Run this Javascript code locally in any browser console to get the same result:
              </Dialog.Description>
              <Box>
                <CodeBlock
                  dangerouslySetInnerHTML={{__html: `eval(\`${script}\`).then(console.log)`.replaceAll('\n', '<br />')}}
                />
              </Box>

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button onClick={() => navigator.clipboard.writeText(`eval(\`${script}\`).then(console.log)`)} variant="solid">
                  Copy script
                </Button>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>

        </Text>

        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>
                Simulation
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <Grid columns="2" gap="4">
                  <Text weight="bold">
                    Client Seed {clientSeed !== parsed.clientSeed && '(Edited)'}
                  </Text>
                  <TextField.Root>
                    <TextField.Input
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
                </Grid>
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell>
                <Grid columns="2" gap="4">
                  <Text weight="bold">
                    Nonce
                  </Text>
                  <Text color="gray">
                    {parsed.nonce}
                  </Text>
                </Grid>
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell>
                <Grid columns="2" gap="4">
                  <Text weight="bold">
                    RNG Seed
                  </Text>
                  <Text color="gray">
                    {parsed.rngSeed}
                  </Text>
                </Grid>
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell>
                <Grid columns="2" gap="4">
                  <Text weight="bold">
                    Next Hashed RNG Seed (SHA-256)
                  </Text>
                  <Text color="gray">
                    {nextRngSeed}
                  </Text>
                </Grid>
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell>
                <Grid columns="2" gap="4">
                  <Text weight="bold">
                    Simulated result
                  </Text>
                  <Flex gap="2">
                    {output && (
                      <Code>
                        {output}
                      </Code>
                    )}
                  </Flex>
                </Grid>
              </Table.Cell>
            </Table.Row>

          </Table.Body>
        </Table.Root>

      </Grid>
    </Box>
  )
}

function TransactionDetails({parsed}: {parsed: ParsedGambaTransaction}) {
  const gameResult = parsed.event.gameResult!
  const uniqueOutcomes = Array.from(new Set(gameResult.bet)).sort()
  return (
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
                <NavLink to={'/platform/' + gameResult.creator.toBase58()}>
                  <PlatformAccountItem address={gameResult.creator} />
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
                <NavLink to={'/player/' + gameResult.player.toBase58()}>
                  <PlayerAccountItem address={gameResult.player} />
                </NavLink>
              </Link>
            </Grid>
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            <Grid columns="2" gap="4">
              <Text weight="bold">
                Transaction
              </Text>
              <Link target="_blank" href={`https://solscan.io/tx/${parsed.signature}`} rel="noreferrer">
                View in Solana Explorer <ExternalLinkIcon />
              </Link>
            </Grid>
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            <Grid columns="2" gap="4">
              <Text weight="bold">
                Time
              </Text>
              <Text>
                {new Date(parsed.time).toLocaleString(undefined, {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
  )
}

async function fetchGambaTransaction(connection: Connection, txId: string) {
  if (!isSignature(txId)) throw new Error('Not a valid signature')
  const transaction = await connection.getParsedTransaction(txId)
  if (!transaction) throw new Error('Transaction doesnt exist')
  const parsed = parseGambaTransaction(transaction)
  const logs = transaction?.meta?.logMessages ?? []

  const key = 'Program log: [Gamba] next_rng_seed_hashed: '
  const a = logs?.find((x) => x.startsWith(key))
  const nextRngSeedHashed = a ? JSON.parse(a.split(key)[1] ?? '""') : ''

  return {transaction, logs, parsed, nextRngSeedHashed}
}

export function PlayView() {
  const { connection } = useConnection()
  const params = useParams<{txid: string}>()
  const txId = params.txid!
  const { data, isLoading, error } = useSWR('tx-'+txId, () => fetchGambaTransaction(connection, txId))

  if (isLoading) {
    return (
      <Container>
        <Flex align="center" justify="center" p="4">
          <Loader />
        </Flex>
      </Container>
    )
  }

  if (error || !data) {
    return (
      <Container>
        Failed to fetch transaction: {JSON.stringify(error)}
      </Container>
    )
  }

  const gameResult = data.parsed.event.gameResult!

  const moreThanOne = gameResult.bet.filter((x) => x >= 1)
  const sum = gameResult.bet.reduce((p, x) => p + x, 0)
  const winChange = moreThanOne.length / gameResult.bet.length
  const potentialWin = Math.max(...gameResult.bet)
  const oddsScore = sum / gameResult.bet.length

  return (
    <Container>
    <Grid gap="4">
      <Tabs.Root defaultValue="details">
        <Grid gap="4">
          <Tabs.List size="2">
            <Tabs.Trigger value="details">Details</Tabs.Trigger>
            {gameResult.bet.length > 0 && (
              <Tabs.Trigger value="verification">Verification</Tabs.Trigger>
            )}
          </Tabs.List>

          <Tabs.Content value="details">
            <Grid gap="4">
            {gameResult.bet.length > 0 ? (
              <Box>
                <Flex gap="4">
                  <Card size="2">
                    <Grid>
                      <Text color="gray" size="1">
                        Win Chance
                      </Text>
                      <Text size="6" color="green" weight="bold">
                        {parseFloat((winChange * 100).toFixed(3))}%
                      </Text>
                    </Grid>
                  </Card>
                  <Card size="2">
                    <Grid>
                      <Text color="gray" size="1">
                        Max Win
                      </Text>
                      <Text size="6" color="green" weight="bold">
                        {parseFloat(potentialWin.toFixed(3))}x
                      </Text>
                    </Grid>
                  </Card>
                  <Card size="2">
                    <Grid>
                      <Text color="gray" size="1">
                        House Edge
                      </Text>
                      <Text size="6" color="green" weight="bold">
                        {parseFloat((100 - oddsScore * 100).toFixed(1))}%
                      </Text>
                    </Grid>
                  </Card>
                </Flex>
              </Box>
            ) : (
              <Callout.Root mb="4">
                <Callout.Text>
                  This transaction is from an older version of Gamba and can only be verified onchain.
                </Callout.Text>
              </Callout.Root>
            )}

              <TransactionDetails parsed={data.parsed} />
              <Card>
                <Grid gap="2">
                  <Text color="gray">
                    Program Logs
                  </Text>
                  <Flex direction="column" gap="1">
                    {data.logs.map((x, i) => (
                      <Code style={{wordBreak: 'break-all'}} size="1" key={i}>{x}</Code>
                    ))}
                  </Flex>
                </Grid>
              </Card>
            </Grid>
          </Tabs.Content>
          <Tabs.Content value="verification">
            <VerificationSection
              parsed={gameResult}
              nextRngSeed={data.nextRngSeedHashed}
            />
          </Tabs.Content>
        </Grid>

        </Tabs.Root>
      </Grid>

    </Container>
  )
}
