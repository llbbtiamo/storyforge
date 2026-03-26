import { Suspense, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { RouteLoadingInline } from '@/app/router/RouteLoadingInline'
import { ProjectEditorModal, ProjectsListingSection } from '@/features/projects/pages/lazy'
import { projectsApi, worldTemplatesApi } from '@/shared/api/services'
import type { Project, ProjectPayload, WorldTemplate } from '@/shared/api/types'
import { queryKeys } from '@/shared/query/keys'
import { Button } from '@/shared/ui/primitives/Button'
import { EmptyState } from '@/shared/ui/patterns/EmptyState'
import { PageHeader } from '@/shared/ui/patterns/PageHeader'
import { PageShell } from '@/shared/ui/patterns/PageShell'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { Toolbar } from '@/shared/ui/patterns/Toolbar'
import { useAppMessage } from '@/shared/ui/useAppMessage'
import { getErrorMessage } from '@/shared/utils/error'

export function ProjectsPage() {
  const queryClient = useQueryClient()
  const message = useAppMessage()
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectsApi.list,
    retry: false,
  })

  const templatesQuery = useQuery({
    queryKey: queryKeys.worldTemplates,
    queryFn: worldTemplatesApi.list,
    retry: false,
  })

  const templateOptions = useMemo(
    () =>
      (templatesQuery.data ?? []).map((template: WorldTemplate) => ({
        label: template.name,
        value: template.id,
      })),
    [templatesQuery.data],
  )

  const refreshProjects = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.projects })
  }

  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: async () => {
      message.success('项目已创建')
      setIsModalOpen(false)
      await refreshProjects()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProjectPayload }) => projectsApi.update(id, payload),
    onSuccess: async () => {
      message.success('项目已更新')
      setIsModalOpen(false)
      setEditingProject(null)
      await refreshProjects()
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: projectsApi.remove,
    onSuccess: async () => {
      message.success('项目已删除')
      await refreshProjects()
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
                  setEditingProject(null)
                  setIsModalOpen(true)
                }}
              >
                新建项目
              </Button>
              <Button
                onClick={() => void queryClient.invalidateQueries({ queryKey: queryKeys.worldTemplates })}
                variant="secondary"
              >
                刷新模板列表
              </Button>
            </Toolbar>
          }
          description="覆盖项目 CRUD、进入项目工作区、基于项目生成世界模板与应用模板等已实现后端能力。"
          eyebrow="Projects"
          title="项目工作台"
        />
      </SectionCard>

      {projectsQuery.isError ? (
        <EmptyState description={getErrorMessage(projectsQuery.error)} title="项目列表加载失败" />
      ) : (
        <Suspense fallback={<RouteLoadingInline label="正在加载项目列表..." />}>
          <ProjectsListingSection
            isProjectsLoading={projectsQuery.isLoading}
            onDelete={(projectId) => deleteMutation.mutate(projectId)}
            onEdit={(project) => {
              setEditingProject(project)
              setIsModalOpen(true)
            }}
            projects={projectsQuery.data ?? []}
          />
        </Suspense>
      )}

      <Outlet />

      <Suspense fallback={isModalOpen ? <RouteLoadingInline label="正在加载项目编辑器..." /> : null}>
        <ProjectEditorModal
          onCancel={() => {
            setIsModalOpen(false)
            setEditingProject(null)
          }}
          onSubmit={(payload) => {
            if (editingProject) {
              updateMutation.mutate({ id: editingProject.id, payload })
            } else {
              createMutation.mutate(payload)
            }
          }}
          open={isModalOpen}
          project={editingProject}
          submitting={createMutation.isPending || updateMutation.isPending}
          templateOptions={templateOptions}
        />
      </Suspense>
    </PageShell>
  )
}
