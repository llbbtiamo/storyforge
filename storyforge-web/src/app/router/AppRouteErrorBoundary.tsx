import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'

import { Button } from '@/shared/ui/primitives/Button'
import { PageHeader } from '@/shared/ui/patterns/PageHeader'
import { PageShell } from '@/shared/ui/patterns/PageShell'
import { SectionCard } from '@/shared/ui/patterns/SectionCard'
import { getErrorMessage } from '@/shared/utils/error'

export function AppRouteErrorBoundary() {
  const error = useRouteError()

  const description = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : getErrorMessage(error)

  return (
    <PageShell>
      <SectionCard>
        <PageHeader
          description={description}
          eyebrow="Route error"
          title="页面加载失败"
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => window.history.back()} variant="secondary">
            返回上一页
          </Button>
          <Link
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] border text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-ring)] disabled:pointer-events-none disabled:opacity-60 border-primary bg-primary text-white shadow-card hover:bg-primary/95 h-10 px-4"
            to="/projects"
          >
            返回项目工作台
          </Link>
        </div>
      </SectionCard>
    </PageShell>
  )
}
