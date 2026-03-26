import { lazy } from 'react'

export const OutlinesListingSection = lazy(() =>
  import('@/features/outlines/pages/OutlinesListingSection').then((module) => ({
    default: module.OutlinesListingSection,
  })),
)
