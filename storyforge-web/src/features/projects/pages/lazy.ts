import { lazy } from 'react'

export const ProjectEditorModal = lazy(() =>
  import('@/features/projects/pages/ProjectEditorModal').then((module) => ({ default: module.ProjectEditorModal })),
)

export const ProjectsListingSection = lazy(() =>
  import('@/features/projects/pages/ProjectsListingSection').then((module) => ({
    default: module.ProjectsListingSection,
  })),
)
