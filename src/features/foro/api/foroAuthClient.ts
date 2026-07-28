import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import FORO_ENV from './foroApiConfig'
import { ForoApiError, notifyForoUnauthenticated, type HttpMethod } from './foroApiRequest'

/**
 * Better Auth SDK client, scoped to `/auth/*` only. Every other foro
 * endpoint (publications, interactions, images, …) keeps going through
 * `foroApiRequest` — see that file's header comment.
 *
 * `basePath: '/auth'` matches the backend's non-default mount
 * (`cpe-foro-backend/src/lib/auth.ts`). `inferAdditionalFields` takes an
 * inline schema so no cross-repo `typeof auth` import is needed — `role`
 * stays hand-typed via `ForoUserDTO`, deliberately NOT re-derived here.
 * `customSessionClient` is intentionally not used for the same reason.
 */
export const foroAuthClient = createAuthClient({
  baseURL: FORO_ENV.API_BASE_URL,
  basePath: '/auth',
  // `required: false, input: false` mirrors the backend's own declaration
  // (`cpe-foro-backend/src/lib/auth.ts`) — `roleId` is server-assigned and
  // never sent by the client. Without `input: false` here, TypeScript would
  // demand `roleId` as a required field on `signUp.email`'s input.
  plugins: [inferAdditionalFields({ user: { roleId: { type: 'number', required: false, input: false } } })],
})

/**
 * Shape of the `error` half of the SDK's `{data, error}` return
 * (`BetterFetchError & {message?, code?}` merged with the parsed JSON body —
 * see `@better-fetch/fetch`'s `initializePlugins`). Better Auth's captcha
 * plugin and base auth routes both respond `{message, code}` on failure.
 */
interface BetterAuthClientError {
  status?: number
  statusText?: string
  message?: string
  code?: string
}

/**
 * Adapter that keeps the throw-based contract every call site already
 * expects (`ForoAuthDialog.tsx`, `getForoApiErrorMessage`). Converts the
 * SDK's non-throwing `{data, error}` result into a thrown `ForoApiError` so
 * no call site has to change. Also dispatches `foro:unauthenticated` on a
 * 401 — see `foroApiRequest.ts`'s error path for the matching branch and
 * `ForoAuthProvider` for the listener.
 */
export function toForoApiError(
  error: BetterAuthClientError,
  endpoint: string,
  method: HttpMethod = 'POST',
): ForoApiError {
  if (error.status === 401) notifyForoUnauthenticated()

  return new ForoApiError(
    error.status ?? 0,
    error.statusText ?? '',
    { message: error.message, code: error.code },
    { endpoint, method, retryAfterMs: null },
  )
}
