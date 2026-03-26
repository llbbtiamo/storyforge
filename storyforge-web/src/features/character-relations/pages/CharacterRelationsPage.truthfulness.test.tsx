import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { CharacterRelationsPage } from '@/features/character-relations/pages/CharacterRelationsPage'
import { MessageContext } from '@/shared/ui/message-context'

const listCharactersMock = vi.fn()
const listRelationsMock = vi.fn()

vi.mock('@/shared/api/services', () => ({
  charactersApi: {
    list: (...args: unknown[]) => listCharactersMock(...args),
  },
  characterRelationsApi: {
    list: (...args: unknown[]) => listRelationsMock(...args),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
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
        <MemoryRouter initialEntries={['/projects/7/character-relations']}>
          <Routes>
            <Route element={<CharacterRelationsPage />} path="/projects/:projectId/character-relations" />
          </Routes>
        </MemoryRouter>
      </MessageContext.Provider>
    </QueryClientProvider>,
  )
}

describe('CharacterRelationsPage truthfulness', () => {
  it('shows an error state instead of an empty state when the initial relations request fails', async () => {
    listCharactersMock.mockResolvedValue([
      { id: 1, projectId: 7, name: '角色甲', sortOrder: 0, createdAt: '2026-03-20', updatedAt: '2026-03-20' },
    ])
    listRelationsMock.mockRejectedValueOnce(new Error('角色关系列表加载失败'))

    renderPage()

    expect(await screen.findByRole('heading', { name: '角色关系列表加载失败' })).toBeInTheDocument()
    expect(screen.getByText('角色关系列表加载失败', { selector: 'p' })).toBeInTheDocument()
  })

  it('shows an error state when the initial character options request fails', async () => {
    listCharactersMock.mockRejectedValueOnce(new Error('角色列表加载失败'))
    listRelationsMock.mockResolvedValue([])

    renderPage()

    expect(await screen.findByRole('heading', { name: '角色列表加载失败' })).toBeInTheDocument()
    expect(screen.getByText('角色列表加载失败', { selector: 'p' })).toBeInTheDocument()
  })
})
