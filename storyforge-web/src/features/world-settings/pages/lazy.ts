import { lazy } from 'react'

export const ProjectWorldSettingsListingSection = lazy(() =>
  import('@/features/world-settings/pages/ProjectWorldSettingsListingSection').then((module) => ({
    default: module.ProjectWorldSettingsListingSection,
  })),
)
