import type { ReactNode } from 'react'
import { Suspense } from 'react'

import { LoadingState } from '@/shared/ui/patterns/LoadingState'

export function RouteSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingState className="min-h-[40vh]" label="加载中..." />}>
      {children}
    </Suspense>
  )
}
