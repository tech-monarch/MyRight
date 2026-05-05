import { create } from 'zustand'

interface InitializeState {
  description: string
  category: string
  files: File[]
  setDescription: (desc: string) => void
  setCategory: (cat: string) => void
  addFiles: (newFiles: File[]) => void
  removeFile: (index: number) => void
  resetForm: () => void
}

export const useInitializeStore = create<InitializeState>((set) => ({
  description: '',
  category: '',
  files: [],
  setDescription: (description) => set({ description }),
  setCategory: (category) => set({ category }),
  addFiles: (newFiles) =>
    set((state) => ({ files: [...state.files, ...newFiles] })),
  removeFile: (index) =>
    set((state) => ({ files: state.files.filter((_, i) => i !== index) })),
  resetForm: () => set({ description: '', category: '', files: [] })
}))