import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { foroService } from '../services'
import { mapMyInteractionDTO, mapUserPreferencesDTO } from '../mappers'
import type { ListMyInteractionsParams } from '../models'
import type { UpdateUserPreferencesDTO, UpdateUserDTO } from '../dtos'
import { ForoApiError } from '../api/foroApiRequest'
import { foroKeys } from './foroKeys'

/**
 * GET /interactions/me — the signed-in user's own interactions of a given
 * type (e.g. saved/liked publications for the profile screen), each row
 * already carrying its parent publication preview so cards render without a
 * second round-trip.
 */
export function useMyInteractions(params: ListMyInteractionsParams) {
  return useQuery({
    queryKey: foroKeys.myInteractions(params),
    queryFn: ({ signal }) =>
      foroService.getMyInteractions(
        { type_id: params.typeId, limit: params.limit, offset: params.offset },
        signal,
      ),
    select: (dtos) => dtos.map(mapMyInteractionDTO),
  })
}

/**
 * GET/PATCH /users/me/preferences.
 *
 * The backend route does not exist yet — this hook codifies the agreed
 * contract ahead of the backend landing it. Every call currently 404s, so
 * `retry: false` avoids hammering a route that can't succeed, and
 * `isUnavailable` flips true specifically on a 404 `ForoApiError` (any other
 * failure still surfaces through `query.error` as normal) so the profile
 * screen can render disabled toggles + a "coming soon" notice instead of an
 * error state.
 */
export function useUserPreferences() {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: foroKeys.userPreferences(),
    queryFn: ({ signal }) => foroService.getUserPreferences(signal),
    select: mapUserPreferencesDTO,
    retry: false,
  })

  const isUnavailable = query.error instanceof ForoApiError && query.error.status === 404

  const update = useMutation({
    mutationFn: (data: UpdateUserPreferencesDTO) => foroService.updateUserPreferences(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: foroKeys.userPreferences() }),
  })

  return { data: query.data, isLoading: query.isLoading, isUnavailable, update }
}

/**
 * POST /auth/update-user (Better Auth) — profile name/avatar update.
 * Invalidates the session query on success so the header avatar/byline
 * (sourced from ForoAuthProvider's `foroKeys.session()` query) refresh
 * immediately, without a manual `refetch()` call from the UI.
 */
export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateUserDTO) => foroService.updateUser(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: foroKeys.session() }),
  })
}
