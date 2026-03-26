import { lazy } from 'react'

export const WorldTemplateEditorModal = lazy(() =>
  import('@/features/world-templates/pages/WorldTemplateEditorModal').then((module) => ({
    default: module.WorldTemplateEditorModal,
  })),
)

export const WorldTemplatesListingSection = lazy(() =>
  import('@/features/world-templates/pages/WorldTemplatesListingSection').then((module) => ({
    default: module.WorldTemplatesListingSection,
  })),
)
