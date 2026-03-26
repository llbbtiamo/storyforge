import { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { RouteLoadingInline } from '@/app/router/RouteLoadingInline'
import {
  WorldTemplateEditorModal,
  WorldTemplatesListingSection,
} from '@/features/world-templates/pages/lazy'
import { worldTemplatesApi } from '@/shared/api/services'
import type { WorldTemplate, WorldTemplatePayload } from '@/shared/api/types'
import { queryKeys } from '@/shared/query/keys'
import { Button } from '@/shared/ui/primitives/Button'
import { EmptyState } from '@/shared/ui/patterns/EmptyState'
import { PageHeader } from '@/shared/ui/patterns/PageHeader'
import { PageShell } from '@/shared/ui/patterns/PageShell'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { Toolbar } from '@/shared/ui/patterns/Toolbar'
import { useAppMessage } from '@/shared/ui/useAppMessage'
import { getErrorMessage } from '@/shared/utils/error'

export function WorldTemplatesPage() {
  const queryClient = useQueryClient()
  const message = useAppMessage()
  const [editingTemplate, setEditingTemplate] = useState<WorldTemplate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const templatesQuery = useQuery({
    queryKey: queryKeys.worldTemplates,
    queryFn: worldTemplatesApi.list,
    retry: false,
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.worldTemplates })
  }

  const createMutation = useMutation({
    mutationFn: worldTemplatesApi.create,
    onSuccess: async () => {
      message.success('模板已创建')
      setIsModalOpen(false)
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: WorldTemplatePayload }) =>
      worldTemplatesApi.update(id, payload),
    onSuccess: async () => {
      message.success('模板已更新')
      setIsModalOpen(false)
      setEditingTemplate(null)
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: worldTemplatesApi.remove,
    onSuccess: async () => {
      message.success('模板已删除')
      await refresh()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  return (
    <PageShell>
      <SectionCard>
        <PageHeader
          actions={
            <Toolbar>
              <Button
                onClick={() => {
                  setEditingTemplate(null)
                  setIsModalOpen(true)
                }}
              >
                新建模板
              </Button>
            </Toolbar>
          }
          description="覆盖模板 CRUD 与模板下世界设定管理。当前模板均为私有模板，isPublic 仅作返回字段展示。"
          eyebrow="World templates"
          title="世界模板工作台"
        />
      </SectionCard>

      {templatesQuery.isError ? (
        <EmptyState description={getErrorMessage(templatesQuery.error)} title="模板列表加载失败" />
      ) : (
        <Suspense fallback={<RouteLoadingInline label="正在加载模板列表..." />}>
          <WorldTemplatesListingSection
            loading={templatesQuery.isLoading}
            onDelete={(templateId) => deleteMutation.mutate(templateId)}
            onEdit={(template) => {
              setEditingTemplate(template)
              setIsModalOpen(true)
            }}
            templates={templatesQuery.data ?? []}
          />
        </Suspense>
      )}

      <Outlet />

      <Suspense fallback={isModalOpen ? <RouteLoadingInline label="正在加载模板编辑器..." /> : null}>
        <WorldTemplateEditorModal
          onCancel={() => {
            setIsModalOpen(false)
            setEditingTemplate(null)
          }}
          onSubmit={(payload) => {
            if (editingTemplate) {
              updateMutation.mutate({ id: editingTemplate.id, payload })
            } else {
              createMutation.mutate(payload)
            }
          }}
          open={isModalOpen}
          submitting={createMutation.isPending || updateMutation.isPending}
          template={editingTemplate}
        />
      </Suspense>
    </PageShell>
  )
}
