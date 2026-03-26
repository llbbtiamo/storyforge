import type { ReactNode } from 'react'

import { cn } from '@/shared/utils/cn'

const toneClassNames = {
  success: 'border-success/15 bg-surface text-text',
  error: 'border-danger/15 bg-surface text-text',
  info: 'border-primary/10 bg-surface text-text',
} as const

const accentClassNames = {
  success: 'bg-success',
  error: 'bg-danger',
  info: 'bg-primary',
} as const

interface ToastProps {
  title: ReactNode
  description?: ReactNode
  tone: keyof typeof toneClassNames
  onClose?: () => void
}

export function Toast({ title, description, tone, onClose }: ToastProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-control)] border px-4 py-3 shadow-modal',
        toneClassNames[tone],
      )}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <div className={cn('absolute inset-y-0 left-0 w-1', accentClassNames[tone])} />
      <div className="flex items-start gap-3 pl-2">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-sm font-semibold text-text">{title}</div>
          {description ? <div className="text-sm leading-6 text-text-muted">{description}</div> : null}
        </div>
        {onClose ? (
          <button
            aria-label="关闭提示"
            className="shrink-0 rounded-md p-1 text-text-subtle transition hover:bg-surface-subtle hover:text-text"
            onClick={onClose}
            type="button"
          >
            <svg className="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  )
}
