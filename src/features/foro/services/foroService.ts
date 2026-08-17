import { foroApiRequest } from '../api/foroApiRequest'
import { foroAuthClient, toForoApiError } from '../api/foroAuthClient'
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
  CreateInteractionDTO,
  PatchInteractionDTO,
  DeleteInteractionByTargetDTO,
  InteractionDTO,
  ListMyInteractionsQueryDTO,
  MyInteractionDTO,
  CreateCorrectionDTO,
  CorrectionDTO,
  RequestImageUploadUrlDTO,
  ImageUploadUrlResponseDTO,
  ConfirmImageDTO,
  ConfirmImageResponseDTO,
  UpdateUserDTO,
  UpdateUserResponseDTO,
} from '../dtos'
// `PublicationType`/`Category`/`UserPreferences` have no separate DTO
// (see `dtos/index.ts`'s note) — the wire shape IS the model, so these
// routes are typed against `../models` directly instead of round-tripping
// through an identity mapper.
import type { PublicationType, Category, UserPreferences, UpdateUserPreferencesInput } from '../models'

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const foroService = {
  // ── Auth (Better Auth SDK — see foroAuthClient.ts. `foroApiRequest` is
  //    NOT used here; every method below re-throws via `toForoApiError` so
  //    call sites keep the same throw-based contract.) ──

  /** GET /auth/get-session — "me" endpoint. Returns null when there is no session. */
  async getSession(signal?: AbortSignal): Promise<GetSessionResponseDTO | null> {
    const { data, error } = await foroAuthClient.getSession({ fetchOptions: { signal } })
    if (error) throw toForoApiError(error, '/auth/get-session', 'GET')
    return (data as GetSessionResponseDTO | null) ?? null
  },

  /** POST /auth/sign-up/email — new users get role 'visitor'. Captcha-protected. */
  async signUpEmail(data: SignUpEmailDTO, captchaToken: string): Promise<SignUpEmailResponseDTO> {
    const { data: res, error } = await foroAuthClient.signUp.email({
      ...data,
      fetchOptions: { headers: { 'x-captcha-response': captchaToken } },
    })
    if (error) throw toForoApiError(error, '/auth/sign-up/email')
    return res as unknown as SignUpEmailResponseDTO
  },

  /** POST /auth/sign-in/email — captcha-protected. */
  async signInEmail(data: SignInEmailDTO, captchaToken: string): Promise<SignInEmailResponseDTO> {
    const { data: res, error } = await foroAuthClient.signIn.email({
      ...data,
      fetchOptions: { headers: { 'x-captcha-response': captchaToken } },
    })
    if (error) throw toForoApiError(error, '/auth/sign-in/email')
    return res as unknown as SignInEmailResponseDTO
  },

  /** POST /auth/sign-in/social — returns a provider redirect URL (or auto-redirects). */
  async signInSocial(data: SignInSocialDTO): Promise<SignInSocialResponseDTO> {
    const { data: res, error } = await foroAuthClient.signIn.social(data)
    if (error) throw toForoApiError(error, '/auth/sign-in/social')
    return res as unknown as SignInSocialResponseDTO
  },

  /** POST /auth/sign-out */
  async signOut(): Promise<void> {
    const { error } = await foroAuthClient.signOut()
    if (error) throw toForoApiError(error, '/auth/sign-out')
  },

  /** POST /auth/update-user — Better Auth profile update; only `name` is used today. */
  async updateUser(data: UpdateUserDTO): Promise<UpdateUserResponseDTO> {
    const { data: res, error } = await foroAuthClient.updateUser(data)
    if (error) throw toForoApiError(error, '/auth/update-user')
    return res as unknown as UpdateUserResponseDTO
  },

  // ── Publications ──

  /** GET /publications — public. All query params optional. */
  listPublications(query?: ListPublicationsQueryDTO, signal?: AbortSignal) {
    const qs = buildQuery({
      type_id: query?.type_id,
      category_id: query?.category_id,
      created_by: query?.created_by,
      limit: query?.limit,
      offset: query?.offset,
      status: query?.status,
    })
    return foroApiRequest<PublicationPreviewDTO[]>({
      method: 'GET',
      endpoint: `/publications${qs}`,
      signal,
    })
  },

  /**
   * GET /publications/:id — public. `trackVisit` must only be `true` from the actual public
   * detail page: it's what the backend gates visit-counting on (in addition to the publication
   * being `published`) — the composer/editor reloading the same row must never pass it.
   */
  getPublication(id: number, signal?: AbortSignal, trackVisit = false) {
    return foroApiRequest<PublicationDTO>({
      method: 'GET',
      endpoint: `/publications/${id}${trackVisit ? '?visit=true' : ''}`,
      signal,
    })
  },

  /**
   * GET /publications/:id/comments — public, full comment tree (nested
   * `replies[]`, capped server-side at `MAX_COMMENT_DEPTH`). `viewer_favorited`
   * on each node still depends on the caller's session (cookie), which is why
   * `useComments` scopes its query key by `userId` even though the route
   * itself needs no auth.
   */
  listComments(publicationId: number, signal?: AbortSignal) {
    return foroApiRequest<InteractionDTO[]>({
      method: 'GET',
      endpoint: `/publications/${publicationId}/comments`,
      signal,
    })
  },

  /** POST /publications — role publisher|admin. `idempotencyKey` opcional — ver `api/idempotency.ts`. */
  createPublication(data: PublicationWriteDTO, idempotencyKey?: string) {
    return foroApiRequest<PublicationDTO, PublicationWriteDTO>({
      method: 'POST',
      endpoint: '/publications',
      body: data,
      idempotencyKey,
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

  /**
   * DELETE /publications/:id — role publisher|admin, y sólo sobre las propias
   * (el backend aplica `assertOwnerOrAdmin`). Es un SOFT delete: la fila queda
   * con `deleted_at`, y sus imágenes quedan huérfanas pero recuperables hasta
   * que un admin corra `POST /images/purge-orphans`.
   */
  deletePublication(id: number) {
    return foroApiRequest<void>({
      method: 'DELETE',
      endpoint: `/publications/${id}`,
    })
  },

  /**
   * DELETE /publications/:id/revision — role publisher|admin. `id` es el de la publicación
   * ORIGINAL (publicada), NO el de la revisión — es un endpoint dedicado (no reusa
   * `deletePublication` sobre el id de la revisión) justamente para que un id equivocado no
   * pueda soft-deletear una publicación viva. Descarta el borrador de cambios sin publicar y
   * deja la publicación publicada intacta. 204 sin body.
   */
  discardRevision(originalId: number) {
    return foroApiRequest<void>({
      method: 'DELETE',
      endpoint: `/publications/${originalId}/revision`,
    })
  },

  // ── Publication types ──

  /** GET /publication-types — public. */
  listPublicationTypes(signal?: AbortSignal) {
    return foroApiRequest<PublicationType[]>({
      method: 'GET',
      endpoint: '/publication-types',
      signal,
    })
  },

  // ── Categories ──

  /** GET /categories — public. */
  listCategories(signal?: AbortSignal) {
    return foroApiRequest<Category[]>({
      method: 'GET',
      endpoint: '/categories',
      signal,
    })
  },

  /**
   * POST /categories — role publisher|admin. Managed from the composer (no
   * standalone admin screen for this) — see `useCategoryMutations`.
   */
  createCategory(data: { name: string }) {
    return foroApiRequest<Category, { name: string }>({
      method: 'POST',
      endpoint: '/categories',
      body: data,
    })
  },

  /**
   * DELETE /categories/:id — role publisher|admin. Cascades over
   * `categories_publications` on the backend — the composer confirms with
   * `window.confirm` before calling this, same pattern as publication delete.
   */
  deleteCategory(id: number) {
    return foroApiRequest<void>({
      method: 'DELETE',
      endpoint: `/categories/${id}`,
    })
  },

  // ── Interactions (auth required) ──

  /** POST /interactions — `content` required for comments (type_id=2). `idempotencyKey` opcional — ver `api/idempotency.ts`. */
  createInteraction(data: CreateInteractionDTO, idempotencyKey?: string) {
    return foroApiRequest<InteractionDTO, CreateInteractionDTO>({
      method: 'POST',
      endpoint: '/interactions',
      body: data,
      idempotencyKey,
    })
  },

  /**
   * DELETE /interactions — delete-by-target: removes the CALLER's own row
   * matching `(publication_id, type_id, parent_id)`, no id needed. Replaces
   * the old pattern of fetching `GET /interactions/publication/:id` just to
   * find the row id to pass to `DELETE /interactions/:id` — that route is
   * gone (it exposed the full list of who saved/favorited each publication
   * to anyone). Used to un-favorite/un-save.
   */
  deleteInteractionByTarget(data: DeleteInteractionByTargetDTO) {
    return foroApiRequest<void, DeleteInteractionByTargetDTO>({
      method: 'DELETE',
      endpoint: '/interactions',
      body: data,
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

  /** GET /interactions/me?type_ids=&limit=&offset= — current user's own interactions, each with its publication preview.
   *  `type_ids` is CSV (e.g. `"1,2"`) — was a single `type_id` before. */
  getMyInteractions(query: ListMyInteractionsQueryDTO, signal?: AbortSignal) {
    const qs = buildQuery({
      type_ids: query.type_ids,
      limit: query.limit,
      offset: query.offset,
    })
    return foroApiRequest<MyInteractionDTO[]>({
      method: 'GET',
      endpoint: `/interactions/me${qs}`,
      signal,
    })
  },

  // ── Corrections (review workflow) ──

  /** POST /corrections — role publisher, `publication_id` must be `under_review`. */
  createCorrection(data: CreateCorrectionDTO) {
    return foroApiRequest<CorrectionDTO, CreateCorrectionDTO>({
      method: 'POST',
      endpoint: '/corrections',
      body: data,
    })
  },

  /** GET /corrections?publication_id= — publisher or the submission's own author (enforced server-side). */
  getCorrections(publicationId: number, signal?: AbortSignal) {
    return foroApiRequest<CorrectionDTO[]>({
      method: 'GET',
      endpoint: `/corrections${buildQuery({ publication_id: publicationId })}`,
      signal,
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

  /** Convenience: runs the full 3-step upload flow, returns the confirmed image. */
  async uploadImage(file: File, altText?: string): Promise<ConfirmImageResponseDTO> {
    const { upload_url, image_id } = await foroService.requestImageUploadUrl()
    await foroService.uploadImageToCloudflare(upload_url, file)
    return foroService.confirmImage({ image_id, alt_text: altText })
  },

  /**
   * DELETE /images/:id — borra la fila Y el objeto en Cloudflare. El backend
   * exige owner-or-admin. Se llama cuando el usuario saca una imagen de la
   * galería en el composer: sin esto el objeto queda colgado en Cloudflare
   * para siempre, porque la galería es full-replace y nadie más lo referencia.
   */
  deleteImage(id: number) {
    return foroApiRequest<void>({
      method: 'DELETE',
      endpoint: `/images/${id}`,
    })
  },

  // ── User preferences (contract only — backend route not implemented yet) ──

  /** GET /users/me/preferences — see useUserPreferences for 404 handling. */
  getUserPreferences(signal?: AbortSignal) {
    return foroApiRequest<UserPreferences>({
      method: 'GET',
      endpoint: '/users/me/preferences',
      signal,
    })
  },

  /** PATCH /users/me/preferences — same not-yet-implemented caveat as above. */
  updateUserPreferences(data: UpdateUserPreferencesInput) {
    return foroApiRequest<UserPreferences, UpdateUserPreferencesInput>({
      method: 'PATCH',
      endpoint: '/users/me/preferences',
      body: data,
    })
  },
}
