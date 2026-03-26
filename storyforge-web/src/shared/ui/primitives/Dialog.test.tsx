import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Dialog } from '@/shared/ui/primitives/Dialog'

describe('Dialog', () => {
  it('does not close from escape or backdrop when dismissible is false', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Dialog dismissible={false} onClose={onClose} open title="保存中">
        <div>内容</div>
      </Dialog>,
    )

    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()

    await user.click(document.querySelector('.fixed.inset-0') as HTMLElement)
    expect(onClose).not.toHaveBeenCalled()
  })
})
