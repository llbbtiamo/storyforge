import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LoadingState } from '@/shared/ui/patterns/LoadingState'

describe('LoadingState', () => {
  it('announces loading text through a live status region', () => {
    render(<LoadingState label="正在加载章节列表..." />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('status')).toHaveTextContent('正在加载章节列表...')
  })

  it('uses a full-page layout when requested', () => {
    render(<LoadingState fullPage />)

    expect(screen.getByRole('status')).toHaveClass('min-h-screen')
  })
})
