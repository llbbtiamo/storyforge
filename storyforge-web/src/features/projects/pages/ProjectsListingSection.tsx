import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'

import type { Project } from '@/shared/api/types'
import { Button } from '@/shared/ui/primitives/Button'
import { ConfirmDialog } from '@/shared/ui/patterns/ConfirmDialog'
import { DataTable } from '@/shared/ui/patterns/DataTable'
import { InfoCard, InfoGrid } from '@/shared/ui/patterns/InfoGrid'
import { LoadingState } from '@/shared/ui/patterns/LoadingState'
import { PageHeader } from '@/shared/ui/patterns/PageHeader'
import { ProjectStatusBadge } from '@/shared/ui/patterns/EntityBadges'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { Toolbar } from '@/shared/ui/patterns/Toolbar'

export function ProjectsListingSection({
  projects,
  isProjectsLoading,
  onEdit,
  onDelete,
}: {
  projects: Project[]
  isProjectsLoading: boolean
  onEdit: (project: Project) => void
  onDelete: (projectId: number) => void
}) {
  const navigate = useNavigate()
  const [pendingDeleteProject, setPendingDeleteProject] = useState<Project | null>(null)

  const projectColumns = useMemo(
    () => [
      {
        key: 'title',
        header: '标题',
        render: (project: Project) => (
          <Link className="font-semibold text-primary" to={`/projects/${project.id}/overview`}>
            {project.title}
          </Link>
        ),
      },
      {
        key: 'genre',
        header: '题材',
        render: (project: Project) => project.genre || '-',
      },
      {
        key: 'status',
        header: '状态',
        render: (project: Project) => <ProjectStatusBadge status={project.status} />,
      },
      {
        key: 'wordCount',
        header: '字数',
        render: (project: Project) => project.wordCount,
      },
      {
        key: 'updatedAt',
        header: '更新时间',
        render: (project: Project) => project.updatedAt,
      },
      {
        key: 'actions',
        header: '操作',
        className: 'w-[220px]',
        render: (project: Project) => (
          <Toolbar>
            <Button onClick={() => navigate(`/projects/${project.id}/overview`)} size="sm" variant="secondary">
              打开
            </Button>
            <Button onClick={() => onEdit(project)} size="sm" variant="ghost">
              编辑
            </Button>
            <Button onClick={() => setPendingDeleteProject(project)} size="sm" variant="danger">
              删除
            </Button>
          </Toolbar>
        ),
      },
    ],
    [navigate, onEdit],
  )

  return (
    <>
      <SectionCard>
        {isProjectsLoading && !projects.length ? (
          <LoadingState label="正在加载项目列表..." />
        ) : (
          <DataTable
            columns={projectColumns}
            data={projects}
            emptyDescription="先创建一个故事工程吧。"
            emptyTitle="暂无项目"
            renderDetails={(project) => (
              <InfoGrid className="xl:grid-cols-2">
                <InfoCard label="描述" value={project.description || '暂无项目描述'} />
                <InfoCard label="模板 ID" value={project.worldTemplateId ?? '-'} />
                <InfoCard label="封面 URL" value={project.coverUrl || '-'} />
                <InfoCard label="创建时间" value={project.createdAt} />
              </InfoGrid>
            )}
            rowKey="id"
          />
        )}
      </SectionCard>

      <SectionCard>
        <PageHeader
          description="项目列表页保留与模板能力相关的使用提示，方便联调现有后端流程。"
          title="当前模板能力"
        />
        <InfoGrid>
          {[
            ['应用模板到项目', '使用项目详情页的模板操作卡片，可触发 overwriteExistingSettings 覆盖逻辑。'],
            ['从项目生成模板', '在项目概览页可将当前项目世界设定导出成私有模板。'],
            ['模板列表联动', '新建/编辑项目时可选择当前登录用户已有的世界模板。'],
          ].map(([label, text]) => (
            <InfoCard key={label} label={label} value={text} />
          ))}
        </InfoGrid>
      </SectionCard>

      <ConfirmDialog
        confirmLabel="删除项目"
        description={pendingDeleteProject ? `确认删除项目「${pendingDeleteProject.title}」吗？` : undefined}
        onCancel={() => setPendingDeleteProject(null)}
        onConfirm={() => {
          if (!pendingDeleteProject) {
            return
          }
          onDelete(pendingDeleteProject.id)
          setPendingDeleteProject(null)
        }}
        open={Boolean(pendingDeleteProject)}
        title="确认删除该项目吗？"
      />
    </>
  )
}
