import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/utils/cn'

type PageHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  eyebrow?: ReactNode
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between', className)} {...props}>
      <div className="max-w-3xl">
        {eyebrow ? <div className="mb-2 text-[11px] font-[700] uppercase tracking-widest text-text-subtle">{eyebrow}</div> : null}
        <h1 className="text-2xl font-[700] tracking-tight text-text sm:text-[28px]">{title}</h1>
        {description ? <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  )
}
