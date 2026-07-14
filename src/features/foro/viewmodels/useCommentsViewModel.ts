import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { foroService } from '../services'
import { mapInteractionDTO } from '../mappers'
import { INTERACTION_TYPE_IDS } from '../dtos'
import { foroKeys } from './foroKeys'

/**
 * Comments are flat interactions with `type_id = INTERACTION_TYPE_IDS.comentario` (2).
 * Used both by the Discusión detail screen (publication = OP, comments = replies)
 * and by regular Paper/Podcast/Novedad comment counts/lists.
 */
export function useComments(publicationId: number | undefined) {
  return useQuery({
    queryKey: foroKeys.interactions(publicationId ?? 0, INTERACTION_TYPE_IDS.comentario),
    queryFn: ({ signal }) =>
      foroService.listInteractionsForPublication(publicationId as number, INTERACTION_TYPE_IDS.comentario, signal),
    select: (dtos) => dtos.map(mapInteractionDTO),
    enabled: typeof publicationId === 'number' && publicationId > 0,
  })
}

export function useCommentMutations(publicationId: number) {
  const qc = useQueryClient()
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: foroKeys.interactions(publicationId, INTERACTION_TYPE_IDS.comentario) })

  const create = useMutation({
    mutationFn: (content: string) =>
      foroService.createInteraction({
        publication_id: publicationId,
        type_id: INTERACTION_TYPE_IDS.comentario,
        content,
      }),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      foroService.updateInteraction(id, { content }),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: number) => foroService.deleteInteraction(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}

/** Generic (non-comment) interactions: like/upvote/guardado/visita — idempotent per (publication,user,type). */
export function useInteractionToggle(publicationId: number, typeId: number) {
  const qc = useQueryClient()
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: foroKeys.publication(publicationId) })
  }

  const add = useMutation({
    mutationFn: () => foroService.createInteraction({ publication_id: publicationId, type_id: typeId }),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (interactionId: number) => foroService.deleteInteraction(interactionId),
    onSuccess: invalidate,
  })

  return { add, remove }
}
