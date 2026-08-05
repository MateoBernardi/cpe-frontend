import type { ForoRole } from '../models'

export interface ForoUserDTO {
  id: string
  name: string
  email: string
  role: ForoRole
}

/** GET /auth/get-session → `{ session, user } | null` */
export interface GetSessionResponseDTO {
  session: unknown
  user: ForoUserDTO
}

export interface SignUpEmailDTO {
  email: string
  password: string
  name: string
}

export interface SignUpEmailResponseDTO {
  user: ForoUserDTO
}

export interface SignInEmailDTO {
  email: string
  password: string
}

export interface SignInEmailResponseDTO {
  user: ForoUserDTO
}

export type ForoSocialProvider = 'google'

export interface SignInSocialDTO {
  provider: ForoSocialProvider
  /**
   * A dónde vuelve el usuario después de autorizar en Google. **No es opcional
   * en la práctica**: si no se manda, el callback de Better Auth entra en
   * `if (!callbackURL) redirectOnError(..., 'no_callback_url')` y el usuario
   * termina en la página de error del BACKEND en vez de volver a la app.
   * Better Auth lo valida contra `trustedOrigins` (= ALLOWED_ORIGINS).
   */
  callbackURL: string
  /**
   * A dónde vuelve el usuario si el callback FALLA (p. ej. `account_not_linked`).
   * Better Auth lo guarda en el `state` y lo prefiere sobre `onAPIError.errorURL`
   * del backend, así que mandarlo es lo que hace que un fallo devuelva a la página
   * exacta donde estaba en vez de a la home. Llega con `?error=<code>` en la query.
   */
  errorCallbackURL?: string
}

export interface SignInSocialResponseDTO {
  url: string
  redirect?: boolean
}

/** POST /auth/update-user body (Better Auth). Only `name` is wired up today; `image` typed for future avatar support. */
export interface UpdateUserDTO {
  name?: string
  image?: string
}

/** POST /auth/update-user response (Better Auth). */
export interface UpdateUserResponseDTO {
  status: boolean
}
