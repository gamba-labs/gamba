import ngrok from '@ngrok/ngrok'
import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'
import api from './api'
import { run } from './db'

config()

const app = express()
const port = process.env.PORT || 3000

if (!process.env.SOLANA_RPC_ENDPOINT) {
  throw new Error('RPC not specified')
} {
  run(process.env.SOLANA_RPC_ENDPOINT)
}

app.use(express.json())
app.use(cors())

app.use(api)

app.listen(port, () => {
  console.log(`Api running at http://localhost:${port}`)
})

// Create ngrok connection (TODO setup with pm2)
if (process.env.NGROK_AUTH) {
  ngrok.forward({
    authtoken: process.env.NGROK_AUTH,
    addr: port,
  }).then((url) => {
    console.log('NGROK:', url)
  })

  // Cleanup ngrok connection
  process.stdin.resume()

  const exitHandler = (options, exitCode: number) => {
    ngrok.disconnect()

    if (options.cleanup) console.log('cleanup')
    if (exitCode || exitCode === 0) console.log(exitCode)
    if (options.exit) process.exit()
  }

  process.on('exit', exitHandler.bind(null, { cleanup: true }))
  process.on('SIGINT', exitHandler.bind(null, { exit: true }))
  process.on('SIGUSR1', exitHandler.bind(null, { exit: true }))
  process.on('SIGUSR2', exitHandler.bind(null, { exit: true }))
  process.on('uncaughtException', exitHandler.bind(null, { exit: true }))
}
