import FORO_ENV from './foroApiConfig'
import { getAuthErrorMessage } from './authErrorMessages'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ForoApiRequestOptions<TBody = unknown> {
  method: HttpMethod
  endpoint: string
  body?: TBody
  signal?: AbortSignal
  /** `Idempotency-Key` header — sólo se manda cuando está definida. Ver `api/idempotency.ts`. */
  idempotencyKey?: string
}

/**
 * Forma de error del backend de Foro (ver contrato sección A):
 * Zod: `400 { error, code:'VALIDATION_ERROR', details }`.
 * Dominio: `{ error:<mensaje en español>, code }`.
 * requireAuth: `401 {error:'No autenticado.'}` / `403 {error:'Permisos insuficientes.'}`.
 * Better Auth (`/auth/*`, via `foroAuthClient`'s `toForoApiError`): `{ message, code }` —
 * no `error` key. Both shapes flow through this same type so `getForoApiErrorMessage`
 * works for every foro route.
 */
interface ForoApiErrorResponse {
  error?: string
  message?: string
  code?: string
  details?: unknown
}

interface ForoApiErrorMeta {
  endpoint: string
  method: HttpMethod
  retryAfterMs: number | null
}

export class ForoApiError extends Error {
  readonly status: number
  readonly statusText: string
  readonly data: ForoApiErrorResponse
  readonly code: string | null
  readonly endpoint: string
  readonly method: HttpMethod
  readonly retryAfterMs: number | null

  constructor(
    status: number,
    statusText: string,
    data: ForoApiErrorResponse,
    meta: ForoApiErrorMeta,
  ) {
    super(data.error ?? data.message ?? statusText)
    this.name = 'ForoApiError'
    this.status = status
    this.statusText = statusText
    this.data = data
    this.code = data.code ?? null
    this.endpoint = meta.endpoint
    this.method = meta.method
    this.retryAfterMs = meta.retryAfterMs
  }
}

/**
 * Fired whenever a foro request (either `foroApiRequest` or the
 * `foroAuthClient` adapter, see `toForoApiError`) comes back 401. Mirrors
 * `src/shared/api/apiRequest.ts`'s `app:forbidden-tenant` event — a plain
 * `window` `CustomEvent` so this module never needs a `QueryClient` import.
 * `ForoAuthProvider` listens and clears the cached session so an expired
 * cookie can't leave the header rendering a signed-in user while every
 * write silently 401s.
 */
export const FORO_UNAUTHENTICATED_EVENT = 'foro:unauthenticated'

export function notifyForoUnauthenticated(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(FORO_UNAUTHENTICATED_EVENT))
}

/**
 * Fired whenever a foro write request comes back 422 with `code: 'CONTENT_REJECTED'`
 * (comments, publications, images — the automatic-moderation surface). `ModerationNoticeDialog`
 * listens and explains why. Same plain-`window`-CustomEvent idiom as `FORO_UNAUTHENTICATED_EVENT`
 * above and for the same reason: this module must never import `QueryClient`.
 */
export const FORO_CONTENT_REJECTED_EVENT = 'foro:content-rejected'

function notifyForoContentRejected(error: ForoApiError): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(FORO_CONTENT_REJECTED_EVENT, { detail: error }))
}

/** True for a 422 moderation rejection. Used to suppress the redundant inline error text next to a
 *  write (the modal already explains it) without touching how any other status renders. */
export function isContentRejected(error: unknown): boolean {
  return error instanceof ForoApiError && error.status === 422 && error.code === 'CONTENT_REJECTED'
}

/** True for a 403 unverified-email rejection from Better Auth. `ForoAuthDialog` uses this to
 *  route the user to the `check-email` screen (with its resend button) instead of showing an
 *  inline error they can't act on. */
export function isEmailNotVerified(error: unknown): boolean {
  return error instanceof ForoApiError && error.status === 403 && error.code === 'EMAIL_NOT_VERIFIED'
}

const inflightGetRequests = new Map<string, Promise<unknown>>()

function readRetryAfterMs(response: Response): number | null {
  const retryAfter = response.headers.get('retry-after')
  if (!retryAfter) return null
  const seconds = Number(retryAfter)
  if (!Number.isFinite(seconds) || seconds <= 0) return null
  return Math.round(seconds * 1000)
}

export function getForoApiErrorMessage(error: unknown): string {
  if (!(error instanceof ForoApiError)) {
    // A raw `TypeError: Failed to fetch` (or the Safari/Firefox equivalents, `Load failed` /
    // `NetworkError when attempting to fetch resource`) escapes `foroAuthClient` BEFORE
    // `toForoApiError` runs — better-auth does not set better-fetch's `catchAllError` option — so
    // this is the only place a network failure on an auth call can be caught. `AbortError` (React
    // Query cancelling an in-flight request) is a `DOMException`, not a `TypeError`, so it falls
    // through to the generic branch below untouched, as it should.
    if (
      error instanceof TypeError ||
      (error instanceof Error && /Failed to fetch|NetworkError|Load failed/.test(error.message))
    ) {
      return 'No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.'
    }
    return error instanceof Error ? error.message : 'Error inesperado. Intenta nuevamente.'
  }

  // Code lookup first: Better Auth / Turnstile codes (e.g. `EMAIL_NOT_VERIFIED`) need their own
  // sentence, not the generic per-status line below — a straight status ladder would flatten
  // `EMAIL_NOT_VERIFIED` into the same "no tenés permisos" text as any other 403.
  const codeMessage = getAuthErrorMessage(error.code)
  if (codeMessage) return codeMessage

  // SÓLO `data.error`, nunca `data.message`. Según el contrato de arriba, `error` es el texto en
  // español de nuestro backend y `message` es el de Better Auth, que viene en inglés — mostrarlo
  // como fallback filtraba cosas como "Invalid email address" al usuario. Un código de Better Auth
  // que merezca texto propio se traduce arriba, en `getAuthErrorMessage`; el resto cae en los
  // genéricos de abajo. El detalle en inglés sigue disponible en la pestaña de red y en `error.data`.
  const message = error.data.error

  if (error.status === 429) {
    const base = 'Demasiadas solicitudes. Espera unos segundos e intenta nuevamente.'
    // `retryAfterMs` is only ever populated for `foroApiRequest` calls (it reads the standard
    // `Retry-After` response header) — the auth SDK's `toForoApiError` hardcodes it to `null`
    // because Better Auth sends the non-standard `X-Retry-After` and better-fetch doesn't expose
    // response headers to the caller. So this branch only fires extra guidance for our own API.
    if (error.retryAfterMs) {
      const seconds = Math.ceil(error.retryAfterMs / 1000)
      return `${base} Podés reintentar en ${seconds} segundos.`
    }
    return base
  }
  if (error.status === 401) return message || 'Iniciá sesión para continuar.'
  if (error.status === 403) return message || 'No tenés permisos para esta acción.'
  if (error.status === 404) return 'El recurso solicitado no existe.'
  if (error.status >= 500) return 'Hubo un problema en el servidor. Intenta de nuevo en unos instantes.'

  return message || 'No se pudo completar la solicitud.'
}

function getCoalescingKey(url: string, method: HttpMethod): string {
  return `${method}|${url}`
}

/**
 * Fábrica de requests HTTP (JSON) contra el backend de Foro.
 * Siempre `credentials:'include'` (cookie de sesión Better Auth).
 * NUNCA envía `x-tenant-id` — el backend de Foro es single-tenant.
 */
export async function foroApiRequest<TResponse, TBody = unknown>(
  options: ForoApiRequestOptions<TBody>,
): Promise<TResponse> {
  const { method, endpoint, body, signal, idempotencyKey } = options

  const url = `${FORO_ENV.API_BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(idempotencyKey !== undefined ? { 'Idempotency-Key': idempotencyKey } : {}),
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
    signal,
  }

  if (body !== undefined && method !== 'GET') {
    config.body = JSON.stringify(body)
  }

  const performRequest = async (): Promise<TResponse> => {
    const response = await fetch(url, config)

    if (response.status === 204) {
      return undefined as TResponse
    }

    if (!response.ok) {
      let errorData: ForoApiErrorResponse
      try {
        errorData = (await response.json()) as ForoApiErrorResponse
      } catch {
        errorData = { error: response.statusText }
      }

      if (response.status === 401) notifyForoUnauthenticated()

      const apiError = new ForoApiError(response.status, response.statusText, errorData, {
        endpoint,
        method,
        retryAfterMs: readRetryAfterMs(response),
      })
      if (isContentRejected(apiError)) notifyForoContentRejected(apiError)
      throw apiError
    }

    return (await response.json()) as TResponse
  }

  // Coalescing is only safe when the request has no `AbortSignal` of its own:
  // React Query (used by every foro viewmodel) already dedupes identical
  // in-flight queries by query key, so per-URL coalescing is redundant for
  // those callers — but it is actively harmful. In dev, React 18 StrictMode
  // mounts→unmounts→remounts every component; the unmount makes React Query
  // abort its request via `config.signal`. Because the coalesced promise is
  // built from that FIRST caller's `fetch(url, config)` call, aborting it
  // rejects the single shared promise with `AbortError` — and the remounted
  // query, which reused the same in-flight promise, is left with a rejected,
  // never-retried query and no data (retry is 429-only, see App.tsx). So:
  // only coalesce GETs that don't carry a signal (e.g. ad-hoc calls outside
  // React Query); anything with a signal always gets its own fetch.
  const isCoalescableGet = method === 'GET' && body === undefined && signal === undefined
  if (!isCoalescableGet) {
    return performRequest()
  }

  const coalescingKey = getCoalescingKey(url, method)
  const existing = inflightGetRequests.get(coalescingKey)
  if (existing) {
    return existing as Promise<TResponse>
  }

  const requestPromise = performRequest().finally(() => {
    inflightGetRequests.delete(coalescingKey)
  })
  inflightGetRequests.set(coalescingKey, requestPromise)
  return requestPromise
}
