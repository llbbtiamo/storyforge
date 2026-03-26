import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { OutlinesPage } from '@/features/outlines/pages/OutlinesPage'
import { MessageContext } from '@/shared/ui/message-context'

const listOutlinesMock = vi.fn()

vi.mock('@/shared/api/services', () => ({
  outlinesApi: {
    list: (...args: unknown[]) => listOutlinesMock(...args),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

describe('OutlinesPage truthfulness', () => {
  it('shows an error state instead of an empty state when the initial outlines request fails', async () => {
    listOutlinesMock.mockRejectedValueOnce(new Error('剧情节点加载失败'))

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <MessageContext.Provider value={{ success: vi.fn(), error: vi.fn(), info: vi.fn() }}>
          <MemoryRouter initialEntries={['/projects/7/outlines']}>
            <Routes>
              <Route element={<OutlinesPage />} path="/projects/:projectId/outlines" />
            </Routes>
          </MemoryRouter>
        </MessageContext.Provider>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('heading', { name: '剧情节点加载失败' })).toBeInTheDocument()
    expect(screen.getByText('剧情节点加载失败', { selector: 'p' })).toBeInTheDocument()
  })
})
