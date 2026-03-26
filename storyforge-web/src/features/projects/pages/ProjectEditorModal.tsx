import type { Project, ProjectPayload, ProjectStatus } from '@/shared/api/types'
import { Button } from '@/shared/ui/primitives/Button'
import { Dialog } from '@/shared/ui/primitives/Dialog'
import { Input } from '@/shared/ui/primitives/Input'
import { Select } from '@/shared/ui/primitives/Select'
import { Textarea } from '@/shared/ui/primitives/Textarea'
import { FormField } from '@/shared/ui/patterns/FormField'

const statusOptions: { label: string; value: ProjectStatus }[] = [
  { label: '草稿', value: 'DRAFT' },
  { label: '创作中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'COMPLETED' },
]

function getInitialValues(project: Project | null) {
  return {
    title: project?.title ?? '',
    description: project?.description ?? '',
    genre: project?.genre ?? '',
    status: project?.status ?? 'DRAFT',
    worldTemplateId: project?.worldTemplateId ? String(project.worldTemplateId) : '',
    coverUrl: project?.coverUrl ?? '',
  } satisfies {
    title: string
    description: string
    genre: string
    status: ProjectStatus
    worldTemplateId: string
    coverUrl: string
  }
}

export function ProjectEditorModal({
  open,
  project,
  templateOptions,
  submitting,
  onCancel,
  onSubmit,
}: {
  open: boolean
  project: Project | null
  templateOptions: Array<{ label: string; value: number }>
  submitting: boolean
  onCancel: () => void
  onSubmit: (payload: ProjectPayload) => void
}) {
  const initialValues = getInitialValues(project)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('title') ?? '').trim()
    if (!title) {
      return
    }

    const description = String(formData.get('description') ?? '').trim()
    const genre = String(formData.get('genre') ?? '').trim()
    const status = String(formData.get('status') ?? initialValues.status) as ProjectStatus
    const worldTemplateId = String(formData.get('worldTemplateId') ?? '')
    const coverUrl = String(formData.get('coverUrl') ?? '').trim()

    onSubmit({
      title,
      description: description || undefined,
      genre: genre || undefined,
      status,
      worldTemplateId: worldTemplateId ? Number(worldTemplateId) : undefined,
      coverUrl: coverUrl || undefined,
    })
  }

  return (
    <Dialog
      description="维护项目基础信息，可选指定模板作为初始化来源。"
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <Button disabled={submitting} onClick={onCancel} variant="secondary">
            取消
          </Button>
          <Button form="project-editor-form" loading={submitting} type="submit" variant="primary">
            保存项目
          </Button>
        </div>
      }
      onClose={onCancel}
      open={open}
      dismissible={!submitting}
      title={project ? '编辑项目' : '新建项目'}
    >
      <form className="space-y-5" id="project-editor-form" key={project?.id ?? 'new'} onSubmit={handleSubmit}>
        <FormField label="标题">
          <Input defaultValue={initialValues.title} maxLength={200} name="title" placeholder="请输入项目标题" required />
        </FormField>

        <FormField label="描述">
          <Textarea className="min-h-28" defaultValue={initialValues.description} name="description" placeholder="可选描述" />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="题材">
            <Input
              defaultValue={initialValues.genre}
              maxLength={50}
              name="genre"
              placeholder="例如：奇幻 / 科幻 / 悬疑"
            />
          </FormField>

          <FormField label="状态">
            <Select defaultValue={initialValues.status} name="status">
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="关联模板">
          <Select defaultValue={initialValues.worldTemplateId} name="worldTemplateId">
            <option value="">可选：创建后自动应用模板</option>
            {templateOptions.map((option) => (
              <option key={option.value} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="封面 URL">
          <Input defaultValue={initialValues.coverUrl} maxLength={500} name="coverUrl" placeholder="可选封面地址" />
        </FormField>
      </form>
    </Dialog>
  )
}
