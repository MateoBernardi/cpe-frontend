/**
 * GET /users/me/preferences, PATCH /users/me/preferences.
 * Forward contract agreed with the backend owner — the route does not exist
 * yet (see `useUserPreferences`, which degrades gracefully on 404).
 */
export interface UserPreferencesDTO {
  emailNotifications: boolean
  pushNotifications: boolean
}

/** PATCH body — partial update. */
export type UpdateUserPreferencesDTO = Partial<UserPreferencesDTO>
