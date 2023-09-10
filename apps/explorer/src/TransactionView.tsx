import { CheckIcon, ExternalLinkIcon } from '@radix-ui/react-icons'
import { Badge, Box, Button, Card, Code, Container, Flex, Grid, Heading, Link, Text } from '@radix-ui/themes'
import { useConnection } from '@solana/wallet-adapter-react'
import React from 'react'
import { useParams } from 'react-router-dom'

export function TransactionView() {
  const { connection } = useConnection()
  const { txid } = useParams<{txid: string}>()
  const [logs, setLogs] = React.useState<string[]>([])
  const [valid, setValid] = React.useState(false)

  const [parsed, setParsed] = React.useState<{
    bet: number[]
    wager: number
    resultIndex: number
    rngSeed: string
    rngSeedHashed: string
    nonce: number
    clientSeed: string
  }>()

  React.useEffect(
    () => {
      connection.getParsedTransaction(txid!)
        .then((x) => {
          const _logs = x?.meta?.logMessages ?? []

          const extractValue = (key: string) => {
            const arr = _logs.find((x) => x.includes(key + ': '))?.split(key + ': ')
            const xx = arr ? arr[1] : ''
            console.log(key, xx)
            return xx
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

  const verifyArgs = [
    parsed.rngSeed,
    parsed.rngSeedHashed,
    parsed.clientSeed,
    parsed.nonce,
    parsed.wager,
    bet,
  ].map((x) => JSON.stringify(x))

  const script = `
  const hmac256=async(e,n,t="SHA-256")=>{const a=new TextEncoder,r=a.encode(n),o=a.encode(e),c=await window.crypto.subtle.importKey("raw",o,{name:"HMAC",hash:t},!1,["sign"]),i=await window.crypto.subtle.sign("HMAC",c,r);return Array.from(new Uint8Array(i)).map((e=>e.toString(16).padStart(2,"0"))).join("")};((e,n,t,a,r,o)=>{hmac256(e,[t,a].join("-")).then((e=>{const n=parseInt(e.substring(0,5),16)%o.length,t=o[n];alert("Payout: "+r*t/1e9+" SOL")}))})(${verifyArgs});
  `

  return (
    <Container>
      <Box my="4">
        <Heading mb="3" size="8">
          Gamba Transaction
        </Heading>

        <Flex gap="2">
          <Badge color="green">
            <CheckIcon />
            Verified Fair!
          </Badge>

          <Link target="_blank" href={`https://explorer.solana.com/tx/${txid}`} rel="noreferrer">
            View in Solana Explorer <ExternalLinkIcon />
          </Link>
        </Flex>
      </Box>

      <Heading as="h3">
        Bet Summary
      </Heading>

      <Box my="4">
        <Flex gap="4">
          <Card size="3">
            <Grid>
              <Heading color="gray" size="2">
                Win Chance
              </Heading>
              <Text size="7" weight="bold">
                {parseFloat((winChange * 100).toFixed(2))}%
              </Text>
            </Grid>
          </Card>
          <Card size="3">
            <Grid>
              <Heading color="gray" size="2">
                Max Win
              </Heading>
              <Text size="7" weight="bold">
                {parseFloat(potentialWin.toFixed(2))}x
              </Text>
            </Grid>
          </Card>
          <Card size="3">
            <Grid>
              <Heading color="gray" size="2">
                House Edge
              </Heading>
              <Text size="7" weight="bold">
                {parseFloat((100 - oddsScore * 100).toFixed(1))}%
              </Text>
            </Grid>
          </Card>
          <Card size="3">
            <Grid>
              <Heading color="gray" size="2">
                Wager
              </Heading>
              <Text size="7" weight="bold">
                {parseFloat((parsed.wager / 1e9).toFixed(2))} SOL
              </Text>
            </Grid>
          </Card>
        </Flex>
      </Box>

      <Box my="4">
        <Flex gap="1" wrap="wrap">
          {bet.map((x, i) => (
            <Card key={i} size="1">
              <Text>
                <Text color={parsed.resultIndex === i ? 'green' : 'gray'}>
                  {x}x
                </Text>
              </Text>
            </Card>
          ))}
        </Flex>
      </Box>


      <Heading as="h3" mb="4">
          Verify for yourself:
      </Heading>
      <Box my="4">
        <Code size="2">
          {script}
        </Code>
      </Box>
      <Button onClick={(() => eval(script))}>
        Execute JS
      </Button>

      <Box my="4">
        <Heading as="h3" mb="4">
          Program Logs
        </Heading>

        <Flex direction="column" gap="1">
          {logs.map((x, i) => (
            <Code size="2" key={i}>{x}</Code>
          ))}
        </Flex>
      </Box>
    </Container>
  )
}
