import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { StyleConstraintPage } from '@/features/style-constraint/pages/StyleConstraintPage'
import { AuthContext } from '@/shared/auth/auth-context'
import { MessageContext } from '@/shared/ui/message-context'

const removeMock = vi.fn().mockResolvedValue(undefined)
const getMock = vi.fn().mockResolvedValue({
  id: 1,
  projectId: 7,
  customRules: {},
  createdAt: '2026-03-20',
  updatedAt: '2026-03-20',
})

vi.mock('@/shared/api/services', () => ({
  styleConstraintApi: {
    get: (...args: unknown[]) => getMock(...args),
    create: vi.fn(),
    update: vi.fn(),
    remove: (...args: unknown[]) => removeMock(...args),
  },
}))

describe('StyleConstraintPage', () => {
  it('requires confirmation before deleting the style constraint', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            user: {
              id: 1,
              username: 'tester',
              email: 'tester@example.com',
              vipLevel: 0,
            },
            loading: false,
            isAuthenticated: true,
            login: vi.fn(),
            logout: vi.fn(),
            refreshMe: vi.fn().mockResolvedValue(undefined),
          }}
        >
          <MessageContext.Provider
            value={{
              success: vi.fn(),
              error: vi.fn(),
              info: vi.fn(),
            }}
          >
            <MemoryRouter initialEntries={['/projects/7/style-constraint']}>
              <Routes>
                <Route element={<StyleConstraintPage />} path="/projects/:projectId/style-constraint" />
              </Routes>
            </MemoryRouter>
          </MessageContext.Provider>
        </AuthContext.Provider>
      </QueryClientProvider>,
    )

    await screen.findByText('删除约束')
    await user.click(screen.getByRole('button', { name: '删除约束' }))

    expect(removeMock).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: '确认删除当前风格约束吗？' })).toBeInTheDocument()
  })
})
