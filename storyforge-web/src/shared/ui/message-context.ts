import { createContext } from 'react'

export interface AppMessageApi {
  success: (content: string) => void
  error: (content: string) => void
  info: (content: string) => void
}

export const MessageContext = createContext<AppMessageApi | null>(null)
