import { useContext } from 'react'

import { MessageContext } from '@/shared/ui/message-context'

export function useAppMessage() {
  const context = useContext(MessageContext)
  if (!context) {
    throw new Error('useAppMessage must be used inside AppMessageProvider')
  }
  return context
}
