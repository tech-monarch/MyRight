import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import disputeRoutes  from './routes/disputes'
import documentRoutes from './routes/documents'

import chatRoutes from './routes/chats'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/disputes',  disputeRoutes)
app.use('/api/documents', documentRoutes)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})


// add this line with the other routes
app.use('/api/chats', chatRoutes)