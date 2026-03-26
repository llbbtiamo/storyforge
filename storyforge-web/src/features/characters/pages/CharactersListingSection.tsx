import { useMemo, useState } from 'react'

import { JsonPreview } from '@/shared/ui/JsonPreview'
import type { Character } from '@/shared/api/types'
import { Button } from '@/shared/ui/primitives/Button'
import { ConfirmDialog } from '@/shared/ui/patterns/ConfirmDialog'
import { DataTable } from '@/shared/ui/patterns/DataTable'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { Toolbar } from '@/shared/ui/patterns/Toolbar'

export function CharactersListingSection({
  items,
  loading,
  onEdit,
  onDelete,
}: {
  items: Character[]
  loading: boolean
  onEdit: (item: Character) => void
  onDelete: (id: number) => void
}) {
  const [pendingDeleteItem, setPendingDeleteItem] = useState<Character | null>(null)

  const columns = useMemo(
    () => [
      { key: 'name', header: '角色名', render: (item: Character) => item.name },
      { key: 'roleType', header: '定位', render: (item: Character) => item.roleType || '-' },
      { key: 'motivation', header: '动机', render: (item: Character) => item.motivation || '-' },
      { key: 'sortOrder', header: '排序', render: (item: Character) => item.sortOrder },
      {
        key: 'actions',
        header: '操作',
        render: (item: Character) => (
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
          detailsLabel="查看基础信息 JSON"
          emptyDescription="当前项目还没有角色。"
          emptyTitle="暂无角色"
          renderDetails={(item) => <JsonPreview title="basicInfo" value={item.basicInfo} />}
          rowKey="id"
        />
        {loading && items.length ? <div className="pt-4 text-sm text-text-muted">正在刷新角色列表…</div> : null}
      </SectionCard>

      <ConfirmDialog
        confirmLabel="删除角色"
        description={pendingDeleteItem ? `确认删除角色「${pendingDeleteItem.name}」吗？` : undefined}
        onCancel={() => setPendingDeleteItem(null)}
        onConfirm={() => {
          if (!pendingDeleteItem) {
            return
          }
          onDelete(pendingDeleteItem.id)
          setPendingDeleteItem(null)
        }}
        open={Boolean(pendingDeleteItem)}
        title="确认删除该角色吗？"
      />
    </>
  )
}
