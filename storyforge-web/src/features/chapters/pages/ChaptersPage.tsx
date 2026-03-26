import { Suspense, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { RouteLoadingInline } from '@/app/router/RouteLoadingInline'
import { ChaptersListingSection } from '@/features/chapters/pages/lazy'
import { chaptersApi, outlinesApi } from '@/shared/api/services'
import type { Chapter, ChapterPayload, ChapterStatus } from '@/shared/api/types'
import { queryKeys } from '@/shared/query/keys'
import { Button } from '@/shared/ui/primitives/Button'
import { Dialog } from '@/shared/ui/primitives/Dialog'
import { Input } from '@/shared/ui/primitives/Input'
import { Select } from '@/shared/ui/primitives/Select'
import { Textarea } from '@/shared/ui/primitives/Textarea'
import { EmptyState } from '@/shared/ui/patterns/EmptyState'
import { FormField } from '@/shared/ui/patterns/FormField'
import { PageHeader } from '@/shared/ui/patterns/PageHeader'
import { PageShell } from '@/shared/ui/patterns/PageShell'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { useAppMessage } from '@/shared/ui/useAppMessage'
import { getErrorMessage } from '@/shared/utils/error'
import { useRequiredNumberParam } from '@/shared/utils/router'

interface ChapterFormValues {
  outlineId: string
  chapterNumber: string
  title: string
  content: string
  wordCount: string
  status: EditableChapterStatus | ''
  aiModelUsed: string
}

type EditableChapterStatus = Exclude<ChapterStatus, 'PUBLISHED'>

const statusOptions: { label: string; value: EditableChapterStatus }[] = [
  { label: '草稿', value: 'DRAFT' },
  { label: '生成中', value: 'GENERATING' },
  { label: '待审核', value: 'REVIEW' },
]

const defaultValues: ChapterFormValues = {
  outlineId: '',
  chapterNumber: '',
  title: '',
  content: '',
  wordCount: '0',
  status: 'DRAFT',
  aiModelUsed: '',
}

function getInitialValues(chapter: Chapter | null): ChapterFormValues {
  if (!chapter) {
    return defaultValues
  }

  return {
    outlineId: chapter.outlineId ? String(chapter.outlineId) : '',
    chapterNumber: String(chapter.chapterNumber),
    title: chapter.title ?? '',
    content: chapter.content ?? '',
    wordCount: chapter.wordCount !== undefined && chapter.wordCount !== null ? String(chapter.wordCount) : '0',
    status: chapter.status === 'PUBLISHED' ? '' : chapter.status,
    aiModelUsed: chapter.aiModelUsed ?? '',
  }
}

export function ChaptersPage() {
  const projectId = useRequiredNumberParam('projectId')
  const queryClient = useQueryClient()
  const message = useAppMessage()
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [chapterNumberError, setChapterNumberError] = useState<string | null>(null)

  const chaptersQuery = useQuery({
    queryKey: queryKeys.chapters(projectId),
    queryFn: () => chaptersApi.list(projectId),
    retry: false,
  })

  const outlinesQuery = useQuery({
    queryKey: queryKeys.outlines(projectId),
    queryFn: () => outlinesApi.list(projectId),
    retry: false,
  })

  const outlineOptions = useMemo(
    () => (outlinesQuery.data ?? []).map((outline) => ({ label: outline.title, value: String(outline.id) })),
    [outlinesQuery.data],
  )

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.chapters(projectId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
    ])
  }

  const createMutation = useMutation({
    mutationFn: (payload: ChapterPayload) => chaptersApi.create(projectId, payload),
    onSuccess: async () => {
      message.success('章节已创建')
      setIsModalOpen(false)
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ChapterPayload }) =>
      chaptersApi.update(projectId, id, payload),
    onSuccess: async () => {
      message.success('章节已更新')
      setIsModalOpen(false)
      setEditingChapter(null)
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => chaptersApi.approve(projectId, id),
    onSuccess: async () => {
      message.success('章节已审核发布，并生成版本快照')
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => chaptersApi.remove(projectId, id),
    onSuccess: async () => {
      message.success('章节已删除')
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  function openCreateModal() {
    setEditingChapter(null)
    setChapterNumberError(null)
    setIsModalOpen(true)
  }

  function openEditModal(record: Chapter) {
    setEditingChapter(record)
    setChapterNumberError(null)
    setIsModalOpen(true)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const chapterNumberValue = String(formData.get('chapterNumber') ?? '').trim()
    if (!chapterNumberValue) {
      setChapterNumberError('请输入章节号')
      return
    }

    const chapterNumber = Number(chapterNumberValue)
    if (!Number.isFinite(chapterNumber) || chapterNumber < 1) {
      setChapterNumberError('章节号必须是大于等于 1 的数字')
      return
    }

    setChapterNumberError(null)

    const outlineIdValue = String(formData.get('outlineId') ?? '').trim()
    const title = String(formData.get('title') ?? '').trim()
    const content = String(formData.get('content') ?? '').trim()
    const wordCountValue = String(formData.get('wordCount') ?? '').trim()
    const statusValue = String(formData.get('status') ?? '').trim()
    const aiModelUsed = String(formData.get('aiModelUsed') ?? '').trim()

    if (editingChapter?.status === 'PUBLISHED' && !statusValue) {
      message.error('已发布章节编辑前请明确选择新的状态')
      return
    }

    const status = (statusValue || 'DRAFT') as EditableChapterStatus

    const wordCount = wordCountValue === '' ? undefined : Number(wordCountValue)
    const payload: ChapterPayload = {
      outlineId: outlineIdValue ? Number(outlineIdValue) : undefined,
      chapterNumber,
      title: title || undefined,
      content: content || undefined,
      wordCount: wordCount !== undefined && Number.isFinite(wordCount) ? Math.max(0, wordCount) : undefined,
      status,
      aiModelUsed: aiModelUsed || undefined,
    }

    if (editingChapter) {
      updateMutation.mutate({ id: editingChapter.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const initialValues = getInitialValues(editingChapter)

  return (
    <PageShell>
      <SectionCard>
        <PageHeader
          actions={<Button onClick={openCreateModal}>新建章节</Button>}
          description="支持章节 CRUD、审核发布，以及查看版本历史。AI 生成未纳入本轮，但保留 GENERATING 状态与模型字段以匹配现有后端。"
          eyebrow="Chapters"
          title="章节管理"
        />
      </SectionCard>

      {chaptersQuery.isError ? (
        <EmptyState description={getErrorMessage(chaptersQuery.error)} title="章节列表加载失败" />
      ) : (
        <Suspense fallback={<RouteLoadingInline label="正在加载章节列表..." />}>
          <ChaptersListingSection
            items={chaptersQuery.data ?? []}
            loading={chaptersQuery.isLoading}
            onApprove={(id) => approveMutation.mutate(id)}
            onDelete={(id) => deleteMutation.mutate(id)}
            onEdit={(record) => openEditModal(record)}
            projectId={projectId}
          />
        </Suspense>
      )}

      <Dialog
        description="可维护章节正文、状态、关联大纲与 AI 模型标识。"
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <Button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} variant="secondary">
              取消
            </Button>
            <Button form="chapters-form" loading={isSubmitting} type="submit">
              {editingChapter ? '保存章节' : '创建章节'}
            </Button>
          </div>
        }
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        dismissible={!isSubmitting}
        panelClassName="max-w-4xl"
        title={editingChapter ? '编辑章节' : '新建章节'}
      >
        <form className="space-y-5" id="chapters-form" key={editingChapter?.id ?? 'new'} onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="关联大纲">
              <Select defaultValue={initialValues.outlineId} name="outlineId">
                <option value="">留空表示不关联大纲</option>
                {outlineOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField error={chapterNumberError} label="章节号">
              <Input defaultValue={initialValues.chapterNumber} min={1} name="chapterNumber" required type="number" />
            </FormField>
          </div>

          <FormField label="标题">
            <Input defaultValue={initialValues.title} maxLength={200} name="title" />
          </FormField>

          <FormField label="正文">
            <Textarea className="min-h-72" defaultValue={initialValues.content} name="content" />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-3">
            <FormField label="字数">
              <Input defaultValue={initialValues.wordCount} min={0} name="wordCount" type="number" />
            </FormField>

            <FormField label="状态">
              <Select defaultValue={initialValues.status} name="status">
                {editingChapter?.status === 'PUBLISHED' ? <option value="">请选择新的状态后再保存</option> : null}
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="AI 模型标识">
              <Input defaultValue={initialValues.aiModelUsed} maxLength={50} name="aiModelUsed" placeholder="可选，例如 gpt-4o-mini" />
            </FormField>
          </div>
        </form>
      </Dialog>
    </PageShell>
  )
}
