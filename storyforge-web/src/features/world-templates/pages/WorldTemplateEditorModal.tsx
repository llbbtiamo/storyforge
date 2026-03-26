import type { WorldTemplate, WorldTemplatePayload } from '@/shared/api/types'
import { Button } from '@/shared/ui/primitives/Button'
import { Dialog } from '@/shared/ui/primitives/Dialog'
import { Input } from '@/shared/ui/primitives/Input'
import { Textarea } from '@/shared/ui/primitives/Textarea'
import { FormField } from '@/shared/ui/patterns/FormField'

function getInitialValues(template: WorldTemplate | null) {
  return {
    name: template?.name ?? '',
    description: template?.description ?? '',
  }
}

export function WorldTemplateEditorModal({
  open,
  template,
  submitting,
  onCancel,
  onSubmit,
}: {
  open: boolean
  template: WorldTemplate | null
  submitting: boolean
  onCancel: () => void
  onSubmit: (payload: WorldTemplatePayload) => void
}) {
  const initialValues = getInitialValues(template)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    if (!name) {
      return
    }

    const description = String(formData.get('description') ?? '').trim()

    onSubmit({
      name,
      description: description || undefined,
    })
  }

  return (
    <Dialog
      description="编辑模板基础信息，保存后即可继续维护模板下的世界设定。"
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <Button disabled={submitting} onClick={onCancel} variant="secondary">
            取消
          </Button>
          <Button form="world-template-editor-form" loading={submitting} type="submit">
            保存模板
          </Button>
        </div>
      }
      onClose={onCancel}
      open={open}
      dismissible={!submitting}
      title={template ? '编辑模板' : '新建模板'}
    >
      <form className="space-y-5" id="world-template-editor-form" key={template?.id ?? 'new'} onSubmit={handleSubmit}>
        <FormField label="模板名称">
          <Input defaultValue={initialValues.name} maxLength={100} name="name" placeholder="请输入模板名称" required />
        </FormField>

        <FormField label="模板描述">
          <Textarea
            className="min-h-32"
            defaultValue={initialValues.description}
            maxLength={500}
            name="description"
            placeholder="可选描述"
          />
        </FormField>
      </form>
    </Dialog>
  )
}
