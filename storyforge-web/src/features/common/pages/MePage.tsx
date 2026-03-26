import { useAuth } from '@/shared/auth/useAuth'
import { InfoCard, InfoGrid } from '@/shared/ui/patterns/InfoGrid'
import { PageHeader } from '@/shared/ui/patterns/PageHeader'
import { PageShell } from '@/shared/ui/patterns/PageShell'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'

export function MePage() {
  const { user } = useAuth()

  return (
    <PageShell>
      <SectionCard>
        <PageHeader
          description="数据来源于 /api/v1/auth/me，登录态刷新后会自动恢复。"
          eyebrow="Account"
          title="当前用户"
        />
      </SectionCard>

      <SectionCard>
        <InfoGrid className="xl:grid-cols-2">
          {[
            ['用户 ID', user?.id ?? '-'],
            ['用户名', user?.username ?? '-'],
            ['昵称', user?.nickname || '-'],
            ['邮箱', user?.email ?? '-'],
            ['VIP 等级', user?.vipLevel ?? '-'],
          ].map(([label, value]) => (
            <InfoCard key={label} label={label} value={String(value)} />
          ))}
        </InfoGrid>
      </SectionCard>
    </PageShell>
  )
}
