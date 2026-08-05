/**
 * GET/PATCH /users/me/preferences. No separate DTO — the wire shape is
 * identical to this model (see `dtos/index.ts`'s note on collapsed identity
 * pairs), so `foroService` reads/writes this type directly.
 */
export interface UserPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
}

/** PATCH body — partial update. */
export type UpdateUserPreferencesInput = Partial<UserPreferences>
