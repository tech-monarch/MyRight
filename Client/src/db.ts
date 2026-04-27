import Dexie, { type Table } from 'dexie'

// --- Types ---

export interface User {
  id?:        number
  name:       string
  email:      string
  phone?:     string
  avatarUrl?: string
  createdAt:  Date
  updatedAt:  Date
}

export interface Case {
  id?:          number
  title:        string
  description:  string
  status:       'open' | 'pending' | 'in-mediation' | 'resolved' | 'closed'
  type:         'dispute' | 'mediation' | 'arbitration'
  userId:       number        // who created it
  assignedTo?:  number        // mediator id
  createdAt:    Date
  updatedAt:    Date
  synced:       boolean       // false = not yet sent to backend
}

export interface Document {
  id?:         number
  caseId:      number         // which case it belongs to
  name:        string
  type:        string         // 'pdf', 'image', 'docx' etc
  size:        number         // bytes
  data:        ArrayBuffer    // actual file stored locally
  uploadedAt:  Date
  synced:      boolean
}

// --- Database ---

class MyRightDB extends Dexie {
  users!:     Table<User>
  cases!:     Table<Case>
  documents!: Table<Document>

  constructor() {
    super('myright-db')

    this.version(1).stores({
      users:     '++id, email, createdAt',
      cases:     '++id, userId, status, type, synced, createdAt',
      documents: '++id, caseId, synced, uploadedAt',
    })
  }
}

export const db = new MyRightDB()