import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { foroService } from '../services'
import { mapInteractionDTO } from '../mappers'
import { INTERACTION_TYPE_IDS } from '../dtos'
import type { InteractionDTO, InteractionCountsDTO, PublicationDTO, PublicationPreviewDTO } from '../dtos'
import { useForoAuth } from '../auth/foroAuthContext'
import { foroKeys } from './foroKeys'

// ── Comment-tree helpers (pure, recursive) ──
// The cache stores the RAW `InteractionDTO[]` tree (pre-`mapInteractionDTO`,
// same convention as every other viewmodel here) with nesting capped at
// `MAX_COMMENT_DEPTH` (2) server-side — these never need to recurse deeper
// than the data actually is.

/** Appends `newNode` as a top-level comment (`parentId` undefined) or as a reply under the
 *  node with id `parentId`, wherever it lives in the tree. */
function insertReply(nodes: InteractionDTO[], parentId: number | undefined, newNode: InteractionDTO): InteractionDTO[] {
  if (parentId === undefined) return [...nodes, newNode]
  return nodes.map((node) => {
    if (node.id === parentId) {
      return { ...node, replies: [...(node.replies ?? []), newNode], replies_count: (node.replies_count ?? 0) + 1 }
    }
    if (node.replies?.length) {
      return { ...node, replies: insertReply(node.replies, parentId, newNode) }
    }
    return node
  })
}

/** Applies `updater` to the node with id `id`, wherever it lives in the tree. Leaves the
 *  tree untouched (same reference) if `id` isn't found. */
function updateCommentNode(nodes: InteractionDTO[], id: number, updater: (node: InteractionDTO) => InteractionDTO): InteractionDTO[] {
  return nodes.map((node) => {
    if (node.id === id) return updater(node)
    if (node.replies?.length) return { ...node, replies: updateCommentNode(node.replies, id, updater) }
    return node
  })
}

/** Removes the node with id `id` and, since it's nested under its parent, its whole subtree
 *  with it (mirrors the backend's `ON DELETE CASCADE` on `parent_id`). */
function removeCommentNode(nodes: InteractionDTO[], id: number): InteractionDTO[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => (node.replies?.length ? { ...node, replies: removeCommentNode(node.replies, id) } : node))
}

/**
 * `GET /publications/:id/comments` — public, full comment tree (replies
 * nested up to `MAX_COMMENT_DEPTH`). Used by every publication template
 * (not just Discusión — Paper/Podcast/Novedad all mount the same thread) and
 * by regular comment counts. The route needs no session, but the key is
 * still scoped by `userId` (see `foroKeys.comments`) because each node's
 * `viewer_favorited` is per-viewer — a sign-out/sign-in transition in the
 * same tab can't be allowed to serve the previous user's flags.
 */
export function useComments(publicationId: number | undefined) {
  const { user } = useForoAuth()
  return useQuery({
    queryKey: foroKeys.comments(user?.id ?? null, publicationId ?? 0),
    queryFn: ({ signal }) => foroService.listComments(publicationId as number, signal),
    select: (dtos) => dtos.map(mapInteractionDTO),
    enabled: typeof publicationId === 'number' && publicationId > 0,
  })
}

export function useCommentMutations(publicationId: number) {
  const qc = useQueryClient()
  const { user } = useForoAuth()
  const commentsKey = () => foroKeys.comments(user?.id ?? null, publicationId)
  const invalidate = () => qc.invalidateQueries({ queryKey: commentsKey() })

  /** `parentId` makes this a reply instead of a root comment; the backend re-parents
   *  (flattens) anything past `MAX_COMMENT_DEPTH` rather than rejecting it. */
  const create = useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: number }) =>
      foroService.createInteraction({
        publication_id: publicationId,
        type_id: INTERACTION_TYPE_IDS.comentario,
        content,
        parent_id: parentId,
      }),
    onMutate: async ({ content, parentId }) => {
      await qc.cancelQueries({ queryKey: commentsKey() })
      const previous = qc.getQueryData<InteractionDTO[]>(commentsKey())
      // Echoes the CURRENT user's own name/id locally so `CommentList` renders
      // the real byline immediately instead of a placeholder — the server
      // value (same value, just round-tripped) wins once `onSettled` refetches.
      const optimisticRow: InteractionDTO = {
        id: -Date.now(),
        publication_id: publicationId,
        type_id: INTERACTION_TYPE_IDS.comentario,
        parent_id: parentId ?? null,
        depth: 0, // corrected on refetch — the optimistic row is already inserted at the right tree position
        user_id: user?.id ?? null,
        created_by: user?.id,
        created_by_name: user?.name ?? null,
        content,
        images: [],
        created_at: new Date().toISOString(),
        updated_at: null,
        favorites_count: 0,
        replies_count: 0,
        viewer_favorited: false,
        replies: [],
      }
      qc.setQueryData<InteractionDTO[]>(commentsKey(), (old) => insertReply(old ?? [], parentId, optimisticRow))
      return { previous }
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(commentsKey(), ctx?.previous),
    onSettled: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      foroService.updateInteraction(id, { content }),
    onMutate: async ({ id, content }) => {
      await qc.cancelQueries({ queryKey: commentsKey() })
      const previous = qc.getQueryData<InteractionDTO[]>(commentsKey())
      qc.setQueryData<InteractionDTO[]>(commentsKey(), (old) =>
        updateCommentNode(old ?? [], id, (node) => ({ ...node, content, updated_at: new Date().toISOString() })),
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(commentsKey(), ctx?.previous),
    onSettled: invalidate,
  })

  /** Prunes the whole subtree locally — matches the backend's `ON DELETE CASCADE` on `parent_id`. */
  const remove = useMutation({
    mutationFn: (id: number) => foroService.deleteInteraction(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: commentsKey() })
      const previous = qc.getQueryData<InteractionDTO[]>(commentsKey())
      qc.setQueryData<InteractionDTO[]>(commentsKey(), (old) => removeCommentNode(old ?? [], id))
      return { previous }
    },
    onError: (_err, _id, ctx) => qc.setQueryData(commentsKey(), ctx?.previous),
    onSettled: invalidate,
  })

  return { create, update, remove, error: create.error ?? update.error ?? remove.error ?? null }
}

/**
 * Maps an interaction type id to the `InteractionCountsDTO` field it
 * increments — used to bump the publication detail's (and every cached
 * list's) counter optimistically when toggling a publication-level
 * interaction. `comentario` has no toggle (comments are created/edited/
 * deleted via `useCommentMutations`, never via `useInteractionToggle`), it's
 * only listed here for completeness of the type→field mapping.
 */
const INTERACTION_COUNT_FIELD: Partial<Record<number, keyof InteractionCountsDTO>> = {
  [INTERACTION_TYPE_IDS.favorito]: 'favorites',
  [INTERACTION_TYPE_IDS.guardado]: 'saves',
  [INTERACTION_TYPE_IDS.visita]: 'visits',
  [INTERACTION_TYPE_IDS.comentario]: 'comments',
}

function patchPublicationViewer(
  dto: PublicationDTO,
  field: keyof InteractionCountsDTO | undefined,
  viewerField: 'favorited' | 'saved' | null,
  delta: 1 | -1,
  viewerValue: boolean,
): PublicationDTO {
  const next: PublicationDTO = { ...dto }
  if (field) {
    const current = dto.interactions?.[field] ?? 0
    next.interactions = { ...dto.interactions, [field]: Math.max(0, current + delta) }
  }
  if (viewerField) {
    next.viewer = { favorited: dto.viewer?.favorited ?? false, saved: dto.viewer?.saved ?? false, [viewerField]: viewerValue }
  }
  return next
}

function patchPreviewViewer(
  dto: PublicationPreviewDTO,
  field: keyof InteractionCountsDTO | undefined,
  viewerField: 'favorited' | 'saved' | null,
  delta: 1 | -1,
  viewerValue: boolean,
): PublicationPreviewDTO {
  const next: PublicationPreviewDTO = { ...dto }
  if (field) {
    const current = dto.interactions?.[field] ?? 0
    next.interactions = { ...dto.interactions, [field]: Math.max(0, current + delta) }
  }
  if (viewerField) {
    next.viewer = { favorited: dto.viewer?.favorited ?? false, saved: dto.viewer?.saved ?? false, [viewerField]: viewerValue }
  }
  return next
}

/**
 * Favoritos y guardados sobre una publicación, o favoritos sobre un
 * comentario (`parentId`). Antes esta mutación bajaba la lista completa de
 * interacciones del usuario para encontrar el id de la fila propia y poder
 * borrarla; ahora `add` hace POST y `remove` hace `DELETE /interactions` por
 * TARGET (`publication_id`/`type_id`/`parent_id`, ver
 * `foroService.deleteInteractionByTarget`), así que nunca hace falta conocer
 * ese id ni mantener una lista de interacciones aparte.
 *
 * El estado propio ("¿ya lo marqué?") viaja embebido:
 * - Sin `parentId` (target = la publicación): `publication.viewer.favorited`
 *   / `.saved`, en el detalle Y en cada lista cacheada donde aparezca la
 *   publicación — antes el optimismo sólo tocaba el detalle.
 * - Con `parentId` (target = un comentario, sólo tiene sentido para
 *   `favorito`): `viewer_favorited`/`favorites_count` en el nodo
 *   correspondiente del árbol de comentarios cacheado.
 */
export function useInteractionToggle(publicationId: number, typeId: number, parentId?: number) {
  const qc = useQueryClient()
  const { user } = useForoAuth()
  const pubKey = foroKeys.publication(publicationId)
  const commentsKey = foroKeys.comments(user?.id ?? null, publicationId)

  const field = INTERACTION_COUNT_FIELD[typeId]
  const viewerField: 'favorited' | 'saved' | null =
    typeId === INTERACTION_TYPE_IDS.favorito ? 'favorited' : typeId === INTERACTION_TYPE_IDS.guardado ? 'saved' : null

  const applyToPublication = (delta: 1 | -1, viewerValue: boolean) => {
    qc.setQueryData<PublicationDTO | undefined>(pubKey, (old) =>
      old ? patchPublicationViewer(old, field, viewerField, delta, viewerValue) : old,
    )
    qc.setQueriesData<PublicationPreviewDTO[] | undefined>(
      { queryKey: foroKeys.publicationsPrefix() },
      (old) => old?.map((p) => (p.id === publicationId ? patchPreviewViewer(p, field, viewerField, delta, viewerValue) : p)),
    )
  }

  const applyToComment = (delta: 1 | -1, viewerValue: boolean) => {
    if (parentId === undefined) return
    qc.setQueryData<InteractionDTO[]>(commentsKey, (old) =>
      old
        ? updateCommentNode(old, parentId, (node) => ({
            ...node,
            favorites_count: Math.max(0, (node.favorites_count ?? 0) + delta),
            viewer_favorited: viewerValue,
          }))
        : old,
    )
  }

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: pubKey })
    void qc.invalidateQueries({ queryKey: foroKeys.publicationsPrefix() })
    if (parentId !== undefined) void qc.invalidateQueries({ queryKey: commentsKey })
  }

  const add = useMutation({
    mutationFn: () => foroService.createInteraction({ publication_id: publicationId, type_id: typeId, parent_id: parentId }),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: pubKey })
      await qc.cancelQueries({ queryKey: foroKeys.publicationsPrefix() })
      const previousPublication = qc.getQueryData<PublicationDTO>(pubKey)
      const previousLists = qc.getQueriesData<PublicationPreviewDTO[]>({ queryKey: foroKeys.publicationsPrefix() })
      let previousComments: InteractionDTO[] | undefined
      if (parentId !== undefined) {
        await qc.cancelQueries({ queryKey: commentsKey })
        previousComments = qc.getQueryData<InteractionDTO[]>(commentsKey)
        applyToComment(1, true)
      } else {
        applyToPublication(1, true)
      }
      return { previousPublication, previousLists, previousComments }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousPublication !== undefined) qc.setQueryData(pubKey, ctx.previousPublication)
      ctx?.previousLists?.forEach(([key, data]) => qc.setQueryData(key, data))
      if (ctx?.previousComments !== undefined) qc.setQueryData(commentsKey, ctx.previousComments)
    },
    onSettled: invalidate,
  })

  const remove = useMutation({
    mutationFn: () => foroService.deleteInteractionByTarget({ publication_id: publicationId, type_id: typeId, parent_id: parentId }),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: pubKey })
      await qc.cancelQueries({ queryKey: foroKeys.publicationsPrefix() })
      const previousPublication = qc.getQueryData<PublicationDTO>(pubKey)
      const previousLists = qc.getQueriesData<PublicationPreviewDTO[]>({ queryKey: foroKeys.publicationsPrefix() })
      let previousComments: InteractionDTO[] | undefined
      if (parentId !== undefined) {
        await qc.cancelQueries({ queryKey: commentsKey })
        previousComments = qc.getQueryData<InteractionDTO[]>(commentsKey)
        applyToComment(-1, false)
      } else {
        applyToPublication(-1, false)
      }
      return { previousPublication, previousLists, previousComments }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousPublication !== undefined) qc.setQueryData(pubKey, ctx.previousPublication)
      ctx?.previousLists?.forEach(([key, data]) => qc.setQueryData(key, data))
      if (ctx?.previousComments !== undefined) qc.setQueryData(commentsKey, ctx.previousComments)
    },
    onSettled: invalidate,
  })

  return { add, remove, error: add.error ?? remove.error ?? null }
}
