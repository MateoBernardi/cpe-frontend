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

// NOTE: `PublicationTypeDTO`/`CategoryDTO`/`UserPreferencesDTO` and
// `ForoRoleDTO` were deleted — their wire shape was byte-identical to the
// corresponding model (`PublicationType`/`Category`/`UserPreferences`/
// `ForoRole` in `../models`) and the "mapper" was a pure identity function.
// `foroService` now reads/writes those models directly; see
// `UpdateUserPreferencesInput` in `models/UserPreferences.ts` for the PATCH
// body type. Keep this note so nobody reintroduces the pair by accident.
// `Tag`/`TagDTO` are gone outright — the taxonomy dropped tags in favor of
// categories only (see `models/Category.ts`).

export type {
  PublicationImageDTO,
  RequestImageUploadUrlDTO,
  ImageUploadUrlResponseDTO,
  ConfirmImageDTO,
  ConfirmImageResponseDTO,
} from './ImageDTO'

export type {
  InteractionCountsDTO,
  PublicationViewerStateDTO,
  PublicationDTO,
  PublicationPreviewDTO,
  ListPublicationsQueryDTO,
  ExternalLinkWriteDTO,
  PublicationWriteDTO,
  PublicationPatchDTO,
  DocxImportResultDTO,
} from './PublicationDTO'

export type { CreateCorrectionDTO, CorrectionDTO } from './CorrectionDTO'

export {
  INTERACTION_TYPE_IDS,
} from './InteractionDTO'
export type {
  InteractionTypeId,
  CreateInteractionDTO,
  PatchInteractionDTO,
  DeleteInteractionByTargetDTO,
  InteractionDTO,
  ListMyInteractionsQueryDTO,
  MyInteractionDTO,
} from './InteractionDTO'
