export type ForoRole = 'visitor' | 'publisher'

export interface ForoUser {
  id: string
  name: string
  email: string
  role: ForoRole
}

export function canPublish(role: ForoRole | null | undefined): boolean {
  return role === 'publisher'
}
