import { ArrowRightIcon, CodeIcon, ExternalLinkIcon, MixIcon, ResetIcon } from "@radix-ui/react-icons"
import { Badge, Box, Button, Card, Code, Dialog, Flex, Grid, Heading, IconButton, Link, Table, Tabs, Text, TextField } from "@radix-ui/themes"
import { useConnection } from "@solana/wallet-adapter-react"
import { Connection } from "@solana/web3.js"
import { BPS_PER_WHOLE, GambaTransaction, parseGambaTransaction } from "gamba-core-v2"
import React from "react"
import { NavLink, useParams } from "react-router-dom"
import styled, { css } from "styled-components"
import useSWR from "swr"

import { TokenAvatar } from "@/components"
import { PlatformAccountItem, PlayerAccountItem } from "@/components/AccountItem"
import { Spinner } from "@/components/Spinner"
import { TokenValue2 } from "@/components/TokenValue2"

const StyledOutcome = styled.div<{$rank: number, $active: boolean}>`
  --rank-0: #ff293b;
  --rank-1: #ff7142;
  --rank-2: #ffa557;
  --rank-3: #ffa557;
  --rank-4: #ffd166;
  --rank-5: #fff875;
  --rank-6: #e1ff80;
  --rank-7: #60ff9b;
  background-color: var(--slate-2);

  padding: calc(var(--space-1) / 2) var(--space-2);
  min-width: 2em;
  text-align: center;
  position: relative;
  border-radius: max(var(--radius-1), var(--radius-full));
  overflow: hidden;

  &:before {
    content: '';
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    position: absolute;
    opacity: .05;
  }

  ${props => props.$active && css`
    box-shadow: 0 0 0 1px currentColor;
    &:before {
      opacity: .15;
    }
  `}

  ${props => css`
    color: var(--rank-${props.$rank});
    &:before {
      background-color: var(--rank-${props.$rank});
    }
  `}
`

function VerificationSection({ parsed }: { parsed: GambaTransaction<"GameSettled">}) {
  const data = parsed.data
  const [output, setOutput] = React.useState<number>()
  const [clientSeed, setClientSeed] = React.useState(data.clientSeed)

  const verifyArgs = [
    data.rngSeed,
    clientSeed,
    data.nonce.toNumber(),
    data.wager.toNumber(),
    data.bet.map(x => x / BPS_PER_WHOLE),
  ].map(x => JSON.stringify(x))

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
    return wager * multiplier;
  })(${verifyArgs});
  `
  React.useEffect(() => {
    eval(script).then(setOutput)
  }, [script])

  return (
    <Flex direction="column" gap="4">
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
                  Client Seed {clientSeed !== data.clientSeed && "(Edited)"}
                </Text>
                <TextField.Root>
                  <TextField.Input
                    value={clientSeed}
                    onChange={evt => setClientSeed(evt.target.value)}
                  />
                  <TextField.Slot>
                    <IconButton onClick={() => setClientSeed(Array.from({ length: 16 })
                      .map(() => (Math.random() * 16 | 0).toString(16))
                      .join(""))} size="1" variant="ghost">
                      <MixIcon />
                    </IconButton>
                  </TextField.Slot>
                  <TextField.Slot>
                    <IconButton disabled={clientSeed === data.clientSeed} onClick={() => setClientSeed(data.clientSeed)} size="1" variant="ghost">
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
                  {data.nonce.toNumber()}
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
                  {data.rngSeed}
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
                  {data.nextRngSeedHashed}
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
                <Flex gap="2" align="center">
                  <Text>Payout:</Text>
                  {output !== undefined && (
                    <Code>
                      <TokenValue2 mint={data.tokenMint} amount={output} />
                    </Code>
                  )}
                </Flex>
              </Grid>
            </Table.Cell>
          </Table.Row>

        </Table.Body>
      </Table.Root>
      <Card>
        <Flex direction="column" gap="4">
          <Text size="4" weight="bold">
            This game is provably fair.
          </Text>
          <Text size="2">
            The result is calculated by combining the <Code>rng_seed</Code> provided by Gamba, the <Code>client_seed</Code> provided by the player, and a <Code>nonce</Code>, which increments by 1 for each player after every play.
            <br />
            The sha256 hash for the next RNG Seed is revealed in this transaction just like the one prior.
            <br />
            You can simulate the bet here with a custom client seed, to see how it would affect the result.<br />
          </Text>
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
                <pre
                  dangerouslySetInnerHTML={{ __html: `eval(\`${script}\`).then(console.log)`.replaceAll("\n", "<br />") }}
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
        </Flex>
      </Card>
    </Flex>
  )
}

function TransactionDetails({ parsed }: {parsed: GambaTransaction<"GameSettled">}) {
  const game = parsed.data
  const multiplier = game.bet[game.resultIndex.toNumber()] / BPS_PER_WHOLE
  const wager = game.wager.toNumber()
  const payout = multiplier * wager
  const profit = payout - wager
  const uniqueOutcomes = Array.from(new Set(game.bet)).sort((a, b) => a > b ? 1 : -1)

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
                Pool
              </Text>
              <Link asChild>
                <NavLink to={"/pool/" + game.pool.toBase58()}>
                  <Flex gap="2">
                    <TokenAvatar size="1" mint={game.tokenMint} />
                    {game.pool.toBase58()}
                  </Flex>
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
                <NavLink to={"/player/" + game.user.toBase58()}>
                  <PlayerAccountItem address={game.user} />
                </NavLink>
              </Link>
            </Grid>
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            <Grid columns="2" gap="4">
              <Text weight="bold">
                Platform
              </Text>
              <Link asChild>
                <NavLink to={"/platform/" + game.creator.toBase58()}>
                  <PlatformAccountItem address={game.creator} />
                </NavLink>
              </Link>
            </Grid>
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            <Grid columns="2" gap="4">
              <Text weight="bold">
                Metadata
              </Text>
              <Text>
                {parsed.data.metadata}
              </Text>
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
                {new Date(parsed.time).toLocaleString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
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
              <Flex gap="2" align="center">
                <TokenAvatar size="1" mint={game.tokenMint} />
                <TokenValue2 amount={wager - game.bonusUsed.toNumber()} mint={game.tokenMint} />
                {game.bonusUsed.toNumber() > 0 && (
                  <>
                    {" "}(Bonus: <TokenValue2 exact amount={game.bonusUsed.toNumber()} mint={game.tokenMint} />)
                  </>
                )}
              </Flex>
            </Grid>
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            <Grid columns="2" gap="4">
              <Text weight="bold">
                Payout
              </Text>
              <Flex direction="column" gap="2">
                <Flex gap="2" align="center">
                  <Flex gap="2" align="center">
                    <TokenAvatar size="1" mint={game.tokenMint} />
                    <TokenValue2 amount={payout} mint={game.tokenMint} />
                  </Flex>
                  <Badge color={profit >= 0 ? "green" : "red"}>
                    {(multiplier * 100 - 100).toLocaleString(undefined, { maximumFractionDigits: 3 })}%
                  </Badge>
                </Flex>

                {game.jackpotPayoutToUser.toNumber() > 0 && (
                  <Flex gap="2" align="center">
                    <TokenAvatar size="1" mint={game.tokenMint} />
                    <TokenValue2 amount={game.jackpotPayoutToUser.toNumber()} mint={game.tokenMint} /> Jackpot
                  </Flex>
                )}

              </Flex>
            </Grid>
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            <Grid columns="2" gap="4">
              <Text weight="bold">
                Fees
              </Text>
              <Flex direction="column" gap="2">
                <Flex gap="2" align="center">
                  <TokenAvatar size="1" mint={game.tokenMint} />
                  <TokenValue2 amount={game.jackpotFee.toNumber() + game.poolFee.toNumber() + game.creatorFee.toNumber() + game.gambaFee.toNumber()} mint={game.tokenMint} />
                </Flex>
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
                {game.bet.map((x, i) => {
                  const rank = Math.floor(uniqueOutcomes.indexOf(x) / (uniqueOutcomes.length - 1) * 7)
                  const active = i === game.resultIndex.toNumber()
                  return (
                    <StyledOutcome
                      key={i}
                      $active={active}
                      $rank={rank}
                    >
                      <Text size="1">
                        {x / BPS_PER_WHOLE}x
                      </Text>
                    </StyledOutcome>
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
  const transaction = await connection.getParsedTransaction(txId, { commitment: "confirmed", maxSupportedTransactionVersion: 0 })

  if (!transaction) throw new Error("Transaction doesnt exist")

  const isV1 = transaction.transaction.message.accountKeys.some((x) => x.pubkey.toBase58() === "GambaXcmhJg1vgPm1Gn6mnMKGyyR3X2eSmF6yeU6XWtT")

  const [parsed] = parseGambaTransaction(transaction)

  const logs = transaction?.meta?.logMessages ?? []

  return { transaction, logs, parsed, isV1, notAGame: parsed?.name !== 'GameSettled' }
}

export default function PlayView() {
  const { connection } = useConnection()
  const params = useParams<{txid: string}>()
  const txId = params.txid!
  const { data, isLoading, error } = useSWR("tx-" + txId, () => fetchGambaTransaction(connection, txId))

  if (isLoading) {
    return (
      <>
        <Flex align="center" justify="center" p="4">
          <Spinner />
        </Flex>
      </>
    )
  }

  if (error || !data) {
    return (
      <>
        Failed to fetch transaction: {JSON.stringify(error?.message)}
      </>
    )
  }

  if (data.isV1) {
    return (
      <>
        <Heading mb="4">
          This is a legacy transaction
        </Heading>
        <Button onClick={() => window.open('https://v1.gamba.so/tx/' + txId)}>
          Verify in V1 Explorer <ArrowRightIcon />
        </Button>
      </>
    )
  }

  if (data.parsed?.name !== 'GameSettled') {
    return (
      <>
        <Heading mb="4">
          This transaction is not a game event
        </Heading>
        <Button onClick={() => window.open('https://solscan.io/tx/' + txId)}>
          View in Solana explorer <ArrowRightIcon />
        </Button>
      </>
    )
  }

  const game = data.parsed.data

  const moreThanOne = game.bet.filter(x => x >= 1)
  const sum = game.bet.reduce((p, x) => p + x, 0) / 10_000
  const winChange = moreThanOne.length / game.bet.length
  const potentialWin = Math.max(...game.bet)
  const oddsScore = sum / game.bet.length

  return (
    <Tabs.Root defaultValue="details">
      <Grid gap="4">
        <Tabs.List size="2">
          <Tabs.Trigger value="details">Details</Tabs.Trigger>
          <Tabs.Trigger value="verification">
            Proof
          </Tabs.Trigger>
          <Tabs.Trigger value="logs">
            Logs
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="details">
          <Grid gap="4">
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
                      {(potentialWin / BPS_PER_WHOLE).toLocaleString(undefined, { maximumFractionDigits: 3 })}x
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
            <TransactionDetails parsed={data.parsed} />
          </Grid>
        </Tabs.Content>
        <Tabs.Content value="verification">
          <VerificationSection parsed={data.parsed} />
        </Tabs.Content>
        <Tabs.Content value="logs">
          <Card>
            <Grid gap="2">
              <Flex direction="column" gap="1">
                {data.logs.map((x, i) => (
                  <Code style={{ wordBreak: "break-all" }} size="1" key={i}>{x}</Code>
                ))}
              </Flex>
            </Grid>
          </Card>
        </Tabs.Content>
      </Grid>
    </Tabs.Root>
  )
}
