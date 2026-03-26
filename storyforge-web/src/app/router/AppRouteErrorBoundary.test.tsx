import type { ReactElement } from 'react'

import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { AppRouteErrorBoundary } from '@/app/router/AppRouteErrorBoundary'

function ThrowingRoute(): ReactElement {
  throw new Error('非法路由参数')
}

describe('AppRouteErrorBoundary', () => {
  it('renders branded recovery UI for route errors', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/projects/:projectId/overview',
          element: <ThrowingRoute />,
          errorElement: <AppRouteErrorBoundary />,
        },
      ],
      { initialEntries: ['/projects/not-a-number/overview'] },
    )

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: '页面加载失败' })).toBeInTheDocument()
    expect(screen.getByText('非法路由参数')).toBeInTheDocument()
  })
})
