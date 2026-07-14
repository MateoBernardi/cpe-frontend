/**
 * Config del cliente HTTP del backend de Foro.
 *
 * A diferencia de `@shared/api` (backend de contenido, multi-tenant, auth por
 * Cloudflare Zero Trust), el backend de Foro es **single-tenant** y usa
 * autenticación por cookie de sesión (Better Auth). NO se envía `x-tenant-id`.
 */
const FORO_ENV = {
  API_BASE_URL: import.meta.env.VITE_FORO_API_BASE_URL ?? 'http://localhost:3000',
} as const

export default FORO_ENV
