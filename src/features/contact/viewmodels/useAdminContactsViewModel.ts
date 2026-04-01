import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactService } from '../services'

export const contactKeys = {
  all: ['contacts'] as const,
  list: () => [...contactKeys.all, 'list'] as const,
}

/** Listar leads activos */
export function useContactsList() {
  return useQuery({
    queryKey: contactKeys.list(),
    queryFn: ({ signal }) => contactService.listContacts(signal),
    select: (data) => data.contacts,
  })
}

/** Soft-delete de un lead */
export function useDeleteContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => contactService.deleteContact(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: contactKeys.list() })
    },
  })
}
