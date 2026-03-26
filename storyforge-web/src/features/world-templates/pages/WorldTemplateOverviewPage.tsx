import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { worldTemplatesApi } from '@/shared/api/services'
import { queryKeys } from '@/shared/query/keys'
import { Button } from '@/shared/ui/primitives/Button'
import { BooleanBadge } from '@/shared/ui/patterns/EntityBadges'
import { EmptyState } from '@/shared/ui/patterns/EmptyState'
import { InfoCard, InfoGrid } from '@/shared/ui/patterns/InfoGrid'
import { LoadingState } from '@/shared/ui/patterns/LoadingState'
import { PageHeader } from '@/shared/ui/patterns/PageHeader'
import { PageShell } from '@/shared/ui/patterns/PageShell'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { Toolbar } from '@/shared/ui/patterns/Toolbar'
import { getErrorMessage } from '@/shared/utils/error'
import { useRequiredNumberParam } from '@/shared/utils/router'

export function WorldTemplateOverviewPage() {
  const templateId = useRequiredNumberParam('templateId')
  const navigate = useNavigate()

  const templateQuery = useQuery({
    queryKey: queryKeys.worldTemplate(templateId),
    queryFn: () => worldTemplatesApi.get(templateId),
    retry: false,
  })

  if (templateQuery.isLoading) {
    return (
      <SectionCard>
        <LoadingState label="正在加载模板详情..." />
      </SectionCard>
    )
  }

  if (templateQuery.isError) {
    if ((templateQuery.error as { status?: number } | undefined)?.status === 404) {
      return (
        <SectionCard>
          <PageHeader description="模板不存在或已被删除。" title="模板概览" />
        </SectionCard>
      )
    }

    return (
      <EmptyState
        actionLabel="返回模板列表"
        description={getErrorMessage(templateQuery.error)}
        onAction={() => navigate('/world-templates')}
        title="模板详情加载失败"
      />
    )
  }

  if (!templateQuery.data) {
    return (
      <SectionCard>
        <PageHeader description="模板不存在或已被删除。" title="模板概览" />
      </SectionCard>
    )
  }

  const template = templateQuery.data

  return (
    <PageShell>
      <SectionCard>
        <PageHeader
          actions={
            <Toolbar>
              <Button onClick={() => navigate(`/world-templates/${templateId}/world-settings`)} variant="primary">
                管理模板世界设定
              </Button>
              <Button onClick={() => navigate('/world-templates')} variant="ghost">
                返回模板列表
              </Button>
            </Toolbar>
          }
          description={template.description || '暂无模板描述'}
          eyebrow="Template overview"
          title={template.name}
        />
        <InfoGrid className="xl:grid-cols-2">
          <InfoCard label="是否公开" value={<BooleanBadge value={template.isPublic} />} />
          <InfoCard label="模板 ID" value={template.id} />
          <InfoCard label="创建时间" value={template.createdAt} />
          <InfoCard label="更新时间" value={template.updatedAt} />
        </InfoGrid>
      </SectionCard>
    </PageShell>
  )
}
