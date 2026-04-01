import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactService } from '../services'
import { fileService } from '@features/content/services'

export const candidateKeys = {
  all: ['candidates'] as const,
  list: () => [...candidateKeys.all, 'list'] as const,
  detail: (id: number) => [...candidateKeys.all, 'detail', id] as const,
}

/** Listar candidatos activos */
export function useCandidatesList() {
  return useQuery({
    queryKey: candidateKeys.list(),
    queryFn: ({ signal }) => contactService.listCandidates(signal),
    select: (data) => data.candidates,
  })
}

/** Detalle de candidato */
export function useCandidateDetail(id: number) {
  return useQuery({
    queryKey: candidateKeys.detail(id),
    queryFn: ({ signal }) => contactService.getCandidate(id, signal),
    select: (data) => data.candidate,
    enabled: id > 0,
  })
}

/** Soft-delete candidato */
export function useDeleteCandidate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => contactService.deleteCandidate(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: candidateKeys.list() })
    },
  })
}

/** Descargar CV — obtiene URL temporal y abre en nueva pestaña */
export function useDownloadCV() {
  return useMutation({
    mutationFn: async (fileId: number) => {
      const { url } = await fileService.getDownloadUrl(fileId)
      window.open(url, '_blank')
    },
  })
}
