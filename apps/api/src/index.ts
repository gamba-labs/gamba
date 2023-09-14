// import { Connection } from '@solana/web3.js'
// import express from 'express'
// import { EventFetcher } from 'gamba-core'

// class GambaApi {
//   events: EventFetcher

//   constructor(connection: Connection) {
//     this.events = new EventFetcher(connection)
//   }

//   async fetchAll() {
//     try {
//       const transactions = await this.events.fetch({ signatureLimit: 40 })
//       if (!transactions.length) {
//         console.log('Fetched all')
//       }
//       await this.fetchAll()
//     } catch (err) {
//       console.error('Failed', err)
//       console.debug('Retrying')
//       await new Promise((resolve) => setTimeout(resolve, 3000))
//     }
//   }
// }

// const connection = new Connection('')
// const api = new GambaApi(connection)

// console.log(api)

// ///////////////////
// const app = express()
// const PORT = 8484

// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

// app.get('/', async (req, res) => {
//   const recent = await api.events.fetch({ signatureLimit: 20 })
//   //
//   res.send(recent.map((x) => x.event.gameResult))
// })

// app.listen(PORT, () => {
//   console.log(`Gamba API http://localhost/${PORT}`)
// })
