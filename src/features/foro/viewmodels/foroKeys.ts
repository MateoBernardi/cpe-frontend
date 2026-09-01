import type { ListPublicationsParams, ListMyInteractionsParams } from '../models'

/** Query-key factory for the Foro feature (mirrors `contentKeys`). */
export const foroKeys = {
  all: ['foro'] as const,
  session: () => [...foroKeys.all, 'session'] as const,
  publicationTypes: () => [...foroKeys.all, 'publication-types'] as const,
  categories: () => [...foroKeys.all, 'categories'] as const,
  /**
   * Prefix shared by every `publications(params)` variant. Invalidate/patch
   * THIS (not a repeated `[...foroKeys.all, 'publications']` literal) to hit
   * every cached list at once regardless of its filter params — used by the
   * optimistic publication mutations and by `useInteractionToggle` to bump a
   * publication's counters in every list it happens to be cached in.
   */
  publicationsPrefix: () => [...foroKeys.all, 'publications'] as const,
  publications: (params?: ListPublicationsParams) =>
    [...foroKeys.publicationsPrefix(), params ?? {}] as const,
  publication: (id: number) => [...foroKeys.all, 'publication', id] as const,
  /**
   * `userId` is a cache-scoping dimension, not a filter: it keeps one
   * signed-in user's entries from being served (stale) to the next signed-in
   * user in the same tab after a sign-out/sign-in transition. Pass `null`
   * for signed-out callers. Needed here because `viewer_favorited` on each
   * comment node is per-user, even though `GET /publications/:id/comments`
   * itself is public.
   */
  comments: (userId: string | null, publicationId: number) =>
    [...foroKeys.all, 'comments', userId, publicationId] as const,
  /** Prefix shared by every `myInteractions(userId, params)` variant — same rationale as `publicationsPrefix`. */
  myInteractionsPrefix: () => [...foroKeys.all, 'my-interactions'] as const,
  myInteractions: (userId: string | null, params: ListMyInteractionsParams) =>
    [...foroKeys.myInteractionsPrefix(), userId, params] as const,
  userPreferences: (userId: string | null) => [...foroKeys.all, 'user-preferences', userId] as const,
  corrections: (publicationId: number) => [...foroKeys.all, 'corrections', publicationId] as const,
}
