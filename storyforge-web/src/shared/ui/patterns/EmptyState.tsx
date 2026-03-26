import type { ReactNode } from 'react'

import { Button } from '@/shared/ui/primitives/Button'

interface EmptyStateProps {
  title: ReactNode
  description: ReactNode
  actionLabel?: ReactNode
  onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-[var(--radius-panel)] border border-dashed border-border/80 bg-surface-subtle/50 px-6 py-16 text-center transition-all duration-300 hover:border-border-strong hover:bg-surface sm:py-20">
      <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full border border-border/40 bg-surface text-text-muted shadow-sm ring-4 ring-surface-subtle">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        </svg>
      </div>
      <div className="space-y-1.5">
        <h2 className="text-[17px] font-[600] tracking-tight text-text">{title}</h2>
        <p className="max-w-md text-[14px] leading-relaxed text-text-muted">{description}</p>
      </div>
      {actionLabel && onAction ? (
        <div className="mt-2">
          <Button onClick={onAction} variant="secondary">
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
