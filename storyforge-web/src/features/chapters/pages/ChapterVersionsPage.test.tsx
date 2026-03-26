import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ChapterVersionsPage } from '@/features/chapters/pages/ChapterVersionsPage'

const versionsMock = vi.fn()

vi.mock('@/shared/api/services', () => ({
  chaptersApi: {
    versions: (...args: unknown[]) => versionsMock(...args),
  },
}))

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/projects/7/chapters/9/versions']}>
        <Routes>
          <Route element={<ChapterVersionsPage />} path="/projects/:projectId/chapters/:chapterId/versions" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ChapterVersionsPage', () => {
  it('shows an error state instead of an empty state when version history loading fails', async () => {
    versionsMock.mockRejectedValueOnce(new Error('版本历史加载失败'))

    renderPage()

    expect(await screen.findByRole('heading', { name: '章节版本历史加载失败' })).toBeInTheDocument()
    expect(screen.getByText('版本历史加载失败')).toBeInTheDocument()
  })
})
