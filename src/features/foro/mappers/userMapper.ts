import type { UserPreferencesDTO } from '../dtos'
import type { UserPreferences } from '../models'

export function mapUserPreferencesDTO(dto: UserPreferencesDTO): UserPreferences {
  return {
    emailNotifications: dto.emailNotifications,
    pushNotifications: dto.pushNotifications,
  }
}
