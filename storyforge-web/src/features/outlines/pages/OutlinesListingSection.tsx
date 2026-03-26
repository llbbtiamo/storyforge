import { useMemo, useState } from 'react'

import type { PlotOutline } from '@/shared/api/types'
import { Button } from '@/shared/ui/primitives/Button'
import { ConfirmDialog } from '@/shared/ui/patterns/ConfirmDialog'
import { DataTable } from '@/shared/ui/patterns/DataTable'
import { OutlineLevelBadge } from '@/shared/ui/patterns/EntityBadges'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { Toolbar } from '@/shared/ui/patterns/Toolbar'

export function OutlinesListingSection({
  items,
  loading,
  onEdit,
  onDelete,
}: {
  items: PlotOutline[]
  loading: boolean
  onEdit: (item: PlotOutline) => void
  onDelete: (id: number) => void
}) {
  const [pendingDeleteItem, setPendingDeleteItem] = useState<PlotOutline | null>(null)

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: '标题',
        render: (item: PlotOutline) => (
          <div className="flex flex-wrap items-center gap-2">
            <OutlineLevelBadge level={item.level} />
            <span>{item.title}</span>
          </div>
        ),
      },
      { key: 'parentId', header: '父节点', render: (item: PlotOutline) => item.parentId || '-' },
      { key: 'keyEvents', header: '关键事件', render: (item: PlotOutline) => item.keyEvents?.join(' / ') || '-' },
      { key: 'sortOrder', header: '排序', render: (item: PlotOutline) => item.sortOrder },
      {
        key: 'actions',
        header: '操作',
        render: (item: PlotOutline) => (
          <Toolbar>
            <Button onClick={() => onEdit(item)} size="sm" variant="ghost">
              编辑
            </Button>
            <Button onClick={() => setPendingDeleteItem(item)} size="sm" variant="danger">
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
          data={items}
          emptyDescription="还没有剧情大纲节点。"
          emptyTitle="暂无剧情节点"
          rowKey="id"
        />
        {loading && items.length ? <div className="pt-4 text-sm text-text-muted">正在刷新剧情节点列表…</div> : null}
      </SectionCard>

      <ConfirmDialog
        confirmLabel="删除节点"
        description={pendingDeleteItem ? `确认删除剧情节点「${pendingDeleteItem.title}」吗？` : undefined}
        onCancel={() => setPendingDeleteItem(null)}
        onConfirm={() => {
          if (!pendingDeleteItem) {
            return
          }
          onDelete(pendingDeleteItem.id)
          setPendingDeleteItem(null)
        }}
        open={Boolean(pendingDeleteItem)}
        title="确认删除该剧情节点吗？"
      />
    </>
  )
}
