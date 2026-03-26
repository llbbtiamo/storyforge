import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { WorldTemplateOverviewPage } from '@/features/world-templates/pages/WorldTemplateOverviewPage'

const getTemplateMock = vi.fn()

vi.mock('@/shared/api/services', () => ({
  worldTemplatesApi: {
    get: (...args: unknown[]) => getTemplateMock(...args),
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
      <MemoryRouter initialEntries={['/world-templates/5/overview']}>
        <Routes>
          <Route element={<WorldTemplateOverviewPage />} path="/world-templates/:templateId/overview" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('WorldTemplateOverviewPage', () => {
  it('shows an error state when template loading fails', async () => {
    getTemplateMock.mockRejectedValueOnce(new Error('模板服务异常'))

    renderPage()

    expect(await screen.findByRole('heading', { name: '模板详情加载失败' })).toBeInTheDocument()
    expect(screen.getByText('模板服务异常')).toBeInTheDocument()
  })
})
