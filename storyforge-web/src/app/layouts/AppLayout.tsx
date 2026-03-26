import { useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'

import { LoadingPage } from '@/app/router/LoadingPage'
import { useAuth } from '@/shared/auth/useAuth'
import { Badge } from '@/shared/ui/primitives/Badge'
import { Button } from '@/shared/ui/primitives/Button'
import { Dialog } from '@/shared/ui/primitives/Dialog'
import { cn } from '@/shared/utils/cn'

const primaryNavLinks = [
  { key: '/projects', label: '项目工作台' },
  { key: '/world-templates', label: '世界模板' },
  { key: '/me', label: '我的账户' },
] as const

function navLinkClassName(active: boolean) {
  return cn(
    'relative flex items-center justify-between rounded-[var(--radius-control)] px-3.5 py-2.5 text-[14px] font-[500] transition-all duration-200',
    active
      ? 'bg-surface-sunken text-text font-[600] shadow-[0_1px_2px_rgba(0,0,0,0.02)] ring-1 ring-border/50'
      : 'text-text-muted hover:bg-surface-subtle hover:text-text',
  )
}

function normalizePath(pathname: string, projectId?: string) {
  if (projectId && pathname.includes(`/projects/${projectId}/chapters/`) && pathname.endsWith('/versions')) {
    return `/projects/${projectId}/chapters`
  }

  return pathname
}

function isActiveLink(currentPath: string, targetPath: string) {
  if (targetPath === '/projects') {
    return currentPath.startsWith('/projects')
  }

  return currentPath === targetPath
}

export function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const { user, loading, logout } = useAuth()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const normalizedPath = useMemo(() => normalizePath(pathname, projectId), [pathname, projectId])

  const projectLinks = useMemo(() => {
    if (!projectId) {
      return []
    }

    return [
      { key: `/projects/${projectId}/overview`, label: '概览' },
      { key: `/projects/${projectId}/world-settings`, label: '世界设定' },
      { key: `/projects/${projectId}/characters`, label: '角色' },
      { key: `/projects/${projectId}/character-relations`, label: '角色关系' },
      { key: `/projects/${projectId}/outlines`, label: '剧情大纲' },
      { key: `/projects/${projectId}/chapters`, label: '章节' },
      { key: `/projects/${projectId}/style-constraint`, label: '风格约束' },
    ]
  }, [projectId])

  if (loading) {
    return <LoadingPage />
  }

  return (
    <div className="min-h-screen bg-surface-subtle text-text selection:bg-primary-soft selection:text-primary-hover">
      <div className="flex min-h-screen">
        <Dialog
          ariaLabel="主导航"
          bodyClassName="px-0 py-0"
          dismissible
          onClose={() => setMobileNavOpen(false)}
          open={mobileNavOpen}
          panelClassName="ml-0 mr-auto h-full max-h-screen w-[min(88vw,320px)] rounded-none border-y-0 border-l-0 sm:max-h-screen"
          showCloseButton={false}
          size="sm"
          title={undefined}
        >
          <aside className="flex h-full flex-col px-5 py-6">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-3">
                  <Badge className="shadow-sm" tone="neutral">StoryForge</Badge>
                  <div className="space-y-1">
                    <div className="text-xl font-[700] tracking-tight text-text">统一创作工作台</div>
                    <p className="text-[13px] leading-6 text-text-muted">一致的导航、清晰的层级与稳定的内容管理流程。</p>
                  </div>
                </div>
                <Button aria-label="关闭导航" onClick={() => setMobileNavOpen(false)} size="sm" variant="ghost">
                  关闭
                </Button>
              </div>

              <nav className="grid gap-1">
                {primaryNavLinks.map((item) => (
                  <Link
                    className={navLinkClassName(isActiveLink(normalizedPath, item.key))}
                    key={item.key}
                    onClick={() => setMobileNavOpen(false)}
                    to={item.key}
                  >
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {projectLinks.length ? (
              <div className="mt-8 space-y-3 border-t border-border/50 pt-6">
                <div className="px-3 text-[11px] font-[700] uppercase tracking-widest text-text-subtle">当前项目</div>
                <nav className="grid gap-1">
                  {projectLinks.map((item) => (
                    <Link
                      className={navLinkClassName(isActiveLink(normalizedPath, item.key))}
                      key={item.key}
                      onClick={() => setMobileNavOpen(false)}
                      to={item.key}
                    >
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            ) : null}
          </aside>
        </Dialog>

        <aside className="hidden w-72 flex-col border-r border-border/60 bg-surface px-5 py-6 lg:flex">
          <div className="space-y-6">
            <div className="space-y-3">
              <Badge tone="primary">StoryForge</Badge>
              <div className="space-y-1">
                <div className="text-xl font-[700] tracking-tight text-text">统一创作工作台</div>
                <p className="text-[13px] leading-6 text-text-muted">一致的导航、清晰的层级与稳定的内容管理流程。</p>
              </div>
            </div>

            <nav className="grid gap-1">
              {primaryNavLinks.map((item) => (
                <Link className={navLinkClassName(isActiveLink(normalizedPath, item.key))} key={item.key} to={item.key}>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {projectLinks.length ? (
            <div className="mt-8 space-y-3 border-t border-border/50 pt-6">
              <div className="px-3 text-[11px] font-[700] uppercase tracking-widest text-text-subtle">当前项目</div>
              <nav className="grid gap-1">
                {projectLinks.map((item) => (
                  <Link className={navLinkClassName(isActiveLink(normalizedPath, item.key))} key={item.key} to={item.key}>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          ) : null}
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-0">
          <header className="sticky top-0 z-20 border-b border-border/40 bg-surface/60 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <Button className="lg:hidden" onClick={() => setMobileNavOpen(true)} size="sm" variant="secondary">
                  菜单
                </Button>
                <div className="flex flex-col">
                  <span className="text-[14px] font-[600] text-text">{user?.nickname || user?.username}</span>
                  <span className="text-[12px] text-text-subtle">{user?.email}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => {
                    setMobileNavOpen(false)
                    logout()
                    navigate('/login', { replace: true })
                  }}
                  size="sm"
                  variant="subtle"
                >
                  退出登录
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1400px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
