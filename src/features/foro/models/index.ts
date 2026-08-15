export type { ForoRole, ForoUser } from './ForoUser'
export { canPublish, canAuthor } from './ForoUser'

export type { PublicationType, KnownPublicationTypeSlug } from './PublicationType'
export { resolveKnownSlug } from './PublicationType'

export type { Category } from './Category'
export type { ForoImage } from './ForoImage'
export type { InteractionCounts, Interaction, MyInteraction, ListMyInteractionsParams } from './Interaction'
export type { UserPreferences, UpdateUserPreferencesInput } from './UserPreferences'
export type { Correction, CreateCorrectionInput } from './Correction'

export type {
  ExternalLink,
  PublicationViewerState,
  Publication,
  PublicationPreview,
  ListPublicationsParams,
  PublicationInput,
  PublicationStatus,
  WritablePublicationStatus,
} from './Publication'
