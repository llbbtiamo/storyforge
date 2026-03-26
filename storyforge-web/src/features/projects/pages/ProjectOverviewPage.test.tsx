import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ProjectOverviewPage } from '@/features/projects/pages/ProjectOverviewPage'
import { MessageContext } from '@/shared/ui/message-context'

const getProjectMock = vi.fn()
const listTemplatesMock = vi.fn()
const applyTemplateMock = vi.fn()
const createTemplateMock = vi.fn()

vi.mock('@/shared/api/services', () => ({
  projectsApi: {
    get: (...args: unknown[]) => getProjectMock(...args),
    applyWorldTemplate: (...args: unknown[]) => applyTemplateMock(...args),
    createWorldTemplate: (...args: unknown[]) => createTemplateMock(...args),
  },
  worldTemplatesApi: {
    list: (...args: unknown[]) => listTemplatesMock(...args),
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
      <MessageContext.Provider value={{ success: vi.fn(), error: vi.fn(), info: vi.fn() }}>
        <MemoryRouter initialEntries={['/projects/7/overview']}>
          <Routes>
            <Route element={<ProjectOverviewPage />} path="/projects/:projectId/overview" />
          </Routes>
        </MemoryRouter>
      </MessageContext.Provider>
    </QueryClientProvider>,
  )
}

describe('ProjectOverviewPage', () => {
  it('shows an error state instead of pretending the project is missing when loading fails', async () => {
    getProjectMock.mockRejectedValueOnce(new Error('服务异常'))
    listTemplatesMock.mockResolvedValue([])

    renderPage()

    expect(await screen.findByRole('heading', { name: '项目详情加载失败' })).toBeInTheDocument()
    expect(screen.getByText('服务异常')).toBeInTheDocument()
  })

  it('shows a dedicated not-found state only when the project request returns 404', async () => {
    getProjectMock.mockRejectedValueOnce(Object.assign(new Error('不存在'), { status: 404 }))
    listTemplatesMock.mockResolvedValue([])

    renderPage()

    expect(await screen.findByText('项目不存在或已被删除。')).toBeInTheDocument()
  })
})
