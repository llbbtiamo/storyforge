import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { projectsApi, worldTemplatesApi } from '@/shared/api/services'
import type {
  ApplyWorldTemplatePayload,
  CreateWorldTemplateFromProjectPayload,
} from '@/shared/api/types'
import { queryKeys } from '@/shared/query/keys'
import { Button } from '@/shared/ui/primitives/Button'
import { Input } from '@/shared/ui/primitives/Input'
import { Select } from '@/shared/ui/primitives/Select'
import { ConfirmDialog } from '@/shared/ui/patterns/ConfirmDialog'
import { DataTable } from '@/shared/ui/patterns/DataTable'
import { EmptyState } from '@/shared/ui/patterns/EmptyState'
import { BooleanBadge, ProjectStatusBadge } from '@/shared/ui/patterns/EntityBadges'
import { FormField } from '@/shared/ui/patterns/FormField'
import { InfoCard, InfoGrid } from '@/shared/ui/patterns/InfoGrid'
import { LoadingState } from '@/shared/ui/patterns/LoadingState'
import { PageHeader } from '@/shared/ui/patterns/PageHeader'
import { PageShell } from '@/shared/ui/patterns/PageShell'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { Toolbar } from '@/shared/ui/patterns/Toolbar'
import { useAppMessage } from '@/shared/ui/useAppMessage'
import { getErrorMessage } from '@/shared/utils/error'
import { useRequiredNumberParam } from '@/shared/utils/router'

export function ProjectOverviewPage() {
  const projectId = useRequiredNumberParam('projectId')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const message = useAppMessage()
  const [applyTemplateId, setApplyTemplateId] = useState('')
  const [overwriteExistingSettings, setOverwriteExistingSettings] = useState('false')
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDescription, setNewTemplateDescription] = useState('')
  const [pendingApplyPayload, setPendingApplyPayload] = useState<ApplyWorldTemplatePayload | null>(null)

  const projectQuery = useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => projectsApi.get(projectId),
    retry: false,
  })

  const worldTemplatesQuery = useQuery({
    queryKey: queryKeys.worldTemplates,
    queryFn: worldTemplatesApi.list,
    retry: false,
  })

  const createTemplateMutation = useMutation({
    mutationFn: (payload: CreateWorldTemplateFromProjectPayload) =>
      projectsApi.createWorldTemplate(projectId, payload),
    onSuccess: async (template) => {
      message.success(`已从项目生成模板：${template.name}`)
      setNewTemplateName('')
      setNewTemplateDescription('')
      await queryClient.invalidateQueries({ queryKey: queryKeys.worldTemplates })
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  const applyTemplateMutation = useMutation({
    mutationFn: (payload: ApplyWorldTemplatePayload) => projectsApi.applyWorldTemplate(projectId, payload),
    onSuccess: async () => {
      message.success('模板已应用到项目')
      setApplyTemplateId('')
      setOverwriteExistingSettings('false')
      setPendingApplyPayload(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.worldSettings(projectId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
      ])
    },
    onError: (error) => message.error(getErrorMessage(error)),
  })

  if (projectQuery.isLoading) {
    return (
      <SectionCard>
        <LoadingState label="正在加载项目详情..." />
      </SectionCard>
    )
  }

  if (projectQuery.isError) {
    if ((projectQuery.error as { status?: number } | undefined)?.status === 404) {
      return (
        <SectionCard>
          <PageHeader description="项目不存在或已被删除。" title="项目概览" />
        </SectionCard>
      )
    }

    return (
      <EmptyState
        actionLabel="返回项目列表"
        description={getErrorMessage(projectQuery.error)}
        onAction={() => navigate('/projects')}
        title="项目详情加载失败"
      />
    )
  }

  if (!projectQuery.data) {
    return (
      <SectionCard>
        <PageHeader description="项目不存在或已被删除。" title="项目概览" />
      </SectionCard>
    )
  }

  const project = projectQuery.data

  const workspaceLinks = [
    ['管理世界设定', `/projects/${projectId}/world-settings`],
    ['管理角色', `/projects/${projectId}/characters`],
    ['管理角色关系', `/projects/${projectId}/character-relations`],
    ['管理剧情大纲', `/projects/${projectId}/outlines`],
    ['管理章节与版本', `/projects/${projectId}/chapters`],
    ['管理风格约束', `/projects/${projectId}/style-constraint`],
  ] as const

  const handleApplyTemplate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!applyTemplateId) {
      message.error('请选择模板')
      return
    }

    const payload: ApplyWorldTemplatePayload = {
      worldTemplateId: Number(applyTemplateId),
      overwriteExistingSettings: overwriteExistingSettings === 'true',
    }

    if (payload.overwriteExistingSettings) {
      setPendingApplyPayload(payload)
      return
    }

    applyTemplateMutation.mutate(payload)
  }

  const handleCreateTemplate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload: CreateWorldTemplateFromProjectPayload = {
      name: newTemplateName.trim() || undefined,
      description: newTemplateDescription.trim() || undefined,
    }

    createTemplateMutation.mutate(payload)
  }

  return (
    <PageShell>
      <SectionCard>
        <PageHeader
          actions={
            <Toolbar>
              <Button onClick={() => navigate(`/projects/${projectId}/world-settings`)} variant="secondary">
                管理世界设定
              </Button>
              <Button onClick={() => navigate('/projects')} variant="ghost">
                返回项目列表
              </Button>
            </Toolbar>
          }
          description={project.description || '暂无项目描述'}
          eyebrow="Project overview"
          title={project.title}
        />
        <InfoGrid>
          <InfoCard label="题材" value={project.genre || '-'} />
          <InfoCard label="状态" value={<ProjectStatusBadge status={project.status} />} />
          <InfoCard label="字数" value={project.wordCount} />
          <InfoCard label="模板 ID" value={project.worldTemplateId ?? '-'} />
          <InfoCard label="创建时间" value={project.createdAt} />
          <InfoCard label="更新时间" value={project.updatedAt} />
        </InfoGrid>
      </SectionCard>

      <SectionCard>
        <PageHeader
          description="进入各业务子域继续 CRUD 与联调，已覆盖当前后端已落地能力。"
          title="项目工作区入口"
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {workspaceLinks.map(([label, path]) => (
            <Button key={path} onClick={() => navigate(path)} variant="secondary">
              {label}
            </Button>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <PageHeader
          description="这里可以把现有模板应用到项目，或把当前项目世界设定导出成新的私有模板。"
          title="模板操作"
        />

        <div className="grid gap-5 xl:grid-cols-2">
          <form className="space-y-5 rounded-[var(--radius-panel)] border border-border bg-surface-subtle p-5" onSubmit={handleApplyTemplate}>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-text">应用模板到项目</h3>
              <p className="text-sm leading-7 text-text-muted">支持选择覆盖策略，便于验证模板应用联动结果。</p>
            </div>

            <FormField label="选择模板">
              <Select onChange={(event) => setApplyTemplateId(event.target.value)} value={applyTemplateId}>
                <option value="">选择已有模板</option>
                {(worldTemplatesQuery.data ?? []).map((template) => (
                  <option key={template.id} value={String(template.id)}>
                    {template.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="覆盖策略">
              <Select onChange={(event) => setOverwriteExistingSettings(event.target.value)} value={overwriteExistingSettings}>
                <option value="false">不覆盖现有设定</option>
                <option value="true">覆盖现有设定</option>
              </Select>
            </FormField>

            <Button loading={applyTemplateMutation.isPending} type="submit">
              应用模板到项目
            </Button>
          </form>

          <form className="space-y-5 rounded-[var(--radius-panel)] border border-border bg-surface-subtle p-5" onSubmit={handleCreateTemplate}>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-text">从项目生成模板</h3>
              <p className="text-sm leading-7 text-text-muted">把当前项目下的世界设定导出成新的私有模板，供后续复用。</p>
            </div>

            <FormField label="模板名称">
              <Input
                onChange={(event) => setNewTemplateName(event.target.value)}
                placeholder="留空则按项目标题自动命名"
                value={newTemplateName}
              />
            </FormField>

            <FormField label="模板描述">
              <Input
                onChange={(event) => setNewTemplateDescription(event.target.value)}
                placeholder="可选描述"
                value={newTemplateDescription}
              />
            </FormField>

            <Button loading={createTemplateMutation.isPending} type="submit" variant="secondary">
              从项目生成模板
            </Button>
          </form>
        </div>
      </SectionCard>

      <SectionCard>
        <PageHeader description="便于在项目页直接确认模板列表联动结果。" title="当前模板列表快照" />
        {worldTemplatesQuery.isError ? (
          <EmptyState
            description={getErrorMessage(worldTemplatesQuery.error)}
            title="模板列表加载失败"
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'name',
                header: '模板名',
                render: (template) => template.name,
              },
              {
                key: 'description',
                header: '描述',
                render: (template) => template.description || '-',
              },
              {
                key: 'public',
                header: '是否公开',
                render: (template) => <BooleanBadge value={template.isPublic} />,
              },
              {
                key: 'updatedAt',
                header: '更新时间',
                render: (template) => template.updatedAt,
              },
            ]}
            data={worldTemplatesQuery.data ?? []}
            emptyDescription="当前还没有模板。"
            emptyTitle="暂无模板"
            rowKey="id"
          />
        )}
      </SectionCard>

      <ConfirmDialog
        confirmLabel="继续应用模板"
        description="后端会根据 overwriteExistingSettings 覆盖项目已有世界设定，确认继续吗？"
        onCancel={() => setPendingApplyPayload(null)}
        onConfirm={() => {
          if (!pendingApplyPayload) {
            return
          }
          applyTemplateMutation.mutate(pendingApplyPayload)
        }}
        open={Boolean(pendingApplyPayload)}
        title="确认覆盖现有世界设定？"
        tone="danger"
      />
    </PageShell>
  )
}
