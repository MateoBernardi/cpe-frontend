// ── Public surface of `@features/foro` ──
// Consumed by the main app (home foro preview) and the admin app
// (publisher space). Keep this barrel's exports stable — see
// FORO_INTEGRATION_CONTRACT.md section B.

export * from './dtos'
export * from './models'
export * from './mappers'
export * from './services'
export * from './viewmodels'
export * from './auth'
export * from './components'

export { foroApiRequest, ForoApiError, getForoApiErrorMessage, isForoRateLimitError, isForoAuthError, isForoForbiddenError } from './api/foroApiRequest'
export { default as FORO_ENV } from './api/foroApiConfig'
