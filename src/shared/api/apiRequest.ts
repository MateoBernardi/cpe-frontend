import ENV from './apiConfig'

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
}

export class ApiError extends Error {
  readonly status: number
  readonly statusText: string
  readonly data: ApiErrorResponse

  constructor(
    status: number,
    statusText: string,
    data: ApiErrorResponse,
  ) {
    super(data.message ?? statusText)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.data = data
  }
}

/**
 * Fábrica de requests HTTP (JSON).
 * Incluye x-tenant-id en todos los requests.
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

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config: RequestInit = {
    method,
    headers,
    signal,
  }

  if (body !== undefined && method !== 'GET') {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    let errorData: ApiErrorResponse
    try {
      errorData = (await response.json()) as ApiErrorResponse
    } catch {
      errorData = { message: response.statusText }
    }
    throw new ApiError(response.status, response.statusText, errorData)
  }

  const data = (await response.json()) as TResponse
  return data
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

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-tenant-id': ENV.TENANT_ID,
    },
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
    throw new ApiError(response.status, response.statusText, errorData)
  }

  const data = (await response.json()) as TResponse
  return data
}
