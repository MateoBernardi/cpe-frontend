import type { ListPublicationsParams, ListMyInteractionsParams } from '../models'

/** Query-key factory for the Foro feature (mirrors `contentKeys`). */
export const foroKeys = {
  all: ['foro'] as const,
  session: () => [...foroKeys.all, 'session'] as const,
  publicationTypes: () => [...foroKeys.all, 'publication-types'] as const,
  categories: () => [...foroKeys.all, 'categories'] as const,
  tags: () => [...foroKeys.all, 'tags'] as const,
  publications: (params?: ListPublicationsParams) =>
    [...foroKeys.all, 'publications', params ?? {}] as const,
  publication: (id: number) => [...foroKeys.all, 'publication', id] as const,
  interactions: (publicationId: number, typeId?: number) =>
    [...foroKeys.all, 'interactions', publicationId, typeId ?? null] as const,
  myInteractions: (params: ListMyInteractionsParams) =>
    [...foroKeys.all, 'my-interactions', params] as const,
  userPreferences: () => [...foroKeys.all, 'user-preferences'] as const,
}
