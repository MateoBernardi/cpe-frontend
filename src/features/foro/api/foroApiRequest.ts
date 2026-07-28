import FORO_ENV from './foroApiConfig'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ForoApiRequestOptions<TBody = unknown> {
  method: HttpMethod
  endpoint: string
  body?: TBody
  signal?: AbortSignal
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
    return error instanceof Error ? error.message : 'Error inesperado. Intenta nuevamente.'
  }

  const message = error.data.error ?? error.data.message

  if (error.status === 429) return 'Demasiadas solicitudes. Espera unos segundos e intenta nuevamente.'
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
  const { method, endpoint, body, signal } = options

  const url = `${FORO_ENV.API_BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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

      throw new ForoApiError(response.status, response.statusText, errorData, {
        endpoint,
        method,
        retryAfterMs: readRetryAfterMs(response),
      })
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
