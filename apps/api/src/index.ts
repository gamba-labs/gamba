import cors from 'cors'
import express from 'express'
import api from './api'
import { config } from './config'
import { sync } from './sync'

sync()

const app = express()
const port = config().PORT || 3000

app.use(express.json())
app.use(cors())

app.use(api)

app.listen(port, () => {
  console.log(`Api running at http://localhost:${port}`)
})
