import type { HTMLAttributes } from 'react'

import { cn } from '@/shared/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean
  interactive?: boolean
}

export function Card({ className, padded = true, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-panel)] border border-border bg-surface shadow-[var(--shadow-card)] transition-all duration-300',
        interactive && 'hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]',
        padded && 'p-5 sm:p-6',
        className,
      )}
      {...props}
    />
  )
}
