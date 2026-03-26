import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ProjectEditorModal } from '@/features/projects/pages/ProjectEditorModal'

describe('ProjectEditorModal submit lock', () => {
  it('disables the cancel button while a save is in progress', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(
      <ProjectEditorModal onCancel={onCancel} onSubmit={vi.fn()} open project={null} submitting templateOptions={[]} />,
    )

    const cancelButton = screen.getByRole('button', { name: '取消' })
    expect(cancelButton).toBeDisabled()

    await user.click(cancelButton)

    expect(onCancel).not.toHaveBeenCalled()
  })
})
