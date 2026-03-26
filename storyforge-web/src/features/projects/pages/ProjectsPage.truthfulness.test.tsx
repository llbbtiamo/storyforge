import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ProjectsPage } from '@/features/projects/pages/ProjectsPage'
import { MessageContext } from '@/shared/ui/message-context'

const listProjectsMock = vi.fn()
const listTemplatesMock = vi.fn().mockResolvedValue([])

vi.mock('@/shared/api/services', () => ({
  projectsApi: {
    list: (...args: unknown[]) => listProjectsMock(...args),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
  worldTemplatesApi: {
    list: (...args: unknown[]) => listTemplatesMock(...args),
  },
}))

describe('ProjectsPage truthfulness', () => {
  it('shows an error state instead of an empty list when the initial projects request fails', async () => {
    listProjectsMock.mockRejectedValueOnce(new Error('项目列表加载失败'))

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <MessageContext.Provider value={{ success: vi.fn(), error: vi.fn(), info: vi.fn() }}>
          <MemoryRouter>
            <ProjectsPage />
          </MemoryRouter>
        </MessageContext.Provider>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('heading', { name: '项目列表加载失败' })).toBeInTheDocument()
    expect(screen.getByText('项目列表加载失败', { selector: 'p' })).toBeInTheDocument()
  })
})
