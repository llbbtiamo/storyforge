import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { Chapter } from '@/shared/api/types'
import { Button } from '@/shared/ui/primitives/Button'
import { ConfirmDialog } from '@/shared/ui/patterns/ConfirmDialog'
import { DataTable } from '@/shared/ui/patterns/DataTable'
import { ChapterStatusBadge } from '@/shared/ui/patterns/EntityBadges'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { Toolbar } from '@/shared/ui/patterns/Toolbar'

export function ChaptersListingSection({
  projectId,
  items,
  loading,
  onEdit,
  onApprove,
  onDelete,
}: {
  projectId: number
  items: Chapter[]
  loading: boolean
  onEdit: (item: Chapter) => void
  onApprove: (id: number) => void
  onDelete: (id: number) => void
}) {
  const navigate = useNavigate()
  const [pendingDeleteItem, setPendingDeleteItem] = useState<Chapter | null>(null)
  const [pendingApproveItem, setPendingApproveItem] = useState<Chapter | null>(null)

  const columns = useMemo(
    () => [
      { key: 'chapterNumber', header: '章节号', render: (item: Chapter) => item.chapterNumber },
      { key: 'title', header: '标题', render: (item: Chapter) => item.title || '-' },
      { key: 'status', header: '状态', render: (item: Chapter) => <ChapterStatusBadge status={item.status} /> },
      { key: 'wordCount', header: '字数', render: (item: Chapter) => item.wordCount },
      { key: 'outlineId', header: '大纲节点', render: (item: Chapter) => item.outlineId || '-' },
      {
        key: 'actions',
        header: '操作',
        render: (item: Chapter) => (
          <Toolbar>
            <Button onClick={() => onEdit(item)} size="sm" variant="ghost">
              编辑
            </Button>
            <Button
              disabled={item.status === 'PUBLISHED'}
              onClick={() => setPendingApproveItem(item)}
              size="sm"
              variant="secondary"
            >
              审核发布
            </Button>
            <Button
              onClick={() => navigate(`/projects/${projectId}/chapters/${item.id}/versions`)}
              size="sm"
              variant="secondary"
            >
              版本历史
            </Button>
            <Button onClick={() => setPendingDeleteItem(item)} size="sm" variant="danger">
              删除
            </Button>
          </Toolbar>
        ),
      },
    ],
    [navigate, onEdit, projectId],
  )

  return (
    <>
      <SectionCard>
        <DataTable
          columns={columns}
          data={items}
          emptyDescription="还没有章节。"
          emptyTitle="暂无章节"
          rowKey="id"
        />
        {loading && items.length ? <div className="pt-4 text-sm text-text-muted">正在刷新章节列表…</div> : null}
      </SectionCard>

      <ConfirmDialog
        confirmLabel="发布章节"
        description={
          pendingApproveItem
            ? `确认审核发布「${pendingApproveItem.title || `第 ${pendingApproveItem.chapterNumber} 章`}」吗？该操作会生成版本快照。`
            : undefined
        }
        onCancel={() => setPendingApproveItem(null)}
        onConfirm={() => {
          if (!pendingApproveItem) {
            return
          }
          onApprove(pendingApproveItem.id)
          setPendingApproveItem(null)
        }}
        open={Boolean(pendingApproveItem)}
        title="确认审核发布该章节吗？"
        tone="primary"
      />

      <ConfirmDialog
        confirmLabel="删除章节"
        description={pendingDeleteItem ? `确认删除章节「${pendingDeleteItem.title || `第 ${pendingDeleteItem.chapterNumber} 章`}」吗？` : undefined}
        onCancel={() => setPendingDeleteItem(null)}
        onConfirm={() => {
          if (!pendingDeleteItem) {
            return
          }
          onDelete(pendingDeleteItem.id)
          setPendingDeleteItem(null)
        }}
        open={Boolean(pendingDeleteItem)}
        title="确认删除该章节吗？"
      />
    </>
  )
}
