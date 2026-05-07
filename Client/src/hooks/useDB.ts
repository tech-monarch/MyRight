import { db, type Case, type User, type Document } from '../db'

// --- Users ---
export const saveUser = (user: User) => db.users.add(user)

export const getUser = (id: number) => db.users.get(id)


export const updateUser = (id: number, changes: Partial<User>) =>
  db.users.update(id, { ...changes, updatedAt: new Date() })


// --- Cases ---
export const createCase = (data: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'synced'>) =>
  db.cases.add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
    synced: false             // mark as unsynced until sent to backend
  })

export const getAllCases = () =>
  db.cases.orderBy('createdAt').reverse().toArray()

export const getCasesByStatus = (status: Case['status']) =>
  db.cases.where('status').equals(status).toArray()

export const updateCase = (id: number, changes: Partial<Case>) =>
  db.cases.update(id, { ...changes, updatedAt: new Date(), synced: false })

export const deleteCase = (id: number) => db.cases.delete(id)

export const getUnsyncedCases = () =>
  db.cases.where('synced').equals(0).toArray()   // 0 = false in IndexedDB


// --- Documents ---
export const saveDocument = (doc: Omit<Document, 'id' | 'uploadedAt' | 'synced'>) =>
  db.documents.add({
    ...doc,
    uploadedAt: new Date(),
    synced: false
  })

export const getDocumentsByCase = (caseId: number) =>
  db.documents.where('caseId').equals(caseId).toArray()

export const getUnsyncedDocuments = () =>
  db.documents.where('synced').equals(0).toArray()