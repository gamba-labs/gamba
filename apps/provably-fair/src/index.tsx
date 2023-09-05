import { ConnectionProvider, useConnection } from '@solana/wallet-adapter-react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import './index.css'
import { Legacy } from './Legacy'

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
      <div>{txid}</div>
      <pre>
        {logs.map((x, i) => (
          <div key={i}>{x}</div>
        ))}
      </pre>
      <a target="_blank" href={`https://explorer.solana.com/tx/${txid}`} rel="noreferrer">
        View in Solana Explorer
      </a>
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Legacy />}
      />
      <Route
        path="/tx/:txid"
        element={<Transaction />}
      />
    </Routes>
  )
}

root.render(
  <ConnectionProvider
    endpoint={import.meta.env.GAMBA_SOLANA_RPC}
    config={{ wsEndpoint: import.meta.env.GAMBA_SOLANA_RPC_WS, commitment: 'confirmed' }}
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ConnectionProvider>,
)
