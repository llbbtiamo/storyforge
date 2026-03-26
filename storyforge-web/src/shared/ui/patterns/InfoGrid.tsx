import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/utils/cn'
import { Card } from '@/shared/ui/primitives/Card'

type InfoGridProps = HTMLAttributes<HTMLDivElement>

type InfoCardProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode
  value: ReactNode
}

export function InfoGrid({ className, ...props }: InfoGridProps) {
  return <div className={cn('grid gap-3 sm:grid-cols-2 xl:grid-cols-3', className)} {...props} />
}

export function InfoCard({ label, value, className, ...props }: InfoCardProps) {
  return (
    <Card className={cn('grid gap-1.5 p-4 shadow-card transition-all duration-300 hover:-translate-y-[2px] hover:border-border-strong hover:shadow-card-hover', className)} {...props}>
      <div className="text-[11px] font-[700] uppercase tracking-widest text-text-subtle">{label}</div>
      <div className="text-[14px] leading-7 text-text font-medium">{value}</div>
    </Card>
  )
}
