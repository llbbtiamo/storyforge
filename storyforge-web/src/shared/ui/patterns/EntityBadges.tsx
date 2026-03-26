import type { ChapterStatus, ProjectStatus } from '@/shared/api/types'
import { Badge } from '@/shared/ui/primitives/Badge'

const projectStatusConfig: Record<ProjectStatus, { label: string; tone: 'neutral' | 'primary' | 'success' }> = {
  DRAFT: { label: '草稿', tone: 'neutral' },
  IN_PROGRESS: { label: '创作中', tone: 'primary' },
  COMPLETED: { label: '已完成', tone: 'success' },
}

const chapterStatusConfig: Record<ChapterStatus, { label: string; tone: 'neutral' | 'primary' | 'warning' | 'success' }> = {
  DRAFT: { label: '草稿', tone: 'neutral' },
  GENERATING: { label: '生成中', tone: 'primary' },
  REVIEW: { label: '待审核', tone: 'warning' },
  PUBLISHED: { label: '已发布', tone: 'success' },
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = projectStatusConfig[status]
  return <Badge tone={config.tone}>{config.label}</Badge>
}

export function ChapterStatusBadge({ status }: { status: ChapterStatus }) {
  const config = chapterStatusConfig[status]
  return <Badge tone={config.tone}>{config.label}</Badge>
}

export function OutlineLevelBadge({ level }: { level: number }) {
  return <Badge tone="primary">L{level}</Badge>
}

export function BooleanBadge({ value, trueLabel = '是', falseLabel = '否' }: { value: boolean; trueLabel?: string; falseLabel?: string }) {
  return <Badge tone={value ? 'success' : 'neutral'}>{value ? trueLabel : falseLabel}</Badge>
}
