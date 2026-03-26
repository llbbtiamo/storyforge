import { Card } from '@/shared/ui/primitives/Card'

export function JsonPreview({ title, value }: { title: string; value: unknown }) {
  return (
    <Card className="space-y-3 bg-surface-subtle shadow-none">
      <div className="space-y-1">
        <div className="text-sm font-semibold text-text">{title}</div>
        <p className="text-xs text-text-subtle">结构化字段预览</p>
      </div>
      <pre className="overflow-x-auto rounded-[var(--radius-control)] border border-border bg-white p-4 text-sm leading-6 text-text">
        {JSON.stringify(value ?? {}, null, 2)}
      </pre>
    </Card>
  )
}
