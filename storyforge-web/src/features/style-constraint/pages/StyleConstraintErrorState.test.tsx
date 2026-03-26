import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { StyleConstraintPage } from '@/features/style-constraint/pages/StyleConstraintPage'
import { AuthContext } from '@/shared/auth/auth-context'
import { MessageContext } from '@/shared/ui/message-context'

const getMock = vi.fn()

vi.mock('@/shared/api/services', () => ({
  styleConstraintApi: {
    get: (...args: unknown[]) => getMock(...args),
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
      <AuthContext.Provider
        value={{
          user: { id: 1, username: 'tester', email: 'tester@example.com', vipLevel: 0 },
          loading: false,
          isAuthenticated: true,
          login: vi.fn(),
          logout: vi.fn(),
          refreshMe: vi.fn().mockResolvedValue(undefined),
        }}
      >
        <MessageContext.Provider value={{ success: vi.fn(), error: vi.fn(), info: vi.fn() }}>
          <MemoryRouter initialEntries={['/projects/7/style-constraint']}>
            <Routes>
              <Route element={<StyleConstraintPage />} path="/projects/:projectId/style-constraint" />
            </Routes>
          </MemoryRouter>
        </MessageContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

describe('StyleConstraintPage', () => {
  it('shows an error state for non-404 failures instead of the empty singleton state', async () => {
    getMock.mockRejectedValueOnce(Object.assign(new Error('服务不可用'), { status: 500 }))

    renderPage()

    expect(await screen.findByRole('heading', { name: '风格约束加载失败' })).toBeInTheDocument()
    expect(screen.getByText('服务不可用')).toBeInTheDocument()
  })
})
