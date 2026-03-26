import { lazy } from 'react'

export const ChaptersListingSection = lazy(() =>
  import('@/features/chapters/pages/ChaptersListingSection').then((module) => ({
    default: module.ChaptersListingSection,
  })),
)
