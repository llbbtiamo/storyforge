import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { DataTable } from '@/shared/ui/patterns/DataTable'

describe('DataTable mobile details', () => {
  it('exposes a clearer details affordance on mobile cards', async () => {
    const user = userEvent.setup()

    render(
      <DataTable
        columns={[{ key: 'name', header: '名称', render: (row: { id: number; name: string }) => row.name }]}
        data={[{ id: 1, name: '条目一' }]}
        detailsLabel="查看详情"
        emptyDescription="空"
        emptyTitle="空"
        renderDetails={() => <div>更多内容</div>}
        rowKey="id"
      />,
    )

    expect(screen.getAllByText('查看详情')[0]).toBeInTheDocument()
    await user.click(screen.getAllByText('查看详情')[0])
    expect(screen.getByText('更多内容')).toBeInTheDocument()
  })
})
