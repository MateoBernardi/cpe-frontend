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
  /**
   * `userId` is a cache-scoping dimension, not a filter: it keeps one
   * signed-in user's entries from being served (stale) to the next signed-in
   * user in the same tab after a sign-out/sign-in transition. Pass `null`
   * for signed-out callers.
   */
  interactions: (userId: string | null, publicationId: number, typeId?: number) =>
    [...foroKeys.all, 'interactions', userId, publicationId, typeId ?? null] as const,
  myInteractions: (userId: string | null, params: ListMyInteractionsParams) =>
    [...foroKeys.all, 'my-interactions', userId, params] as const,
  userPreferences: (userId: string | null) => [...foroKeys.all, 'user-preferences', userId] as const,
}
