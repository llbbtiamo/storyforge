import type { HTMLAttributes } from 'react'

import { cn } from '@/shared/utils/cn'

export function Toolbar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-wrap gap-3', className)} {...props} />
}
