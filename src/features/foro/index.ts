// ── Public surface of `@features/foro` ──
// Consumed by the main app (home foro preview and publisher space at
// `/perfil`). Keep this barrel's exports stable.

export * from './dtos'
export * from './models'
export * from './mappers'
export * from './services'
export * from './viewmodels'
export * from './auth'
export * from './components'

export { ForoApiError, getForoApiErrorMessage } from './api/foroApiRequest'
export { foroAuthClient, toForoApiError } from './api/foroAuthClient'
