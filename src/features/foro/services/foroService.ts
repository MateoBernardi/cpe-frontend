import { foroApiRequest } from '../api/foroApiRequest'
import type {
  GetSessionResponseDTO,
  SignUpEmailDTO,
  SignUpEmailResponseDTO,
  SignInEmailDTO,
  SignInEmailResponseDTO,
  SignInSocialDTO,
  SignInSocialResponseDTO,
  PublicationDTO,
  PublicationPreviewDTO,
  ListPublicationsQueryDTO,
  PublicationWriteDTO,
  PublicationPatchDTO,
  PublicationTypeDTO,
  CategoryDTO,
  CategoryWriteDTO,
  TagDTO,
  TagWriteDTO,
  CreateInteractionDTO,
  PatchInteractionDTO,
  InteractionDTO,
  RequestImageUploadUrlDTO,
  ImageUploadUrlResponseDTO,
  ConfirmImageDTO,
  ConfirmImageResponseDTO,
} from '../dtos'

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const foroService = {
  // ── Auth (Better Auth) ──

  /** GET /auth/get-session — "me" endpoint. Returns null when there is no session. */
  getSession(signal?: AbortSignal) {
    return foroApiRequest<GetSessionResponseDTO | null>({
      method: 'GET',
      endpoint: '/auth/get-session',
      signal,
    })
  },

  /** POST /auth/sign-up/email — new users get role 'visitor'. */
  signUpEmail(data: SignUpEmailDTO) {
    return foroApiRequest<SignUpEmailResponseDTO, SignUpEmailDTO>({
      method: 'POST',
      endpoint: '/auth/sign-up/email',
      body: data,
    })
  },

  /** POST /auth/sign-in/email */
  signInEmail(data: SignInEmailDTO) {
    return foroApiRequest<SignInEmailResponseDTO, SignInEmailDTO>({
      method: 'POST',
      endpoint: '/auth/sign-in/email',
      body: data,
    })
  },

  /** POST /auth/sign-in/social — returns a provider redirect URL. */
  signInSocial(data: SignInSocialDTO) {
    return foroApiRequest<SignInSocialResponseDTO, SignInSocialDTO>({
      method: 'POST',
      endpoint: '/auth/sign-in/social',
      body: data,
    })
  },

  /** POST /auth/sign-out */
  signOut() {
    return foroApiRequest<unknown>({
      method: 'POST',
      endpoint: '/auth/sign-out',
    })
  },

  // ── Publications ──

  /** GET /publications — public. All query params optional. */
  listPublications(query?: ListPublicationsQueryDTO, signal?: AbortSignal) {
    const qs = buildQuery({
      type_id: query?.type_id,
      category_id: query?.category_id,
      limit: query?.limit,
      offset: query?.offset,
    })
    return foroApiRequest<PublicationPreviewDTO[]>({
      method: 'GET',
      endpoint: `/publications${qs}`,
      signal,
    })
  },

  /** GET /publications/:id — public. */
  getPublication(id: number, signal?: AbortSignal) {
    return foroApiRequest<PublicationDTO>({
      method: 'GET',
      endpoint: `/publications/${id}`,
      signal,
    })
  },

  /** POST /publications — role publisher|admin. */
  createPublication(data: PublicationWriteDTO) {
    return foroApiRequest<PublicationDTO, PublicationWriteDTO>({
      method: 'POST',
      endpoint: '/publications',
      body: data,
    })
  },

  /** PATCH /publications/:id — role publisher|admin. Collection keys are FULL-REPLACE. */
  updatePublication(id: number, data: PublicationPatchDTO) {
    return foroApiRequest<PublicationDTO, PublicationPatchDTO>({
      method: 'PATCH',
      endpoint: `/publications/${id}`,
      body: data,
    })
  },

  /** DELETE /publications/:id — role publisher|admin. Soft delete. */
  deletePublication(id: number) {
    return foroApiRequest<unknown>({
      method: 'DELETE',
      endpoint: `/publications/${id}`,
    })
  },

  // ── Publication types ──

  /** GET /publication-types — public. */
  listPublicationTypes(signal?: AbortSignal) {
    return foroApiRequest<PublicationTypeDTO[]>({
      method: 'GET',
      endpoint: '/publication-types',
      signal,
    })
  },

  // ── Categories ──

  /** GET /categories — public. */
  listCategories(signal?: AbortSignal) {
    return foroApiRequest<CategoryDTO[]>({
      method: 'GET',
      endpoint: '/categories',
      signal,
    })
  },

  /** POST /categories — role publisher|admin. */
  createCategory(data: CategoryWriteDTO) {
    return foroApiRequest<CategoryDTO, CategoryWriteDTO>({
      method: 'POST',
      endpoint: '/categories',
      body: data,
    })
  },

  /** PATCH /categories/:id — role publisher|admin. */
  updateCategory(id: number, data: Partial<CategoryWriteDTO>) {
    return foroApiRequest<CategoryDTO, Partial<CategoryWriteDTO>>({
      method: 'PATCH',
      endpoint: `/categories/${id}`,
      body: data,
    })
  },

  /** DELETE /categories/:id — role publisher|admin. */
  deleteCategory(id: number) {
    return foroApiRequest<unknown>({
      method: 'DELETE',
      endpoint: `/categories/${id}`,
    })
  },

  // ── Tags ──

  /** GET /tags — public. */
  listTags(signal?: AbortSignal) {
    return foroApiRequest<TagDTO[]>({
      method: 'GET',
      endpoint: '/tags',
      signal,
    })
  },

  /** POST /tags — role publisher|admin. */
  createTag(data: TagWriteDTO) {
    return foroApiRequest<TagDTO, TagWriteDTO>({
      method: 'POST',
      endpoint: '/tags',
      body: data,
    })
  },

  /** PATCH /tags/:id — role publisher|admin. */
  updateTag(id: number, data: Partial<TagWriteDTO>) {
    return foroApiRequest<TagDTO, Partial<TagWriteDTO>>({
      method: 'PATCH',
      endpoint: `/tags/${id}`,
      body: data,
    })
  },

  /** DELETE /tags/:id — role publisher|admin. */
  deleteTag(id: number) {
    return foroApiRequest<unknown>({
      method: 'DELETE',
      endpoint: `/tags/${id}`,
    })
  },

  // ── Interactions (auth required) ──

  /** POST /interactions — `content` required for comments (type_id=2). */
  createInteraction(data: CreateInteractionDTO) {
    return foroApiRequest<InteractionDTO, CreateInteractionDTO>({
      method: 'POST',
      endpoint: '/interactions',
      body: data,
    })
  },

  /** GET /interactions/publication/:id?type_id=N */
  listInteractionsForPublication(publicationId: number, typeId?: number, signal?: AbortSignal) {
    const qs = buildQuery({ type_id: typeId })
    return foroApiRequest<InteractionDTO[]>({
      method: 'GET',
      endpoint: `/interactions/publication/${publicationId}${qs}`,
      signal,
    })
  },

  /** PATCH /interactions/:id — edit own comment. owner-or-admin. */
  updateInteraction(id: number, data: PatchInteractionDTO) {
    return foroApiRequest<InteractionDTO, PatchInteractionDTO>({
      method: 'PATCH',
      endpoint: `/interactions/${id}`,
      body: data,
    })
  },

  /** DELETE /interactions/:id — owner-or-admin. */
  deleteInteraction(id: number) {
    return foroApiRequest<unknown>({
      method: 'DELETE',
      endpoint: `/interactions/${id}`,
    })
  },

  // ── Images (role publisher|admin) — Cloudflare Images direct upload, 3 steps ──

  /** Step 1: POST /images/upload-url, body `{}`. */
  requestImageUploadUrl() {
    return foroApiRequest<ImageUploadUrlResponseDTO, RequestImageUploadUrlDTO>({
      method: 'POST',
      endpoint: '/images/upload-url',
      body: {},
    })
  },

  /**
   * Step 2: upload the file directly to Cloudflare (NOT through our backend).
   * Cloudflare Images' direct-creator-upload endpoint expects a multipart
   * POST with the file under the `file` field.
   */
  async uploadImageToCloudflare(uploadUrl: string, file: File): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(uploadUrl, { method: 'POST', body: formData })
    if (!res.ok) {
      throw new Error(`La subida a Cloudflare Images falló: ${res.status} ${res.statusText}`)
    }
  },

  /** Step 3: POST /images — registers the uploaded image, returns its serial id. */
  confirmImage(data: ConfirmImageDTO) {
    return foroApiRequest<ConfirmImageResponseDTO, ConfirmImageDTO>({
      method: 'POST',
      endpoint: '/images',
      body: data,
    })
  },

  /** DELETE /images/:id */
  deleteImage(id: number) {
    return foroApiRequest<unknown>({
      method: 'DELETE',
      endpoint: `/images/${id}`,
    })
  },

  /** Convenience: runs the full 3-step upload flow, returns the confirmed image. */
  async uploadImage(file: File, altText?: string): Promise<ConfirmImageResponseDTO> {
    const { upload_url, image_id } = await foroService.requestImageUploadUrl()
    await foroService.uploadImageToCloudflare(upload_url, file)
    return foroService.confirmImage({ image_id, alt_text: altText })
  },
}
