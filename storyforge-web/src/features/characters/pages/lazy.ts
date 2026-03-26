import { lazy } from 'react'

export const CharactersListingSection = lazy(() =>
  import('@/features/characters/pages/CharactersListingSection').then((module) => ({
    default: module.CharactersListingSection,
  })),
)
