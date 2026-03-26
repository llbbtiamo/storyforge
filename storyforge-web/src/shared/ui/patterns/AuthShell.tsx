import type { ReactNode } from 'react'

import { Badge } from '@/shared/ui/primitives/Badge'

interface AuthShellProps {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  notice?: ReactNode
}

export function AuthShell({ title, description, children, footer, notice }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-surface-subtle bg-dot-grid px-4 py-12 sm:px-6 lg:px-8 selection:bg-primary-soft selection:text-primary-hover">
      {/* Subtle Ambient Orbs */}
      <div className="pointer-events-none absolute left-1/2 top-[40%] -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-[0.15] blur-[100px]">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-zinc-400 to-zinc-200"></div>
      </div>

      <div className="mb-10 flex flex-col items-center">
        <Badge className="mb-5 shadow-sm" tone="neutral">
          StoryForge AI
        </Badge>
        <h1 className="text-center text-3xl font-[700] tracking-tight text-text sm:text-4xl">
          专业情节与世界观构建引擎
        </h1>
        <p className="mt-4 text-center text-[15px] leading-relaxed text-text-muted">
          由极客激发，为专业创作者打造的现代工作台
        </p>
      </div>

      <div className="w-full max-w-[440px] rounded-[var(--radius-panel)] border border-border/80 bg-surface/90 p-8 shadow-card-hover backdrop-blur-2xl sm:p-10">
        <div className="mb-8 space-y-2 text-center">
          <h2 className="text-2xl font-[600] tracking-tight text-text">{title}</h2>
          {description ? <p className="text-[14px] text-text-muted">{description}</p> : null}
        </div>

        {notice ? (
          <div className="mb-6 rounded-[var(--radius-control)] border border-border/80 bg-surface px-4 py-3 text-[13px] leading-relaxed text-text-muted shadow-sm">
            {notice}
          </div>
        ) : null}

        <div className="space-y-6">{children}</div>

        {footer ? (
          <div className="mt-8 border-t border-border/40 pt-6 text-center text-[13.5px] text-text-muted">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
