import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { CharacterRelationsPage } from '@/features/character-relations/pages/CharacterRelationsPage'
import { MessageContext } from '@/shared/ui/message-context'

const listCharactersMock = vi.fn()
const listRelationsMock = vi.fn()
const createRelationMock = vi.fn().mockResolvedValue(undefined)

vi.mock('@/shared/api/services', () => ({
  charactersApi: {
    list: (...args: unknown[]) => listCharactersMock(...args),
  },
  characterRelationsApi: {
    list: (...args: unknown[]) => listRelationsMock(...args),
    create: (...args: unknown[]) => createRelationMock(...args),
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

describe('CharacterRelationsPage', () => {
  it('blocks self-relations before calling the backend', async () => {
    const user = userEvent.setup()
    listCharactersMock.mockResolvedValue([
      { id: 1, projectId: 7, name: '角色甲', sortOrder: 0, createdAt: '2026-03-20', updatedAt: '2026-03-20' },
    ])
    listRelationsMock.mockResolvedValue([])

    renderPage()

    await user.click(await screen.findByRole('button', { name: '新建关系' }))
    await user.selectOptions(screen.getByLabelText('角色 A'), '1')
    await user.selectOptions(screen.getByLabelText('角色 B'), '1')
    await user.type(screen.getByLabelText('关系类型'), '盟友')
    await user.click(screen.getByRole('button', { name: '创建关系' }))

    expect(createRelationMock).not.toHaveBeenCalled()
    expect(screen.getByText('同一角色不能同时作为关系两端')).toBeInTheDocument()
  })
})
