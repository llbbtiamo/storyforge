import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { StyleConstraintPage } from '@/features/style-constraint/pages/StyleConstraintPage'
import type { StyleConstraint } from '@/shared/api/types'
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

describe('StyleConstraintPage late data protection', () => {
  it('does not overwrite user edits when query data arrives after typing starts', async () => {
    const user = userEvent.setup()

    let resolveGet: ((value: StyleConstraint) => void) | undefined

    getMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveGet = resolve
        }),
    )

    renderPage()

    const narrativeVoiceInput = await screen.findByLabelText('叙事视角')
    await user.type(narrativeVoiceInput, '我自己的输入')

    resolveGet?.({
      id: 1,
      projectId: 7,
      narrativeVoice: '服务端返回值',
      customRules: {},
      createdAt: '2026-03-20',
      updatedAt: '2026-03-20',
    })

    expect(await screen.findByLabelText('叙事视角')).toHaveValue('我自己的输入')
  })
})
