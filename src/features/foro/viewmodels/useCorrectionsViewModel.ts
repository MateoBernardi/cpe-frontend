import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { foroService } from '../services'
import { mapCorrectionDTO, mapCreateCorrectionInputToDTO } from '../mappers'
import type { CreateCorrectionInput } from '../models'
import { foroKeys } from './foroKeys'

/** GET /corrections?publication_id= — enabled once a publication id is known (see `ReviewCorrectionsPanel`). */
export function useCorrections(publicationId: number | undefined) {
  return useQuery({
    queryKey: foroKeys.corrections(publicationId ?? 0),
    queryFn: ({ signal }) => foroService.getCorrections(publicationId as number, signal),
    select: (dtos) => dtos.map(mapCorrectionDTO),
    enabled: typeof publicationId === 'number' && publicationId > 0,
  })
}

/** POST /corrections — role publisher. Invalidates the same publication's correction list on success. */
export function useCorrectionMutations() {
  const qc = useQueryClient()

  const create = useMutation({
    mutationFn: (input: CreateCorrectionInput) => foroService.createCorrection(mapCreateCorrectionInputToDTO(input)),
    onSuccess: (_data, input) => {
      void qc.invalidateQueries({ queryKey: foroKeys.corrections(input.publicationId) })
    },
  })

  return { create }
}
