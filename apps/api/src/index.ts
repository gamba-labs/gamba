import cors from 'cors'
import express from 'express'
import api from './api'
import { sync2 } from './sync'

sync2()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

app.use(api)

app.listen(port, () => {
  console.log(`Api running at http://localhost:${port}`)
})
