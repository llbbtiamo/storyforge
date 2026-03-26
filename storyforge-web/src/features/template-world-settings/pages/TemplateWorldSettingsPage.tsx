import { Suspense, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { RouteLoadingInline } from '@/app/router/RouteLoadingInline'
import { TemplateWorldSettingsListingSection } from '@/features/template-world-settings/pages/lazy'
import { templateWorldSettingsApi } from '@/shared/api/services'
import type { WorldSetting, WorldSettingPayload } from '@/shared/api/types'
import { queryKeys } from '@/shared/query/keys'
import { Button } from '@/shared/ui/primitives/Button'
import { Dialog } from '@/shared/ui/primitives/Dialog'
import { Input } from '@/shared/ui/primitives/Input'
import { Textarea } from '@/shared/ui/primitives/Textarea'
import { EmptyState } from '@/shared/ui/patterns/EmptyState'
import { FormField } from '@/shared/ui/patterns/FormField'
import { PageHeader } from '@/shared/ui/patterns/PageHeader'
import { PageShell } from '@/shared/ui/patterns/PageShell'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { useAppMessage } from '@/shared/ui/useAppMessage'
import { getErrorMessage } from '@/shared/utils/error'
import { safeParseJson } from '@/shared/utils/json'
import { useRequiredNumberParam } from '@/shared/utils/router'

interface TemplateWorldSettingFormValues {
  category: string
  name: string
  sortOrder: string
  contentText: string
}

const defaultValues: TemplateWorldSettingFormValues = {
  category: '',
  name: '',
  sortOrder: '0',
  contentText: '{}',
}

function getInitialValues(item: WorldSetting | null): TemplateWorldSettingFormValues {
  if (!item) {
    return defaultValues
  }

  return {
    category: item.category,
    name: item.name,
    sortOrder: String(item.sortOrder ?? 0),
    contentText: JSON.stringify(item.content ?? {}, null, 2),
  }
}

export function TemplateWorldSettingsPage() {
  const templateId = useRequiredNumberParam('templateId')
  const queryClient = useQueryClient()
  const message = useAppMessage()
  const [editingItem, setEditingItem] = useState<WorldSetting | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [contentError, setContentError] = useState<string | null>(null)

  const settingsQuery = useQuery({
    queryKey: queryKeys.templateWorldSettings(templateId),
    queryFn: () => templateWorldSettingsApi.list(templateId),
    retry: false,
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.templateWorldSettings(templateId) })
  }

  const createMutation = useMutation({
    mutationFn: (payload: WorldSettingPayload) => templateWorldSettingsApi.create(templateId, payload),
    onSuccess: async () => {
      message.success('模板世界设定已创建')
      setIsModalOpen(false)
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: WorldSettingPayload }) =>
      templateWorldSettingsApi.update(templateId, id, payload),
    onSuccess: async () => {
      message.success('模板世界设定已更新')
      setIsModalOpen(false)
      setEditingItem(null)
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => templateWorldSettingsApi.remove(templateId, id),
    onSuccess: async () => {
      message.success('模板世界设定已删除')
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  function openCreateModal() {
    setEditingItem(null)
    setContentError(null)
    setIsModalOpen(true)
  }

  function openEditModal(record: WorldSetting) {
    setEditingItem(record)
    setContentError(null)
    setIsModalOpen(true)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const category = String(formData.get('category') ?? '').trim()
    const name = String(formData.get('name') ?? '').trim()
    const sortOrderValue = String(formData.get('sortOrder') ?? '').trim()
    const contentText = String(formData.get('contentText') ?? '').trim()

    if (!category || !name || !contentText) {
      return
    }

    const parsed = safeParseJson(contentText)
    if (!parsed.success) {
      setContentError('设定内容必须是合法 JSON')
      message.error('设定内容必须是合法 JSON')
      return
    }

    setContentError(null)

    const sortOrder = sortOrderValue === '' ? undefined : Number(sortOrderValue)
    const payload: WorldSettingPayload = {
      category,
      name,
      sortOrder: sortOrder !== undefined && Number.isFinite(sortOrder) ? Math.max(0, sortOrder) : undefined,
      content: parsed.data,
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const initialValues = getInitialValues(editingItem)

  return (
    <PageShell>
      <SectionCard>
        <PageHeader
          actions={<Button onClick={openCreateModal}>新建设定</Button>}
          description="与项目世界设定共用相同 DTO，只是挂载在模板维度接口下。"
          eyebrow="Template world settings"
          title="模板世界设定"
        />
      </SectionCard>

      {settingsQuery.isError ? (
        <EmptyState description={getErrorMessage(settingsQuery.error)} title="模板设定加载失败" />
      ) : (
        <Suspense fallback={<RouteLoadingInline label="正在加载模板设定列表..." />}>
          <TemplateWorldSettingsListingSection
            items={settingsQuery.data ?? []}
            loading={settingsQuery.isLoading}
            onDelete={(id) => deleteMutation.mutate(id)}
            onEdit={(record) => openEditModal(record)}
          />
        </Suspense>
      )}

      <Dialog
        description="模板设定页沿用与项目设定一致的 JSON 录入方式。"
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <Button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} variant="secondary">
              取消
            </Button>
            <Button form="template-world-settings-form" loading={isSubmitting} type="submit">
              {editingItem ? '保存设定' : '创建设定'}
            </Button>
          </div>
        }
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        dismissible={!isSubmitting}
        title={editingItem ? '编辑模板世界设定' : '新建模板世界设定'}
      >
        <form
          className="space-y-5"
          id="template-world-settings-form"
          key={editingItem?.id ?? 'new'}
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="分类">
              <Input defaultValue={initialValues.category} maxLength={50} name="category" required />
            </FormField>

            <FormField label="名称">
              <Input defaultValue={initialValues.name} maxLength={100} name="name" required />
            </FormField>
          </div>

          <FormField label="排序">
            <Input defaultValue={initialValues.sortOrder} min={0} name="sortOrder" type="number" />
          </FormField>

          <FormField error={contentError} label="内容 JSON">
            <Textarea
              className="min-h-64 font-mono"
              defaultValue={initialValues.contentText}
              name="contentText"
              required
              spellCheck={false}
            />
          </FormField>
        </form>
      </Dialog>
    </PageShell>
  )
}
