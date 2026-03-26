import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ChaptersPage } from '@/features/chapters/pages/ChaptersPage'
import { MessageContext } from '@/shared/ui/message-context'

const listChaptersMock = vi.fn()
const listOutlinesMock = vi.fn().mockResolvedValue([])

vi.mock('@/shared/api/services', () => ({
  chaptersApi: {
    list: (...args: unknown[]) => listChaptersMock(...args),
    create: vi.fn(),
    update: vi.fn(),
    approve: vi.fn(),
    remove: vi.fn(),
  },
  outlinesApi: {
    list: (...args: unknown[]) => listOutlinesMock(...args),
  },
}))

describe('ChaptersPage truthfulness', () => {
  it('shows an error state instead of an empty state when the initial chapters request fails', async () => {
    listChaptersMock.mockRejectedValueOnce(new Error('章节列表加载失败'))

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <MessageContext.Provider value={{ success: vi.fn(), error: vi.fn(), info: vi.fn() }}>
          <MemoryRouter initialEntries={['/projects/7/chapters']}>
            <Routes>
              <Route element={<ChaptersPage />} path="/projects/:projectId/chapters" />
            </Routes>
          </MemoryRouter>
        </MessageContext.Provider>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('heading', { name: '章节列表加载失败' })).toBeInTheDocument()
    expect(screen.getByText('章节列表加载失败', { selector: 'p' })).toBeInTheDocument()
  })
})
