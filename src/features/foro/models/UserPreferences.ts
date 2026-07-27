/**
 * Mirrors UserPreferencesDTO 1:1 today; kept as its own model (rather than
 * reusing the DTO directly) so the wire shape can change later without
 * touching consumers.
 */
export interface UserPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
}
