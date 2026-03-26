import type { HTMLAttributes } from 'react'

import { cn } from '@/shared/utils/cn'

export function PageShell({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('grid gap-6', className)} {...props} />
}
