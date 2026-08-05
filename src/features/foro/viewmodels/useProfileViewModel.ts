import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { foroService } from '../services'
import { mapMyInteractionDTO } from '../mappers'
import type { ListMyInteractionsParams, UpdateUserPreferencesInput, UserPreferences } from '../models'
import type { UpdateUserDTO } from '../dtos'
import { ForoApiError } from '../api/foroApiRequest'
import { useForoAuth } from '../auth/foroAuthContext'
import { foroKeys } from './foroKeys'

/**
 * GET /interactions/me — the signed-in user's own interactions across one or
 * more types (e.g. comentario + favorito together for the "Interacciones"
 * panel, or just guardado for "Guardados"), each row already carrying its
 * parent publication preview so cards render without a second round-trip.
 * `typeIds` is joined into the CSV `type_ids` param the backend expects
 * (`myInteractionsQuerySchema` — was a single `type_id` before).
 */
export function useMyInteractions(params: ListMyInteractionsParams) {
  const { user, isAuthenticated } = useForoAuth()
  return useQuery({
    queryKey: foroKeys.myInteractions(user?.id ?? null, params),
    queryFn: ({ signal }) =>
      foroService.getMyInteractions(
        {
          type_ids: params.typeIds.length > 0 ? params.typeIds.join(',') : undefined,
          limit: params.limit,
          offset: params.offset,
        },
        signal,
      ),
    select: (dtos) => dtos.map(mapMyInteractionDTO),
    enabled: isAuthenticated,
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
  const { user, isAuthenticated } = useForoAuth()
  const userId = user?.id ?? null
  const key = foroKeys.userPreferences(userId)

  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => foroService.getUserPreferences(signal),
    retry: false,
    enabled: isAuthenticated,
  })

  const isUnavailable = query.error instanceof ForoApiError && query.error.status === 404

  const update = useMutation({
    mutationFn: (data: UpdateUserPreferencesInput) => foroService.updateUserPreferences(data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData<UserPreferences>(key)
      qc.setQueryData<UserPreferences>(key, (old) => ({
        emailNotifications: old?.emailNotifications ?? false,
        pushNotifications: old?.pushNotifications ?? false,
        ...data,
      }))
      return { previous }
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(key, ctx.previous)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
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
