import { lazy } from 'react'

export const CharacterRelationsListingSection = lazy(() =>
  import('@/features/character-relations/pages/CharacterRelationsListingSection').then((module) => ({
    default: module.CharacterRelationsListingSection,
  })),
)
