import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { AppLayout } from '@/app/layouts/AppLayout'
import { AuthContext } from '@/shared/auth/auth-context'

const listProjectsMock = vi.fn().mockResolvedValue([])

vi.mock('@/shared/api/services', () => ({
  projectsApi: {
    list: (...args: unknown[]) => listProjectsMock(...args),
  },
}))

describe('AppLayout project loading', () => {
  it('does not fetch the projects list just to render non-project routes in the shell', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
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
          <MemoryRouter initialEntries={['/me']}>
            <AppLayout />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>,
    )

    expect(listProjectsMock).not.toHaveBeenCalled()
    expect(screen.getByText('我的账户')).toBeInTheDocument()
  })
})
