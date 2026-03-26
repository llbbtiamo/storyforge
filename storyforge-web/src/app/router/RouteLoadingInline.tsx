import { LoadingState } from '@/shared/ui/patterns/LoadingState'

export function RouteLoadingInline({ label }: { label: string }) {
  return <LoadingState className="min-h-40 rounded-[var(--radius-panel)] border border-border bg-surface shadow-card" label={label} />
}
