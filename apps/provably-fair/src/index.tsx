import { AlertDialog, Button, Code, Container, DropdownMenu, Flex, Heading, Text, Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'

import { useConnection } from '@solana/wallet-adapter-react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Route, Routes, useNavigate, useParams } from 'react-router-dom'

const root = ReactDOM.createRoot(document.getElementById('root')!)

function Dashboard() {
  return (
    <div>Welcome to the Gamba explorer</div>
  )
}

function Transaction() {
  const navigate = useNavigate()
  const { connection } = useConnection()
  const { txid } = useParams<{txid: string}>()
  const [logs, setLogs] = React.useState<string[]>([])

  React.useEffect(
    () => {
      connection.getParsedTransaction(txid!)
        .then((x) => {
          setLogs(x?.meta?.logMessages ?? [])
          // !nonce || !client || !rng || !rngHashed || !options
          // navigate(`/?nonce=${100}&options=1,2,3&rng_hash=1&client=321&rng=10`)
        })
    }
    , [txid])

  return (
    <>
      <Heading>{txid}</Heading>
      <Container>
        {logs.map((x, i) => (
          <Code key={i}>{x}</Code>
        ))}
      </Container>
      <a target="_blank" href={`https://explorer.solana.com/tx/${txid}`} rel="noreferrer">
        View in Solana Explorer
      </a>
    </>
  )
}

function Weclome() {
  return (
    <>
      <Flex direction="column" gap="2">
        <Text>Hello from Radix Themes :)</Text>
        <Button>Lets go</Button>
        <AlertDialog.Root>
          <AlertDialog.Trigger>
            <Button color="red">Revoke access</Button>
          </AlertDialog.Trigger>
          <AlertDialog.Content style={{ maxWidth: 450 }}>
            <AlertDialog.Title>Revoke access</AlertDialog.Title>
            <AlertDialog.Description size="2">
    Are you sure? This application will no longer be accessible and any
    existing sessions will be expired.
            </AlertDialog.Description>

            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel>
                <Button variant="soft" color="gray">
        Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button variant="solid" color="red">
        Revoke access
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button color="green">Click Me</Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            <DropdownMenu.Group>
              <DropdownMenu.Item>
                <p>New Tab</p>
              </DropdownMenu.Item>
            </DropdownMenu.Group>

            <DropdownMenu.Group onClick={() => alert('Nooo')}>
              <DropdownMenu.Item>
                <p>More tools</p>
              </DropdownMenu.Item>
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Weclome />}
      />
      <Route
        path="/tx/:txid"
        element={<Transaction />}
      />
    </Routes>
  )
}

root.render(
  <React.StrictMode>
    <Theme accentColor="iris" panelBackground="solid">
      <Weclome />
    </Theme>
  </React.StrictMode>,
)
