import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import disputeRoutes from './routes/disputes'
import documentRoutes from './routes/documents'
import chatRoutes from './routes/chats'
import initializeRoutes from './routes/initialise'
import uploadRoutes from './routes/upload'
import dashboardRoutes from './routes/dashboard'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// 🔥 FIXED CORS (production-safe)
const allowedOrigins = [
  'http://localhost:5173',
  'https://my-right-one.vercel.app'
]

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}))

// IMPORTANT: handle preflight requests
app.options('*', cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// routes
app.use('/api/disputes', disputeRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/initialize', initializeRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/uploads', express.static('uploads'))
app.use('/api/dashboard', dashboardRoutes)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})