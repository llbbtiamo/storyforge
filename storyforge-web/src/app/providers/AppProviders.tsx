import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'

import { queryClient } from '@/shared/query/client'
import { AuthProvider } from '@/shared/auth/AuthProvider'
import { AppMessageProvider } from '@/shared/ui/AppMessageProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppMessageProvider>{children}</AppMessageProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
