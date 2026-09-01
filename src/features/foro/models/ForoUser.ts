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

/** Any signed-in user (publisher or visitor) may reach the composer — visitors submit into the
 *  review workflow instead of publishing directly. See `PublisherGate.tsx` and `PublicarPage.tsx`. */
export function canAuthor(role: ForoRole | null | undefined): boolean {
  return role === 'publisher' || role === 'visitor'
}
