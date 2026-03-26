import { useMemo, useState } from 'react'

import { JsonPreview } from '@/shared/ui/JsonPreview'
import type { WorldSetting } from '@/shared/api/types'
import { Button } from '@/shared/ui/primitives/Button'
import { ConfirmDialog } from '@/shared/ui/patterns/ConfirmDialog'
import { DataTable } from '@/shared/ui/patterns/DataTable'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { Toolbar } from '@/shared/ui/patterns/Toolbar'

export function TemplateWorldSettingsListingSection({
  items,
  loading,
  onEdit,
  onDelete,
}: {
  items: WorldSetting[]
  loading: boolean
  onEdit: (item: WorldSetting) => void
  onDelete: (id: number) => void
}) {
  const [pendingDeleteItem, setPendingDeleteItem] = useState<WorldSetting | null>(null)

  const columns = useMemo(
    () => [
      { key: 'category', header: '分类', render: (item: WorldSetting) => item.category },
      { key: 'name', header: '名称', render: (item: WorldSetting) => item.name },
      { key: 'sortOrder', header: '排序', render: (item: WorldSetting) => item.sortOrder },
      { key: 'updatedAt', header: '更新时间', render: (item: WorldSetting) => item.updatedAt },
      {
        key: 'actions',
        header: '操作',
        render: (item: WorldSetting) => (
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
          detailsLabel="查看 JSON 内容"
          emptyDescription="当前模板还没有世界设定。"
          emptyTitle="暂无模板设定"
          renderDetails={(item) => <JsonPreview title="content" value={item.content} />}
          rowKey="id"
        />
        {loading && items.length ? <div className="pt-4 text-sm text-text-muted">正在刷新模板设定列表…</div> : null}
      </SectionCard>

      <ConfirmDialog
        confirmLabel="删除设定"
        description={pendingDeleteItem ? `确认删除设定「${pendingDeleteItem.name}」吗？` : undefined}
        onCancel={() => setPendingDeleteItem(null)}
        onConfirm={() => {
          if (!pendingDeleteItem) {
            return
          }
          onDelete(pendingDeleteItem.id)
          setPendingDeleteItem(null)
        }}
        open={Boolean(pendingDeleteItem)}
        title="确认删除该设定吗？"
      />
    </>
  )
}
