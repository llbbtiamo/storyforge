import { useMemo, useState } from 'react'

import type { CharacterRelation } from '@/shared/api/types'
import { Button } from '@/shared/ui/primitives/Button'
import { ConfirmDialog } from '@/shared/ui/patterns/ConfirmDialog'
import { DataTable } from '@/shared/ui/patterns/DataTable'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { Toolbar } from '@/shared/ui/patterns/Toolbar'

export function CharacterRelationsListingSection({
  items,
  loading,
  characterMap,
  onEdit,
  onDelete,
}: {
  items: CharacterRelation[]
  loading: boolean
  characterMap: Map<number, string>
  onEdit: (item: CharacterRelation) => void
  onDelete: (id: number) => void
}) {
  const [pendingDeleteItem, setPendingDeleteItem] = useState<CharacterRelation | null>(null)

  const columns = useMemo(
    () => [
      {
        key: 'a',
        header: '角色 A',
        render: (item: CharacterRelation) => characterMap.get(item.characterIdA) || item.characterIdA,
      },
      {
        key: 'b',
        header: '角色 B',
        render: (item: CharacterRelation) => characterMap.get(item.characterIdB) || item.characterIdB,
      },
      {
        key: 'relationType',
        header: '关系',
        render: (item: CharacterRelation) => item.relationType,
      },
      {
        key: 'description',
        header: '描述',
        render: (item: CharacterRelation) => item.description || '-',
      },
      {
        key: 'actions',
        header: '操作',
        render: (item: CharacterRelation) => (
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
    [characterMap, onEdit],
  )

  return (
    <>
      <SectionCard>
        <DataTable
          columns={columns}
          data={items}
          emptyDescription="先创建角色，再建立人物关系。"
          emptyTitle="暂无角色关系"
          rowKey="id"
        />
        {loading && items.length ? <div className="pt-4 text-sm text-text-muted">正在刷新角色关系列表…</div> : null}
      </SectionCard>

      <ConfirmDialog
        confirmLabel="删除关系"
        description={pendingDeleteItem ? `确认删除关系「${pendingDeleteItem.relationType}」吗？` : undefined}
        onCancel={() => setPendingDeleteItem(null)}
        onConfirm={() => {
          if (!pendingDeleteItem) {
            return
          }
          onDelete(pendingDeleteItem.id)
          setPendingDeleteItem(null)
        }}
        open={Boolean(pendingDeleteItem)}
        title="确认删除该关系吗？"
      />
    </>
  )
}
