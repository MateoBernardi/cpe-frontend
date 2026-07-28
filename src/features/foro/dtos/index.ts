export type {
  ForoUserDTO,
  GetSessionResponseDTO,
  SignUpEmailDTO,
  SignUpEmailResponseDTO,
  SignInEmailDTO,
  SignInEmailResponseDTO,
  ForoSocialProvider,
  SignInSocialDTO,
  SignInSocialResponseDTO,
  UpdateUserDTO,
  UpdateUserResponseDTO,
} from './AuthDTO'

// NOTE: `PublicationTypeDTO`/`CategoryDTO`/`TagDTO`/`UserPreferencesDTO` and
// `ForoRoleDTO` were deleted — their wire shape was byte-identical to the
// corresponding model (`PublicationType`/`Category`/`Tag`/`UserPreferences`/
// `ForoRole` in `../models`) and the "mapper" was a pure identity function.
// `foroService` now reads/writes those models directly; see
// `UpdateUserPreferencesInput` in `models/UserPreferences.ts` for the PATCH
// body type. Keep this note so nobody reintroduces the pair by accident.

export type {
  PublicationImageDTO,
  RequestImageUploadUrlDTO,
  ImageUploadUrlResponseDTO,
  ConfirmImageDTO,
  ConfirmImageResponseDTO,
} from './ImageDTO'

export type {
  InteractionCountsDTO,
  PublicationDTO,
  PublicationPreviewDTO,
  ListPublicationsQueryDTO,
  ExternalLinkWriteDTO,
  PublicationWriteDTO,
  PublicationPatchDTO,
} from './PublicationDTO'

export {
  INTERACTION_TYPE_IDS,
} from './InteractionDTO'
export type {
  InteractionTypeId,
  CreateInteractionDTO,
  PatchInteractionDTO,
  InteractionDTO,
  ListMyInteractionsQueryDTO,
  MyInteractionDTO,
} from './InteractionDTO'
