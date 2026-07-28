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
