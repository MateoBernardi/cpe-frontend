import ENV from './apiConfig'
import { logTelemetry } from '@shared/observability/telemetry'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiRequestOptions<TBody = unknown> {
  method: HttpMethod
  endpoint: string
  body?: TBody
  token?: string
  signal?: AbortSignal
}

interface ApiErrorResponse {
  message: string
  code?: string
}

export type ApiErrorKind = 'validation' | 'auth' | 'forbidden' | 'not-found' | 'rate-limit' | 'server' | 'unknown'

interface ApiErrorMeta {
  endpoint: string
  method: HttpMethod
  retryAfterMs: number | null
}

export class ApiError extends Error {
  readonly status: number
  readonly statusText: string
  readonly data: ApiErrorResponse
  readonly kind: ApiErrorKind
  readonly code: string | null
  readonly endpoint: string
  readonly method: HttpMethod
  readonly retryAfterMs: number | null

  constructor(
    status: number,
    statusText: string,
    data: ApiErrorResponse,
    meta: ApiErrorMeta,
  ) {
    super(data.message ?? statusText)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.data = data
    this.kind = mapStatusToKind(status)
    this.code = data.code ?? null
    this.endpoint = meta.endpoint
    this.method = meta.method
    this.retryAfterMs = meta.retryAfterMs
  }
}

const inflightGetRequests = new Map<string, Promise<unknown>>()

function mapStatusToKind(status: number): ApiErrorKind {
  if (status === 400) return 'validation'
  if (status === 401) return 'auth'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not-found'
  if (status === 429) return 'rate-limit'
  if (status >= 500) return 'server'
  return 'unknown'
}

function readRetryAfterMs(response: Response): number | null {
  const retryAfter = response.headers.get('retry-after')
  if (!retryAfter) return null
  const seconds = Number(retryAfter)
  if (!Number.isFinite(seconds) || seconds <= 0) return null
  return Math.round(seconds * 1000)
}

function getCoalescingKey(url: string, method: HttpMethod, headers: Record<string, string>): string {
  return `${method}|${url}|${headers['x-tenant-id'] ?? ''}|${headers['Authorization'] ?? ''}`
}

export function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error.message : 'Error inesperado. Intenta nuevamente.'
  }

  if (error.status === 429) return 'Demasiadas solicitudes. Espera unos segundos e intenta nuevamente.'
  if (error.status === 403) return 'Tu usuario no tiene tenant asignado.'
  if (error.status === 404) return 'El recurso solicitado no existe.'
  if (error.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.'
  if (error.status >= 500) return 'Hubo un problema en el servidor. Intenta de nuevo en unos instantes.'
  if (error.status === 400) return error.data.message || 'Hay datos inválidos en la solicitud.'

  return error.data.message || 'No se pudo completar la solicitud.'
}

export function isRateLimitError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 429
}

export function isForbiddenError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 403
}

function getCfAccessToken(): string | null {
  const match = document.cookie.match(/CF_Authorization=([^;]+)/)
  return match ? match[1] : null
}

/**
 * Fábrica de requests HTTP (JSON).
 */
export async function apiRequest<TResponse, TBody = unknown>(
  options: ApiRequestOptions<TBody>,
): Promise<TResponse> {
  const { method, endpoint, body, token, signal } = options

  const url = `${ENV.API_BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-tenant-id': ENV.TENANT_ID,
  }

  const cfToken = getCfAccessToken()
  if (cfToken) {
    headers['cf-access-jwt-assertion'] = cfToken
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
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

    if (!response.ok) {
      let errorData: ApiErrorResponse
      try {
        errorData = (await response.json()) as ApiErrorResponse
      } catch {
        errorData = { message: response.statusText }
      }

      const retryAfterMs = readRetryAfterMs(response)
      const apiError = new ApiError(response.status, response.statusText, errorData, {
        endpoint,
        method,
        retryAfterMs,
      })

      if (apiError.status === 429) {
        logTelemetry('rate_limit_hit', {
          endpoint,
          method,
          status: apiError.status,
          code: apiError.code,
        })
      }

      if (apiError.status === 403) {
        logTelemetry('forbidden_tenant', {
          endpoint,
          method,
          status: apiError.status,
          code: apiError.code,
          tenantId: ENV.TENANT_ID,
        })

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app:forbidden-tenant', {
            detail: {
              endpoint,
              method,
              code: apiError.code,
            },
          }))
        }
      }

      throw apiError
    }

    const data = (await response.json()) as TResponse
    return data
  }

  const isCoalescableGet = method === 'GET' && body === undefined
  if (!isCoalescableGet) {
    return performRequest()
  }

  const coalescingKey = getCoalescingKey(url, method, headers)
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

/**
 * Fábrica de requests multipart/form-data (para uploads de archivos).
 * NO setea Content-Type — el browser lo hace automáticamente con el boundary.
 */
export async function apiUpload<TResponse>(
  endpoint: string,
  formData: FormData,
  signal?: AbortSignal,
): Promise<TResponse> {
  const url = `${ENV.API_BASE_URL}${endpoint}`

  const uploadHeaders: Record<string, string> = {
    'x-tenant-id': ENV.TENANT_ID,
  }

  const cfToken = getCfAccessToken()
  if (cfToken) {
    uploadHeaders['cf-access-jwt-assertion'] = cfToken
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: uploadHeaders,
    credentials: 'include',
    body: formData,
    signal,
  })

  if (!response.ok) {
    let errorData: ApiErrorResponse
    try {
      errorData = (await response.json()) as ApiErrorResponse
    } catch {
      errorData = { message: response.statusText }
    }
    const apiError = new ApiError(response.status, response.statusText, errorData, {
      endpoint,
      method: 'POST',
      retryAfterMs: readRetryAfterMs(response),
    })

    if (apiError.status === 429) {
      logTelemetry('rate_limit_hit', {
        endpoint,
        method: 'POST',
        status: apiError.status,
        code: apiError.code,
      })
    }

    throw apiError
  }

  const data = (await response.json()) as TResponse
  return data
}
