import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ChaptersListingSection } from '@/features/chapters/pages/ChaptersListingSection'
import type { Chapter } from '@/shared/api/types'

const baseChapter: Chapter = {
  id: 1,
  projectId: 7,
  chapterNumber: 1,
  title: '第一章',
  content: '内容',
  wordCount: 1200,
  status: 'REVIEW',
  createdAt: '2026-03-20',
  updatedAt: '2026-03-20',
}

describe('ChaptersListingSection', () => {
  it('asks for confirmation before publishing a chapter', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const onApprove = vi.fn()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChaptersListingSection
            items={[baseChapter]}
            loading={false}
            onApprove={onApprove}
            onDelete={vi.fn()}
            onEdit={vi.fn()}
            projectId={7}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await user.click(screen.getAllByRole('button', { name: '审核发布' })[0])

    expect(onApprove).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: '确认审核发布该章节吗？' })).toBeInTheDocument()
  })
})
