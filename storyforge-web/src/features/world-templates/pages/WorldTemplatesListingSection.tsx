import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'

import type { WorldTemplate } from '@/shared/api/types'
import { Button } from '@/shared/ui/primitives/Button'
import { ConfirmDialog } from '@/shared/ui/patterns/ConfirmDialog'
import { DataTable } from '@/shared/ui/patterns/DataTable'
import { BooleanBadge } from '@/shared/ui/patterns/EntityBadges'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { Toolbar } from '@/shared/ui/patterns/Toolbar'

export function WorldTemplatesListingSection({
  templates,
  loading,
  onEdit,
  onDelete,
}: {
  templates: WorldTemplate[]
  loading: boolean
  onEdit: (template: WorldTemplate) => void
  onDelete: (templateId: number) => void
}) {
  const [pendingDeleteTemplate, setPendingDeleteTemplate] = useState<WorldTemplate | null>(null)

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: '模板名',
        render: (template: WorldTemplate) => (
          <Link className="font-semibold text-primary" to={`/world-templates/${template.id}/overview`}>
            {template.name}
          </Link>
        ),
      },
      {
        key: 'description',
        header: '描述',
        render: (template: WorldTemplate) => template.description || '-',
      },
      {
        key: 'public',
        header: '是否公开',
        render: (template: WorldTemplate) => <BooleanBadge value={template.isPublic} />,
      },
      {
        key: 'updatedAt',
        header: '更新时间',
        render: (template: WorldTemplate) => template.updatedAt,
      },
      {
        key: 'actions',
        header: '操作',
        render: (template: WorldTemplate) => (
          <Toolbar>
            <Button onClick={() => onEdit(template)} size="sm" variant="ghost">
              编辑
            </Button>
            <Link
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] border text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-ring)] disabled:pointer-events-none disabled:opacity-60 border-border-strong bg-white text-text shadow-card hover:bg-surface-subtle h-8 px-3"
              to={`/world-templates/${template.id}/overview`}
            >
              详情
            </Link>
            <Button onClick={() => setPendingDeleteTemplate(template)} size="sm" variant="danger">
              删除
            </Button>
          </Toolbar>
        ),
      },
    ],
    [onEdit],
  )

  return (
    <>
      <SectionCard>
        <DataTable
          columns={columns}
          data={templates}
          emptyDescription="暂时还没有世界模板。"
          emptyTitle="暂无世界模板"
          rowKey="id"
        />
        {loading && templates.length ? <div className="pt-4 text-sm text-text-muted">正在刷新模板列表…</div> : null}
      </SectionCard>

      <ConfirmDialog
        confirmLabel="删除模板"
        description={pendingDeleteTemplate ? `确认删除模板「${pendingDeleteTemplate.name}」吗？` : undefined}
        onCancel={() => setPendingDeleteTemplate(null)}
        onConfirm={() => {
          if (!pendingDeleteTemplate) {
            return
          }
          onDelete(pendingDeleteTemplate.id)
          setPendingDeleteTemplate(null)
        }}
        open={Boolean(pendingDeleteTemplate)}
        title="确认删除该模板吗？"
      />
    </>
  )
}
