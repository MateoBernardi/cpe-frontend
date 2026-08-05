import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { foroService } from '../services'
import { mapInteractionDTO } from '../mappers'
import { INTERACTION_TYPE_IDS } from '../dtos'
import type { InteractionDTO, InteractionCountsDTO, MyInteractionDTO, PublicationDTO, PublicationPreviewDTO } from '../dtos'
import { useForoAuth } from '../auth/foroAuthContext'
import { foroKeys } from './foroKeys'

/**
 * Cuánto esperar antes de sacar una fila de `GET /interactions/me` cuando se hace `remove` sobre un
 * favorito/guardado de PUBLICACIÓN (ver `removeFromMyInteractions` en `useInteractionToggle`). En
 * `GuardadosPanel`/`InteraccionesPanel` esa fila ES la interacción y trae el propio botón adentro,
 * así que sacarla en el mismo tick del click desmontaba el botón antes de que su animación
 * (`interaction-toggle-pop`/`-drop`, `index.css`) llegara a jugar. 300ms cubre la más larga de las
 * dos (`pop`, 280ms) con margen.
 */
const MY_INTERACTIONS_REMOVE_DELAY_MS = 300

// ── Comment-tree helpers (pure, recursive) ──
// The cache stores the RAW `InteractionDTO[]` tree (pre-`mapInteractionDTO`,
// same convention as every other viewmodel here) with nesting capped at
// `MAX_COMMENT_DEPTH` (2) server-side — these never need to recurse deeper
// than the data actually is.

/**
 * Una fila optimista todavía no tiene id del servidor: `onMutate` le pone `-Date.now()` (ver
 * `create` abajo, donde ese id sintético es además todo lo que hace falta para deshacerla). Los ids
 * reales son `serial` de Postgres, siempre positivos, así que el signo alcanza para distinguirlas.
 * Se exporta porque la UI necesita saberlo para pintar el comentario como "Posteando…" y para no
 * ofrecer acciones (favorito/responder/editar/borrar) sobre una fila que el backend todavía no
 * conoce.
 */
export const isOptimisticInteraction = (id: number): boolean => id < 0

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
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: commentsKey() })
    // Un comentario es una interacción, así que también aparece en el panel "Interacciones" del
    // perfil (`GET /interactions/me`). Sin esto, comentar y después ir al perfil mostraba la lista
    // vieja hasta que algo más la invalidara.
    void qc.invalidateQueries({ queryKey: foroKeys.myInteractionsPrefix() })
    // El contador de comentarios de la publicación vive en el DTO de detalle y en cada preview
    // cacheada, así que crear o borrar un comentario los deja desactualizados.
    void qc.invalidateQueries({ queryKey: foroKeys.publication(publicationId) })
    void qc.invalidateQueries({ queryKey: foroKeys.publicationsPrefix() })
  }

  /** `parentId` makes this a reply instead of a root comment; the backend re-parents
   *  (flattens) anything past `MAX_COMMENT_DEPTH` rather than rejecting it. */
  const create = useMutation({
    // `idempotencyKey` se destructura ACÁ y no llega a `foroService.createInteraction` embebido en
    // el body — viaja aparte como header. `onMutate` de abajo sigue destructurando sólo
    // `{content, parentId}`, así que la key nunca llega al optimistic row. Ver `useIdempotencyKey`.
    mutationFn: ({ content, parentId, idempotencyKey }: { content: string; parentId?: number; idempotencyKey?: string }) =>
      foroService.createInteraction(
        {
          publication_id: publicationId,
          type_id: INTERACTION_TYPE_IDS.comentario,
          content,
          parent_id: parentId,
        },
        idempotencyKey,
      ),
    onMutate: async ({ content, parentId }) => {
      await qc.cancelQueries({ queryKey: commentsKey() })
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
      // El id sintético es todo lo que hace falta para deshacer: no se guarda snapshot (ver abajo).
      return { optimisticId: optimisticRow.id }
    },
    // No restauramos el snapshot: en React Query v5 `setQueryData(key, undefined)` hace bail-out y
    // no toca la caché. `ctx.previous` es `undefined` cada vez que la entrada de caché no existía al
    // momento del submit (hilo recién cargado / cancelado por el `cancelQueries` de arriba) — y sin
    // embargo `onMutate` SÍ crea la entrada desde cero vía `insertReply(old ?? [], …)`. Resultado:
    // el rollback por snapshot era un no-op y la fila optimista quedaba. Tampoco alcanza con el
    // `invalidateQueries` de `onSettled`: con `refetchOnMount: false` + `staleTime: 30min`
    // (`App.tsx`), si la query ya no está activa cuando llega el 422 la invalidación no refetchea
    // nada. Podar por id evita depender de ninguna de las dos cosas.
    onError: (_err, _vars, ctx) => {
      if (ctx?.optimisticId === undefined) return
      qc.setQueryData<InteractionDTO[]>(commentsKey(), (old) => (old ? removeCommentNode(old, ctx.optimisticId) : old))
    },
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
  // Handle del `setTimeout` que difiere `removeFromMyInteractions` (ver más abajo). Vive en un ref
  // porque sólo lo lee/cancela código imperativo (`onMutate`/`onError`), nunca el render.
  const removeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Cubre la ventana entre que el DELETE de `remove` termina y el `setTimeout` de arriba dispara:
  // sin esto, un segundo click en ese hueco (poco probable pero posible con una respuesta rápida del
  // servidor) volvería a llamar `remove.mutate()` — `active` en estos botones viene fijo en `true`
  // desde los paneles del perfil, así que un segundo DELETE sobre un target ya borrado sólo
  // conseguiría un 404 (`deleteInteractionByTargetService` en el backend). `InteractionToggleButton`
  // la suma a `add.isPending || remove.isPending` para extender la guarda de reentrada.
  const [isRemovingRow, setIsRemovingRow] = useState(false)

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

  /**
   * Saca la fila correspondiente de las listas de `GET /interactions/me`.
   *
   * En los paneles del perfil la fila ES la interacción, así que no hay ningún flag que invertir:
   * `<SaveButton saved>` / `<FavoriteButton favorited>` se renderizan ahí siempre encendidos. Sin
   * esto, quitar un guardado desde el panel no producía NINGÚN cambio visible hasta que volvía la
   * invalidación — el botón se veía igual y la fila seguía en su lugar.
   *
   * Sólo aplica al target-publicación: un favorito sobre un comentario no aparece en estos paneles.
   *
   * Se llama diferida (ver `remove` más abajo), nunca sincrónicamente desde `onMutate`: en
   * `GuardadosPanel`/`InteraccionesPanel` la fila de `<InteractionCard>` ES la interacción, con el
   * propio botón adentro — filtrarla en el mismo tick del click desmontaba la fila (y el botón) antes
   * de que `active:scale-[...]`/el pop-drop de `InteractionToggleButton` llegaran a pintar un solo
   * frame.
   */
  const removeFromMyInteractions = () => {
    if (parentId !== undefined) return
    qc.setQueriesData<MyInteractionDTO[] | undefined>(
      { queryKey: foroKeys.myInteractionsPrefix() },
      (old) => old?.filter((row) => !(row.publication.id === publicationId && row.type_id === typeId)),
    )
    setIsRemovingRow(false)
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
    // `GET /interactions/me` alimenta los paneles "Guardados" e "Interacciones" del perfil, y sus
    // filas SON estas interacciones: sin esto, quitar un guardado desde el panel deja la fila
    // colgada hasta el próximo refetch por otro motivo.
    void qc.invalidateQueries({ queryKey: foroKeys.myInteractionsPrefix() })
  }

  const add = useMutation({
    // Variables = la idempotency key sola (o `undefined`), no un objeto — `add.mutate(keyFor(...))`
    // en `InteractionToggleButton`. Sólo el POST (`add`) lleva key; `remove` es un DELETE, fuera del
    // alcance de este esquema (ver `ancient-churning-pony.md`).
    mutationFn: (idempotencyKey: string | undefined) =>
      foroService.createInteraction({ publication_id: publicationId, type_id: typeId, parent_id: parentId }, idempotencyKey),
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
      await qc.cancelQueries({ queryKey: foroKeys.myInteractionsPrefix() })
      const previousPublication = qc.getQueryData<PublicationDTO>(pubKey)
      const previousLists = qc.getQueriesData<PublicationPreviewDTO[]>({ queryKey: foroKeys.publicationsPrefix() })
      const previousMyInteractions = qc.getQueriesData<MyInteractionDTO[]>({ queryKey: foroKeys.myInteractionsPrefix() })
      let previousComments: InteractionDTO[] | undefined
      if (parentId !== undefined) {
        await qc.cancelQueries({ queryKey: commentsKey })
        previousComments = qc.getQueryData<InteractionDTO[]>(commentsKey)
        applyToComment(-1, false)
      } else {
        applyToPublication(-1, false)
      }
      // Diferido `MY_INTERACTIONS_REMOVE_DELAY_MS` (> la más larga de `interaction-toggle-pop`/`-drop`
      // en `index.css`) en vez de correr en el mismo tick — ver el comentario de
      // `removeFromMyInteractions`. `isRemovingRow` queda prendido durante la espera para que
      // `InteractionToggleButton` siga tratando al botón como ocupado y la guarda de reentrada de su
      // `handleClick` no deje pasar un segundo click contra un target que el servidor ya borró.
      if (removeTimeoutRef.current) clearTimeout(removeTimeoutRef.current)
      if (parentId === undefined) setIsRemovingRow(true)
      removeTimeoutRef.current = setTimeout(removeFromMyInteractions, MY_INTERACTIONS_REMOVE_DELAY_MS)
      return { previousPublication, previousLists, previousMyInteractions, previousComments }
    },
    onError: (_err, _vars, ctx) => {
      // La mutación falló: cancelamos la baja diferida para no volver a sacar (ni intentarlo sobre
      // datos que estamos a punto de restaurar) una fila que en definitiva sigue existiendo.
      if (removeTimeoutRef.current) {
        clearTimeout(removeTimeoutRef.current)
        removeTimeoutRef.current = null
      }
      setIsRemovingRow(false)
      if (ctx?.previousPublication !== undefined) qc.setQueryData(pubKey, ctx.previousPublication)
      ctx?.previousLists?.forEach(([key, data]) => qc.setQueryData(key, data))
      ctx?.previousMyInteractions?.forEach(([key, data]) => qc.setQueryData(key, data))
      if (ctx?.previousComments !== undefined) qc.setQueryData(commentsKey, ctx.previousComments)
    },
    onSettled: invalidate,
  })

  return { add, remove, error: add.error ?? remove.error ?? null, isRemovingRow }
}
