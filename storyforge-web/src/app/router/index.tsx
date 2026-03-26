/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { LazyAppLayout } from '@/app/layouts/lazy'
import { AppRouteErrorBoundary } from '@/app/router/AppRouteErrorBoundary'
import { LoadingPage } from '@/app/router/LoadingPage'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import { RootRedirect } from '@/app/router/RootRedirect'
import { RouteSuspense } from '@/app/router/RouteSuspense'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage').then((module) => ({ default: module.RegisterPage })))
const ProjectsPage = lazy(() => import('@/features/projects/pages/ProjectsPage').then((module) => ({ default: module.ProjectsPage })))
const ProjectOverviewPage = lazy(() =>
  import('@/features/projects/pages/ProjectOverviewPage').then((module) => ({ default: module.ProjectOverviewPage })),
)
const ProjectWorldSettingsPage = lazy(() =>
  import('@/features/world-settings/pages/ProjectWorldSettingsPage').then((module) => ({ default: module.ProjectWorldSettingsPage })),
)
const CharactersPage = lazy(() => import('@/features/characters/pages/CharactersPage').then((module) => ({ default: module.CharactersPage })))
const CharacterRelationsPage = lazy(() =>
  import('@/features/character-relations/pages/CharacterRelationsPage').then((module) => ({ default: module.CharacterRelationsPage })),
)
const OutlinesPage = lazy(() => import('@/features/outlines/pages/OutlinesPage').then((module) => ({ default: module.OutlinesPage })))
const ChaptersPage = lazy(() => import('@/features/chapters/pages/ChaptersPage').then((module) => ({ default: module.ChaptersPage })))
const ChapterVersionsPage = lazy(() =>
  import('@/features/chapters/pages/ChapterVersionsPage').then((module) => ({ default: module.ChapterVersionsPage })),
)
const StyleConstraintPage = lazy(() =>
  import('@/features/style-constraint/pages/StyleConstraintPage').then((module) => ({ default: module.StyleConstraintPage })),
)
const WorldTemplatesPage = lazy(() =>
  import('@/features/world-templates/pages/WorldTemplatesPage').then((module) => ({ default: module.WorldTemplatesPage })),
)
const WorldTemplateOverviewPage = lazy(() =>
  import('@/features/world-templates/pages/WorldTemplateOverviewPage').then((module) => ({ default: module.WorldTemplateOverviewPage })),
)
const TemplateWorldSettingsPage = lazy(() =>
  import('@/features/template-world-settings/pages/TemplateWorldSettingsPage').then((module) => ({ default: module.TemplateWorldSettingsPage })),
)
const MePage = lazy(() => import('@/features/common/pages/MePage').then((module) => ({ default: module.MePage })))
const NotInScopePage = lazy(() =>
  import('@/features/common/pages/NotInScopePage').then((module) => ({ default: module.NotInScopePage })),
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
    errorElement: <AppRouteErrorBoundary />,
  },
  {
    path: '/login',
    errorElement: <AppRouteErrorBoundary />,
    element: (
      <RouteSuspense>
        <LoginPage />
      </RouteSuspense>
    ),
  },
  {
    path: '/register',
    errorElement: <AppRouteErrorBoundary />,
    element: (
      <RouteSuspense>
        <RegisterPage />
      </RouteSuspense>
    ),
  },
  {
    element: <ProtectedRoute />,
    errorElement: <AppRouteErrorBoundary />,
    hydrateFallbackElement: <LoadingPage />,
    children: [
      {
        element: (
          <RouteSuspense>
            <LazyAppLayout />
          </RouteSuspense>
        ),
        children: [
          {
            path: '/projects',
            element: (
              <RouteSuspense>
                <ProjectsPage />
              </RouteSuspense>
            ),
          },
          {
            path: '/projects/:projectId/overview',
            element: (
              <RouteSuspense>
                <ProjectOverviewPage />
              </RouteSuspense>
            ),
          },
          {
            path: '/projects/:projectId/world-settings',
            element: (
              <RouteSuspense>
                <ProjectWorldSettingsPage />
              </RouteSuspense>
            ),
          },
          {
            path: '/projects/:projectId/characters',
            element: (
              <RouteSuspense>
                <CharactersPage />
              </RouteSuspense>
            ),
          },
          {
            path: '/projects/:projectId/character-relations',
            element: (
              <RouteSuspense>
                <CharacterRelationsPage />
              </RouteSuspense>
            ),
          },
          {
            path: '/projects/:projectId/outlines',
            element: (
              <RouteSuspense>
                <OutlinesPage />
              </RouteSuspense>
            ),
          },
          {
            path: '/projects/:projectId/chapters',
            element: (
              <RouteSuspense>
                <ChaptersPage />
              </RouteSuspense>
            ),
          },
          {
            path: '/projects/:projectId/chapters/:chapterId/versions',
            element: (
              <RouteSuspense>
                <ChapterVersionsPage />
              </RouteSuspense>
            ),
          },
          {
            path: '/projects/:projectId/style-constraint',
            element: (
              <RouteSuspense>
                <StyleConstraintPage />
              </RouteSuspense>
            ),
          },
          {
            path: '/world-templates',
            element: (
              <RouteSuspense>
                <WorldTemplatesPage />
              </RouteSuspense>
            ),
          },
          {
            path: '/world-templates/:templateId/overview',
            element: (
              <RouteSuspense>
                <WorldTemplateOverviewPage />
              </RouteSuspense>
            ),
          },
          {
            path: '/world-templates/:templateId/world-settings',
            element: (
              <RouteSuspense>
                <TemplateWorldSettingsPage />
              </RouteSuspense>
            ),
          },
          {
            path: '/me',
            element: (
              <RouteSuspense>
                <MePage />
              </RouteSuspense>
            ),
          },
          {
            path: '/ai-generation',
            element: (
              <RouteSuspense>
                <NotInScopePage />
              </RouteSuspense>
            ),
          },
          {
            path: '*',
            element: <Navigate to="/projects" replace />,
          },
        ],
      },
    ],
  },
])
