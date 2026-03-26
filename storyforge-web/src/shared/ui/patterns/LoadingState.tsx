import { cn } from '@/shared/utils/cn'

interface LoadingStateProps {
  label?: string
  className?: string
  fullPage?: boolean
}

export function LoadingState({ label = '加载中...', className, fullPage = false }: LoadingStateProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn(
        'grid justify-items-center gap-3 text-text-muted',
        fullPage ? 'min-h-screen place-items-center' : 'min-h-32 place-items-center',
        className,
      )}
      role="status"
    >
      <span aria-hidden="true" className="size-7 animate-spin rounded-full border-2 border-border-strong border-r-primary" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
