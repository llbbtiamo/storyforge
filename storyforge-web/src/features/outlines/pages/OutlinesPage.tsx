import { Suspense, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { RouteLoadingInline } from '@/app/router/RouteLoadingInline'
import { OutlinesListingSection } from '@/features/outlines/pages/lazy'
import { outlinesApi } from '@/shared/api/services'
import type { PlotOutline, PlotOutlinePayload } from '@/shared/api/types'
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
import { parseLines, stringifyLines } from '@/shared/utils/form'
import { useRequiredNumberParam } from '@/shared/utils/router'

interface OutlineFormValues {
  parentId: string
  title: string
  summary: string
  keyEventsText: string
  level: string
  sortOrder: string
}

const defaultValues: OutlineFormValues = {
  parentId: '',
  title: '',
  summary: '',
  keyEventsText: '',
  level: '1',
  sortOrder: '0',
}

function getInitialValues(outline: PlotOutline | null): OutlineFormValues {
  if (!outline) {
    return defaultValues
  }

  return {
    parentId: outline.parentId ? String(outline.parentId) : '',
    title: outline.title,
    summary: outline.summary ?? '',
    keyEventsText: stringifyLines(outline.keyEvents),
    level: String(outline.level),
    sortOrder: String(outline.sortOrder),
  }
}

export function OutlinesPage() {
  const projectId = useRequiredNumberParam('projectId')
  const queryClient = useQueryClient()
  const message = useAppMessage()
  const [editingOutline, setEditingOutline] = useState<PlotOutline | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [titleError, setTitleError] = useState<string | null>(null)

  const outlinesQuery = useQuery({
    queryKey: queryKeys.outlines(projectId),
    queryFn: () => outlinesApi.list(projectId),
    retry: false,
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.outlines(projectId) })
  }

  const createMutation = useMutation({
    mutationFn: (payload: PlotOutlinePayload) => outlinesApi.create(projectId, payload),
    onSuccess: async () => {
      message.success('剧情节点已创建')
      setIsModalOpen(false)
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PlotOutlinePayload }) =>
      outlinesApi.update(projectId, id, payload),
    onSuccess: async () => {
      message.success('剧情节点已更新')
      setIsModalOpen(false)
      setEditingOutline(null)
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => outlinesApi.remove(projectId, id),
    onSuccess: async () => {
      message.success('剧情节点已删除')
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  function openCreateModal() {
    setEditingOutline(null)
    setTitleError(null)
    setIsModalOpen(true)
  }

  function openEditModal(record: PlotOutline) {
    setEditingOutline(record)
    setTitleError(null)
    setIsModalOpen(true)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('title') ?? '').trim()
    if (!title) {
      setTitleError('请输入标题')
      return
    }

    setTitleError(null)

    const parentIdValue = String(formData.get('parentId') ?? '').trim()
    const summary = String(formData.get('summary') ?? '').trim()
    const keyEventsText = String(formData.get('keyEventsText') ?? '')
    const levelValue = String(formData.get('level') ?? '').trim()
    const sortOrderValue = String(formData.get('sortOrder') ?? '').trim()

    const parentId = parentIdValue === '' ? undefined : Number(parentIdValue)
    const level = levelValue === '' ? undefined : Number(levelValue)
    const sortOrder = sortOrderValue === '' ? undefined : Number(sortOrderValue)

    const payload: PlotOutlinePayload = {
      parentId: parentId !== undefined && Number.isFinite(parentId) ? parentId : undefined,
      title,
      summary: summary || undefined,
      keyEvents: parseLines(keyEventsText),
      level: level !== undefined && Number.isFinite(level) ? Math.max(0, level) : undefined,
      sortOrder: sortOrder !== undefined && Number.isFinite(sortOrder) ? Math.max(0, sortOrder) : undefined,
    }

    if (editingOutline) {
      updateMutation.mutate({ id: editingOutline.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const initialValues = getInitialValues(editingOutline)

  return (
    <PageShell>
      <SectionCard>
        <PageHeader
          actions={<Button onClick={openCreateModal}>新建剧情节点</Button>}
          description="后端返回平铺列表，前端用 level 和 parentId 辅助展示层级关系。"
          eyebrow="Plot outlines"
          title="剧情大纲"
        />
      </SectionCard>

      {outlinesQuery.isError ? (
        <EmptyState description={getErrorMessage(outlinesQuery.error)} title="剧情节点加载失败" />
      ) : (
        <Suspense fallback={<RouteLoadingInline label="正在加载剧情节点列表..." />}>
          <OutlinesListingSection
            items={outlinesQuery.data ?? []}
            loading={outlinesQuery.isLoading}
            onDelete={(id) => deleteMutation.mutate(id)}
            onEdit={(record) => openEditModal(record)}
          />
        </Suspense>
      )}

      <Dialog
        description="支持父节点、层级、排序和关键事件输入，便于维护平铺结构的大纲树。"
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <Button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} variant="secondary">
              取消
            </Button>
            <Button form="outlines-form" loading={isSubmitting} type="submit">
              {editingOutline ? '保存节点' : '创建节点'}
            </Button>
          </div>
        }
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        dismissible={!isSubmitting}
        title={editingOutline ? '编辑剧情节点' : '新建剧情节点'}
      >
        <form className="space-y-5" id="outlines-form" key={editingOutline?.id ?? 'new'} onSubmit={handleSubmit}>
          <FormField label="父节点">
            <Input defaultValue={initialValues.parentId} min={1} name="parentId" placeholder="留空表示根节点" type="number" />
          </FormField>

          <FormField error={titleError} label="标题">
            <Input defaultValue={initialValues.title} maxLength={200} name="title" required />
          </FormField>

          <FormField label="摘要">
            <Textarea className="min-h-28" defaultValue={initialValues.summary} name="summary" />
          </FormField>

          <FormField label="关键事件（每行一条）">
            <Textarea className="min-h-36" defaultValue={initialValues.keyEventsText} name="keyEventsText" />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="层级">
              <Input defaultValue={initialValues.level} min={0} name="level" type="number" />
            </FormField>

            <FormField label="排序">
              <Input defaultValue={initialValues.sortOrder} min={0} name="sortOrder" type="number" />
            </FormField>
          </div>
        </form>
      </Dialog>
    </PageShell>
  )
}
