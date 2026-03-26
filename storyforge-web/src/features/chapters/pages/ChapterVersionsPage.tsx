import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import type { ChapterVersion } from '@/shared/api/types'
import { chaptersApi } from '@/shared/api/services'
import { queryKeys } from '@/shared/query/keys'
import { Button } from '@/shared/ui/primitives/Button'
import { DataTable } from '@/shared/ui/patterns/DataTable'
import { EmptyState } from '@/shared/ui/patterns/EmptyState'
import { LoadingState } from '@/shared/ui/patterns/LoadingState'
import { PageHeader } from '@/shared/ui/patterns/PageHeader'
import { PageShell } from '@/shared/ui/patterns/PageShell'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { getErrorMessage } from '@/shared/utils/error'
import { useRequiredNumberParam } from '@/shared/utils/router'

export function ChapterVersionsPage() {
  const projectId = useRequiredNumberParam('projectId')
  const chapterId = useRequiredNumberParam('chapterId')
  const navigate = useNavigate()

  const versionsQuery = useQuery({
    queryKey: queryKeys.chapterVersions(projectId, chapterId),
    queryFn: () => chaptersApi.versions(projectId, chapterId),
    retry: false,
  })

  const versions = versionsQuery.data ?? []

  return (
    <PageShell>
      <SectionCard>
        <PageHeader
          actions={
            <Button onClick={() => navigate(`/projects/${projectId}/chapters`)} variant="secondary">
              返回章节列表
            </Button>
          }
          description="当前版本由“审核发布”动作生成，展示版本号、来源、生成参数和内容快照。"
          eyebrow="Chapter versions"
          title="章节版本历史"
        />
      </SectionCard>

      <SectionCard>
        {versionsQuery.isLoading && versions.length === 0 ? (
          <LoadingState label="正在加载章节版本历史..." />
        ) : versionsQuery.isError ? (
          <EmptyState
            actionLabel="返回章节列表"
            description={getErrorMessage(versionsQuery.error)}
            onAction={() => navigate(`/projects/${projectId}/chapters`)}
            title="章节版本历史加载失败"
          />
        ) : (
          <DataTable<ChapterVersion>
            columns={[
              { key: 'versionNumber', header: '版本号', render: (item) => item.versionNumber },
              { key: 'source', header: '来源', render: (item) => item.source || '-' },
              {
                key: 'generationParams',
                header: '生成参数',
                render: (item) =>
                  item.generationParams ? (
                    <pre className="overflow-x-auto rounded-[var(--radius-control)] border border-border bg-surface-subtle p-3 text-xs leading-6 text-text">
                      {JSON.stringify(item.generationParams, null, 2)}
                    </pre>
                  ) : (
                    '-'
                  ),
              },
              {
                key: 'content',
                header: '内容快照',
                render: (item) => <p className="line-clamp-3 text-sm leading-7 text-text-muted">{item.content || '-'}</p>,
              },
              { key: 'createdAt', header: '创建时间', render: (item) => item.createdAt },
            ]}
            data={versions}
            emptyDescription="当前章节还没有版本历史。先执行审核发布。"
            emptyTitle="暂无版本历史"
            rowKey="id"
          />
        )}
      </SectionCard>
    </PageShell>
  )
}
