import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const authFetch = async (path: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Request failed')
  }

  return res.json()
}

export const api = {
  disputes: {
    analyze: (
      description: string,
      location?: { lat: number; lng: number; mapsUrl: string },
      history?: { role: string; content: string }[],
      mode: 'chat' | 'analyze' = 'chat',
    ) =>
      authFetch('/api/disputes/analyze', {
        method: 'POST',
        body: JSON.stringify({ description, location, history, mode }),
      }),

    submit: (data: {
      title?: string
      description: string
      category: string
      opponentName: string
      opponentContact: string
    }) =>
      authFetch('/api/disputes/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getAll: () => authFetch('/api/disputes'),
  },

  documents: {
    upload: async (files: File[], caseId?: string) => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      if (caseId) formData.append('caseId', caseId)

      const res = await fetch(`${BASE_URL}/api/documents/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }

      return res.json()
    },

    getByCase: (caseId: string) =>
      authFetch(`/api/documents/${caseId}`),
  },

  chats: {
    save: (data: {
      messages: { role: string; content: string }[]   // ← fixed: no 'any'
      category?: string
      urgency?: string
      caseId?: string
      sessionId?: number
    }) =>
      authFetch('/api/chats', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getAll: () => authFetch('/api/chats'),

    getById: (id: string) => authFetch(`/api/chats/${id}`),
  },
}