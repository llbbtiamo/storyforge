import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { DataTable } from '@/shared/ui/patterns/DataTable'

describe('DataTable surface ownership', () => {
  it('does not render an extra bordered card shell around desktop tables', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DataTable
            columns={[{ key: 'name', header: '名称', render: (row: { id: number; name: string }) => row.name }]}
            data={[{ id: 1, name: '条目一' }]}
            emptyDescription="空"
            emptyTitle="空"
            rowKey="id"
          />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(container.querySelector('table')).toBeInTheDocument()
    expect(container.querySelectorAll('.shadow-card').length).toBeLessThanOrEqual(1)
  })
})
