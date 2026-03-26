export const queryKeys = {
  me: ['me'] as const,
  projects: ['projects'] as const,
  project: (projectId: number) => ['projects', projectId] as const,
  worldSettings: (projectId: number) => ['projects', projectId, 'world-settings'] as const,
  characters: (projectId: number) => ['projects', projectId, 'characters'] as const,
  characterRelations: (projectId: number) => ['projects', projectId, 'character-relations'] as const,
  outlines: (projectId: number) => ['projects', projectId, 'outlines'] as const,
  chapters: (projectId: number) => ['projects', projectId, 'chapters'] as const,
  chapterVersions: (projectId: number, chapterId: number) =>
    ['projects', projectId, 'chapters', chapterId, 'versions'] as const,
  styleConstraint: (projectId: number) => ['projects', projectId, 'style-constraint'] as const,
  worldTemplates: ['world-templates'] as const,
  worldTemplate: (templateId: number) => ['world-templates', templateId] as const,
  templateWorldSettings: (templateId: number) => ['world-templates', templateId, 'world-settings'] as const,
}
