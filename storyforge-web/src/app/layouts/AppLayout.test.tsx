import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { AppLayout } from '@/app/layouts/AppLayout'
import type { AuthContextValue } from '@/shared/auth/auth-context'
import { AuthContext } from '@/shared/auth/auth-context'

vi.mock('@/shared/api/services', () => ({
  projectsApi: {
    list: vi.fn().mockResolvedValue([]),
  },
}))

function renderLayout(pathname: string, authOverrides: Partial<AuthContextValue> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  const authValue: AuthContextValue = {
    user: {
      id: 1,
      username: 'tester',
      nickname: '测试用户',
      email: 'tester@example.com',
      vipLevel: 0,
    },
    loading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    refreshMe: vi.fn().mockResolvedValue(undefined),
    ...authOverrides,
  }

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[pathname]}>
          <Routes>
            <Route element={<AppLayout />} path="/projects/:projectId/chapters/:chapterId/versions" />
            <Route element={<AppLayout />} path="/projects/:projectId/overview" />
            <Route element={<AppLayout />} path="/world-templates" />
            <Route element={<AppLayout />} path="/me" />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

describe('AppLayout', () => {
  it('highlights the chapters project nav item for chapter version routes', async () => {
    renderLayout('/projects/42/chapters/7/versions')

    expect(await screen.findByRole('link', { name: '章节' })).toHaveClass('bg-surface-sunken')
  })

  it('treats nested project routes as active for the projects primary navigation', async () => {
    renderLayout('/projects/42/overview')

    expect(await screen.findByRole('link', { name: '项目工作台' })).toHaveClass('bg-surface-sunken')
  })

  it('shows the loading page while auth state is loading', () => {
    renderLayout('/me', { loading: true })

    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })
})
