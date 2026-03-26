import type { HTMLAttributes } from 'react'

import { cn } from '@/shared/utils/cn'
import { Card } from '@/shared/ui/primitives/Card'

export function SectionCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Card className={cn('space-y-5', className)} {...props} />
}
