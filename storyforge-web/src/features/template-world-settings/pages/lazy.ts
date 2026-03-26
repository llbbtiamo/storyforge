import { lazy } from 'react'

export const TemplateWorldSettingsListingSection = lazy(() =>
  import('@/features/template-world-settings/pages/TemplateWorldSettingsListingSection').then((module) => ({
    default: module.TemplateWorldSettingsListingSection,
  })),
)
