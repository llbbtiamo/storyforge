import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { WorldTemplatesListingSection } from '@/features/world-templates/pages/WorldTemplatesListingSection'
import type { WorldTemplate } from '@/shared/api/types'

const template: WorldTemplate = {
  id: 1,
  name: '模板一',
  description: '模板描述',
  isPublic: false,
  createdAt: '2026-03-20',
  updatedAt: '2026-03-20',
}

describe('WorldTemplatesListingSection', () => {
  it('renders the details action as a direct link instead of nesting a button inside a link', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <WorldTemplatesListingSection
            loading={false}
            onDelete={vi.fn()}
            onEdit={vi.fn()}
            templates={[template]}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    const detailsLink = screen.getAllByRole('link', { name: '详情' })[0]
    expect(detailsLink.tagName).toBe('A')
    expect(detailsLink.querySelector('button')).toBeNull()
  })
})
