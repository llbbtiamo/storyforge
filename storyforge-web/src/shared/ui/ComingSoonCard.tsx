import { Button } from '@/shared/ui/primitives/Button'
import { Badge } from '@/shared/ui/primitives/Badge'
import { PageHeader } from '@/shared/ui/patterns/PageHeader'
import { PageShell } from '@/shared/ui/patterns/PageShell'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'

export function ComingSoonCard({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <PageShell>
      <SectionCard>
        <PageHeader
          description={description}
          eyebrow="Not in scope"
          title={title}
        />
      </SectionCard>

      <SectionCard className="space-y-5">
        <div className="rounded-[var(--radius-panel)] border border-primary/10 bg-primary-soft p-5">
          <div className="mb-3">
            <Badge tone="primary">当前版本聚焦已落地后端能力</Badge>
          </div>
          <p className="text-sm leading-7 text-text-muted">
            AI 章节生成、找回密码、上传文件、模板市场与章节版本恢复未纳入本轮 MVP。
          </p>
        </div>

        {actionLabel && onAction ? (
          <div>
            <Button onClick={onAction}>{actionLabel}</Button>
          </div>
        ) : null}

        <p className="text-sm leading-7 text-text-muted">可以继续使用左侧导航体验已打通的完整前后端流程。</p>
      </SectionCard>
    </PageShell>
  )
}
