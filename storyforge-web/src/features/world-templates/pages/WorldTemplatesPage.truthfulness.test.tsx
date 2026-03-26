import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { WorldTemplatesPage } from '@/features/world-templates/pages/WorldTemplatesPage'
import { MessageContext } from '@/shared/ui/message-context'

const listTemplatesMock = vi.fn()

vi.mock('@/shared/api/services', () => ({
  worldTemplatesApi: {
    list: (...args: unknown[]) => listTemplatesMock(...args),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

describe('WorldTemplatesPage truthfulness', () => {
  it('shows an error state instead of an empty list when the initial templates request fails', async () => {
    listTemplatesMock.mockRejectedValueOnce(new Error('模板列表加载失败'))

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <MessageContext.Provider value={{ success: vi.fn(), error: vi.fn(), info: vi.fn() }}>
          <MemoryRouter>
            <WorldTemplatesPage />
          </MemoryRouter>
        </MessageContext.Provider>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('heading', { name: '模板列表加载失败' })).toBeInTheDocument()
    expect(screen.getByText('模板列表加载失败', { selector: 'p' })).toBeInTheDocument()
  })
})
