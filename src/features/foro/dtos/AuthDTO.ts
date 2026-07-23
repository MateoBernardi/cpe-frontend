export type ForoRoleDTO = 'visitor' | 'publisher' | 'admin'

export interface ForoUserDTO {
  id: string
  name: string
  email: string
  role: ForoRoleDTO
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

export type ForoSocialProvider = 'google' | 'apple'

export interface SignInSocialDTO {
  provider: ForoSocialProvider
  callbackURL?: string
}

export interface SignInSocialResponseDTO {
  url: string
  redirect?: boolean
}
