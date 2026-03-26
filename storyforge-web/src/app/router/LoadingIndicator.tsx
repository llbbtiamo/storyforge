import { LoadingState } from '@/shared/ui/patterns/LoadingState'

export function LoadingIndicator({ label = '加载中...' }: { label?: string }) {
  return <LoadingState label={label} />
}
