import { lazy } from 'react'

export const LazyAppLayout = lazy(() =>
  import('@/app/layouts/AppLayout').then((module) => ({ default: module.AppLayout })),
)
