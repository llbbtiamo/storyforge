import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { WorldTemplate } from '@/shared/api/types'
import { WorldTemplateEditorModal } from '@/features/world-templates/pages/WorldTemplateEditorModal'

const templateA: WorldTemplate = {
  id: 1,
  name: '模板 A',
  description: '描述 A',
  isPublic: false,
  createdAt: '2026-03-20T00:00:00',
  updatedAt: '2026-03-20T00:00:00',
}

const templateB: WorldTemplate = {
  id: 2,
  name: '模板 B',
  description: '描述 B',
  isPublic: true,
  createdAt: '2026-03-21T00:00:00',
  updatedAt: '2026-03-21T00:00:00',
}

describe('WorldTemplateEditorModal', () => {
  it('refreshes form values when switching templates', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const { rerender } = render(
      <WorldTemplateEditorModal
        onCancel={() => undefined}
        onSubmit={onSubmit}
        open
        submitting={false}
        template={templateA}
      />,
    )

    await user.clear(screen.getByLabelText('模板名称'))
    await user.type(screen.getByLabelText('模板名称'), '脏值')

    rerender(
      <WorldTemplateEditorModal
        onCancel={() => undefined}
        onSubmit={onSubmit}
        open
        submitting={false}
        template={templateB}
      />,
    )

    expect(screen.getByLabelText('模板名称')).toHaveValue('模板 B')
    expect(screen.getByLabelText('模板描述')).toHaveValue('描述 B')
  })

  it('clears values when reopened for create mode', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const { rerender } = render(
      <WorldTemplateEditorModal
        onCancel={() => undefined}
        onSubmit={onSubmit}
        open
        submitting={false}
        template={templateA}
      />,
    )

    await user.clear(screen.getByLabelText('模板名称'))
    await user.type(screen.getByLabelText('模板名称'), '脏值')

    rerender(
      <WorldTemplateEditorModal
        onCancel={() => undefined}
        onSubmit={onSubmit}
        open={false}
        submitting={false}
        template={null}
      />,
    )

    rerender(
      <WorldTemplateEditorModal
        onCancel={() => undefined}
        onSubmit={onSubmit}
        open
        submitting={false}
        template={null}
      />,
    )

    expect(screen.getByLabelText('模板名称')).toHaveValue('')
    expect(screen.getByLabelText('模板描述')).toHaveValue('')
  })
})
