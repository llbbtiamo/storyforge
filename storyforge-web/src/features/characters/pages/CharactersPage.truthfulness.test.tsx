import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { CharactersPage } from '@/features/characters/pages/CharactersPage'
import { MessageContext } from '@/shared/ui/message-context'

const listCharactersMock = vi.fn()

vi.mock('@/shared/api/services', () => ({
  charactersApi: {
    list: (...args: unknown[]) => listCharactersMock(...args),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

describe('CharactersPage truthfulness', () => {
  it('shows an error state instead of an empty state when the initial characters request fails', async () => {
    listCharactersMock.mockRejectedValueOnce(new Error('角色列表加载失败'))

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <MessageContext.Provider value={{ success: vi.fn(), error: vi.fn(), info: vi.fn() }}>
          <MemoryRouter initialEntries={['/projects/7/characters']}>
            <Routes>
              <Route element={<CharactersPage />} path="/projects/:projectId/characters" />
            </Routes>
          </MemoryRouter>
        </MessageContext.Provider>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('heading', { name: '角色列表加载失败' })).toBeInTheDocument()
    expect(screen.getByText('角色列表加载失败', { selector: 'p' })).toBeInTheDocument()
  })
})
