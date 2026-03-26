import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ProjectWorldSettingsPage } from '@/features/world-settings/pages/ProjectWorldSettingsPage'
import { MessageContext } from '@/shared/ui/message-context'

const listWorldSettingsMock = vi.fn()

vi.mock('@/shared/api/services', () => ({
  worldSettingsApi: {
    list: (...args: unknown[]) => listWorldSettingsMock(...args),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

describe('ProjectWorldSettingsPage truthfulness', () => {
  it('shows an error state instead of an empty state when the initial world settings request fails', async () => {
    listWorldSettingsMock.mockRejectedValueOnce(new Error('世界设定加载失败'))

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <MessageContext.Provider value={{ success: vi.fn(), error: vi.fn(), info: vi.fn() }}>
          <MemoryRouter initialEntries={['/projects/7/world-settings']}>
            <Routes>
              <Route element={<ProjectWorldSettingsPage />} path="/projects/:projectId/world-settings" />
            </Routes>
          </MemoryRouter>
        </MessageContext.Provider>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('heading', { name: '世界设定加载失败' })).toBeInTheDocument()
    expect(screen.getByText('世界设定加载失败', { selector: 'p' })).toBeInTheDocument()
  })
})
