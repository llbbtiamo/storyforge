import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { AppLayout } from '@/app/layouts/AppLayout'
import { AuthContext } from '@/shared/auth/auth-context'

vi.mock('@/shared/api/services', () => ({
  projectsApi: {
    list: vi.fn().mockResolvedValue([]),
  },
}))

describe('AppLayout mobile navigation', () => {
  it('exposes an explicit close button when the mobile drawer is open', async () => {
    const user = userEvent.setup()

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
          <MemoryRouter initialEntries={['/projects']}>
            <AppLayout />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole('button', { name: '菜单' }))

    expect(screen.getByRole('button', { name: '关闭导航' })).toBeInTheDocument()
  })
})
