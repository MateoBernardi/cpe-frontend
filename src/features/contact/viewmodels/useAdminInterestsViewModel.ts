import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactService } from '../services'
import type { CreateInterestDTO, PatchInterestDTO } from '../dtos'

export const interestKeys = {
  all: ['interests'] as const,
  list: () => [...interestKeys.all, 'list'] as const,
}

/** Listar todos los puestos (activos + inactivos) */
export function useInterestsList() {
  return useQuery({
    queryKey: interestKeys.list(),
    queryFn: ({ signal }) => contactService.listInterests(signal),
    select: (data) => data.interests,
  })
}

/** Crear puesto nuevo */
export function useCreateInterest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInterestDTO) => contactService.createInterest(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: interestKeys.list() })
    },
  })
}

/** Toggle activo / editar nombre */
export function usePatchInterest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchInterestDTO }) =>
      contactService.patchInterest(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: interestKeys.list() })
    },
  })
}
