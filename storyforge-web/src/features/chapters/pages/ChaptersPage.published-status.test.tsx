import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ChaptersPage } from '@/features/chapters/pages/ChaptersPage'
import { MessageContext } from '@/shared/ui/message-context'

const listChaptersMock = vi.fn()
const listOutlinesMock = vi.fn().mockResolvedValue([])
const updateChapterMock = vi.fn().mockResolvedValue(undefined)

vi.mock('@/shared/api/services', () => ({
  chaptersApi: {
    list: (...args: unknown[]) => listChaptersMock(...args),
    create: vi.fn(),
    update: (...args: unknown[]) => updateChapterMock(...args),
    approve: vi.fn(),
    remove: vi.fn(),
  },
  outlinesApi: {
    list: (...args: unknown[]) => listOutlinesMock(...args),
  },
}))

describe('ChaptersPage published status', () => {
  it('requires an explicit status change before editing a published chapter', async () => {
    const user = userEvent.setup()
    const errorMock = vi.fn()
    listChaptersMock.mockResolvedValue([
      {
        id: 1,
        projectId: 7,
        chapterNumber: 1,
        title: '已发布章节',
        content: '内容',
        wordCount: 1200,
        status: 'PUBLISHED',
        createdAt: '2026-03-20',
        updatedAt: '2026-03-20',
      },
    ])

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <MessageContext.Provider value={{ success: vi.fn(), error: errorMock, info: vi.fn() }}>
          <MemoryRouter initialEntries={['/projects/7/chapters']}>
            <Routes>
              <Route element={<ChaptersPage />} path="/projects/:projectId/chapters" />
            </Routes>
          </MemoryRouter>
        </MessageContext.Provider>
      </QueryClientProvider>,
    )

    expect((await screen.findAllByRole('button', { name: '编辑' })).length).toBeGreaterThan(0)

    await user.click(screen.getAllByRole('button', { name: '编辑' })[0])

    const statusSelect = screen.getByLabelText('状态')
    expect(statusSelect).toHaveValue('')

    await user.clear(screen.getByLabelText('标题'))
    await user.type(screen.getByLabelText('标题'), '已发布章节（修订中）')
    await user.click(screen.getByRole('button', { name: '保存章节' }))

    expect(updateChapterMock).not.toHaveBeenCalled()
    expect(errorMock).toHaveBeenCalledWith('已发布章节编辑前请明确选择新的状态')
  })
})
