import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmDialog } from '@/shared/ui/patterns/ConfirmDialog'

describe('ConfirmDialog', () => {
  it('locks dismissal when confirming is true', () => {
    render(
      <ConfirmDialog
        confirming
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        open
        title="确认删除"
      />,
    )

    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '确认' })).toBeDisabled()
  })
})
