import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Project } from '@/shared/api/types'
import { ProjectEditorModal } from '@/features/projects/pages/ProjectEditorModal'

const projectA: Project = {
  id: 1,
  title: '旧项目',
  description: '旧描述',
  genre: '奇幻',
  status: 'DRAFT',
  wordCount: 1200,
  worldTemplateId: 3,
  coverUrl: 'https://example.com/a.png',
  createdAt: '2026-03-20T00:00:00',
  updatedAt: '2026-03-20T00:00:00',
}

const projectB: Project = {
  id: 2,
  title: '新项目',
  description: '新描述',
  genre: '科幻',
  status: 'COMPLETED',
  wordCount: 2400,
  worldTemplateId: 4,
  coverUrl: 'https://example.com/b.png',
  createdAt: '2026-03-21T00:00:00',
  updatedAt: '2026-03-21T00:00:00',
}

describe('ProjectEditorModal', () => {
  it('refreshes form values when switching to a different project', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const { rerender } = render(
      <ProjectEditorModal
        onCancel={() => undefined}
        onSubmit={onSubmit}
        open
        project={projectA}
        submitting={false}
        templateOptions={[]}
      />,
    )

    await user.clear(screen.getByLabelText('标题'))
    await user.type(screen.getByLabelText('标题'), '临时修改')

    rerender(
      <ProjectEditorModal
        onCancel={() => undefined}
        onSubmit={onSubmit}
        open
        project={projectB}
        submitting={false}
        templateOptions={[]}
      />,
    )

    expect(screen.getByLabelText('标题')).toHaveValue('新项目')
    expect(screen.getByLabelText('描述')).toHaveValue('新描述')
  })

  it('resets to empty defaults when reopened for create mode', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const { rerender } = render(
      <ProjectEditorModal
        onCancel={() => undefined}
        onSubmit={onSubmit}
        open
        project={projectA}
        submitting={false}
        templateOptions={[]}
      />,
    )

    await user.clear(screen.getByLabelText('标题'))
    await user.type(screen.getByLabelText('标题'), '仍然脏的值')

    rerender(
      <ProjectEditorModal
        onCancel={() => undefined}
        onSubmit={onSubmit}
        open={false}
        project={null}
        submitting={false}
        templateOptions={[]}
      />,
    )

    rerender(
      <ProjectEditorModal
        onCancel={() => undefined}
        onSubmit={onSubmit}
        open
        project={null}
        submitting={false}
        templateOptions={[]}
      />,
    )

    expect(screen.getByLabelText('标题')).toHaveValue('')
    expect(screen.getByLabelText('描述')).toHaveValue('')
  })
})
