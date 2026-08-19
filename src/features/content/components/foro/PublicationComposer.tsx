import { useEffect, useMemo, useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  usePublication,
  usePublicationTypes,
  useCategories,
  useCategoryMutations,
  usePublicationMutations,
  useForoAuth,
  useIdempotencyKey,
  foroService,
  resolveKnownSlug,
  getForoApiErrorMessage,
  isContentRejected,
  type Publication,
  type PublicationType,
  type KnownPublicationTypeSlug,
  type WritablePublicationStatus,
} from '@features/foro'
import { LoadingSpinner, ErrorMessage } from '@shared/components'
import { colors, foroHairline, foroPalette } from '../../../../theme'
import { ComposePreviewPane } from './ComposePreviewPane'
import {
  TYPE_CONFIG,
  PUBLICATION_CONTENT_MAX,
  PUBLICATION_CONTENT_MAX_HTML,
  MAX_NOVEDAD_IMAGES,
  EMPTY_FORM,
  type FormState,
  type TypeFieldConfig,
} from './composeConfig'
import { TypePill } from './TypePill'
import { ChevronRight, DocumentIcon } from './ForoIcons'
import { ActionButton, type ActionButtonStatus } from './ActionButton'
import { ReviewCorrectionsPanel } from './ReviewCorrectionsPanel'
import { TipTapEditor } from './TipTapEditor'
import { isSafeHttpUrl } from './foroHelpers'

/**
 * Shared publication composer — used both by `/perfil/publicar` (create,
 * `slug` fixed by the type picker one screen up) and
 * `/perfil/publicaciones/:id/editar` (edit, type derived from the loaded
 * publication since there is no type-picker in edit mode). Real data + real
 * upload + real mutations, with two explicit submit actions (draft vs.
 * published) instead of one.
 *
 * Product decision (reversed from the demo composer this was ported from):
 * fields are gated by `TYPE_CONFIG`, not rendered unconditionally. The detail
 * templates (`PublicationDetail.tsx` / `DiscussionDetail.tsx`) don't render
 * every field for every type — podcast has no gallery, discusión has no
 * external links — so offering them here was a straight dead end: the
 * publisher fills them in, the upload succeeds, the value gets persisted,
 * and no reader ever sees it. `TYPE_CONFIG`'s `showGallery`/`showLinks`
 * (plus `showSubtitle`/`coverMode`, both `true`/`'single'` for all four
 * known types today but still consulted rather than assumed) decide what
 * renders here, what gets validated, and what actually gets sent on save —
 * see `handleSave`'s `baseInput` for the stripping.
 */

/**
 * The three link kinds the composer offers, as a closed list. `label` is what
 * actually gets persisted in `external_links` — those exact strings are what
 * `<ExternalLinksCTA>` special-cases ('spotify'/'youtube') and what
 * `getYouTubeEmbedUrl` looks for, so they must not be prettified here.
 */
const LINK_KINDS = [
  { label: 'youtube', name: 'YouTube', placeholder: 'https://www.youtube.com/watch?v=…', hosts: ['youtube.com', 'youtu.be', 'youtube-nocookie.com'] },
  { label: 'spotify', name: 'Spotify', placeholder: 'https://open.spotify.com/episode/…', hosts: ['spotify.com'] },
  { label: 'sitio web', name: 'Sitio web', placeholder: 'https://…', hosts: null },
] as const

type LinkLabel = typeof LINK_KINDS[number]['label']

const KNOWN_LINK_LABELS: readonly string[] = LINK_KINDS.map((k) => k.label)

/**
 * `color` is not optional here. `MainLayout`'s root sets `color: white` for the
 * site chrome, and Tailwind's preflight makes form controls inherit it — so any
 * input on this white card renders white-on-white and the publisher types into
 * an apparently empty field. Every control in this file uses this.
 */
const FIELD_STYLE = { borderColor: colors.inputBorder, color: colors.blueDark }

/** `open.spotify.com` matches `spotify.com`; `evil-youtube.com` does not. */
function hostMatches(url: string, hosts: readonly string[]): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))
  } catch {
    return false
  }
}

interface FormErrors {
  title?: string
  subtitle?: string
  content?: string
  /** Keyed by link label, so an invalid Spotify URL can't shift the error off a YouTube row. */
  links?: Partial<Record<LinkLabel, string>>
}

/** Adapted from the demo composer's `validateForm` — same rules, ported onto
 * this form's real shape (`categoryIds`/`frontImageUrl`/`galleryImages` instead
 * of `tagsText`/`coverObjectUrl`). Subtitle and links are only validated when
 * `config` says the active type actually shows that field — a hidden field's
 * leftover value (e.g. links kept from before switching to discusión) must
 * never block submission, since the user can't even see it to fix it. */
function validateForm(form: FormState, bodyLabel: string, config: TypeFieldConfig | null): FormErrors {
  const errors: FormErrors = {}

  const title = form.title.trim()
  if (!title) {
    errors.title = 'El título es obligatorio.'
  } else if (title.length > 250) {
    errors.title = 'El título no puede superar los 250 caracteres.'
  }

  if (config?.showSubtitle !== false && form.subtitle.trim().length > 500) {
    errors.subtitle = 'El subtítulo no puede superar los 500 caracteres.'
  }

  // Un editor TipTap vacío sigue devolviendo `<p></p>` (nunca un string vacío), así que el chequeo
  // de "obligatorio" para 'html' mira el texto sin etiquetas, no el HTML crudo.
  const isHtml = form.contentFormat === 'html'
  const contentIsEmpty = isHtml ? form.content.replace(/<[^>]*>/g, '').trim().length === 0 : !form.content.trim()
  const contentMax = isHtml ? PUBLICATION_CONTENT_MAX_HTML : PUBLICATION_CONTENT_MAX
  if (contentIsEmpty) {
    errors.content = `El campo "${bodyLabel}" es obligatorio.`
  } else if (form.content.length > contentMax) {
    errors.content = `El campo "${bodyLabel}" no puede superar los ${contentMax.toLocaleString('es-AR')} caracteres.`
  }

  // Only the three known kinds are validated: a legacy link with some other
  // label is rendered read-only (it can be removed, never edited), so there is
  // nothing the user could fix here. Skipped entirely when the type doesn't
  // show links at all (discusión) — the row is hidden, so any leftover value
  // from a prior type is dropped on save, not surfaced as a blocking error.
  if (config?.showLinks !== false) {
    const linkErrors: Partial<Record<LinkLabel, string>> = {}
    for (const kind of LINK_KINDS) {
      const url = form.externalLinks.find((l) => l.label === kind.label)?.url.trim()
      if (!url) continue // an empty row is dropped on submit, not validated
      if (!isSafeHttpUrl(url)) {
        linkErrors[kind.label] = 'La URL no es válida (tiene que ser un link http:// o https://).'
      } else if (kind.hosts && !hostMatches(url, kind.hosts)) {
        linkErrors[kind.label] = `Este link tiene que ser de ${kind.name}.`
      }
    }
    if (Object.keys(linkErrors).length > 0) errors.links = linkErrors
  }

  return errors
}

export interface PublicationComposerProps {
  mode: 'create' | 'edit'
  /** Required for `mode: 'create'` — fixed by the type picker one screen up. */
  slug?: KnownPublicationTypeSlug
  /** Required for `mode: 'edit'`. */
  publicationId?: number
  /** Shown as a "Cambiar tipo" action — create mode only. */
  onChangeType?: () => void
  /**
   * Create mode only: the draft lives in `PublicarPage`'s `PublicarFlow`, not
   * here, so switching format (which swaps this screen for the type picker
   * and back) keeps everything already written. Edit mode ignores both props
   * and manages its own state, prefilled from the loaded publication.
   */
  form?: FormState
  /** Same shape as a `useState` setter, so the parent can pass its setter directly. */
  onFormChange?: Dispatch<SetStateAction<FormState>>
}

export function PublicationComposer({ mode, slug, publicationId, onChangeType, form: formProp, onFormChange }: PublicationComposerProps) {
  const navigate = useNavigate()
  const { user, role } = useForoAuth()

  const isEdit = mode === 'edit'
  // Sin `isLoading`: el gate de más abajo (`refDataReady`) mira `existing != null`, que cubre
  // también los estados en los que el flag miente (query cancelada al desmontar, o en error).
  const { data: existing, error: loadError } = usePublication(isEdit ? publicationId : undefined)
  // `existing.status`/`existing.revisionOf` decide which of the four save cases below applies —
  // see `handleSave`.
  const editsPublished = isEdit && existing?.status === 'published'
  const isRevisionDraft = isEdit && existing?.revisionOf != null
  // A publisher opening someone else's publication is reviewing it, not editing their own — this
  // composer no longer offers direct edit/publish for that case, only `ReviewCorrectionsPanel`'s
  // corrections + "Aprobar" (which computes the same owner/reviewer split independently, scoped to
  // its own `under_review` gate). Trivially true in create mode: there's no `existing` row yet, and
  // whoever is creating it is by definition its author.
  const isOwner = !isEdit || existing == null || existing.createdBy === user?.id
  // A visitor's own submission once a publisher approved it: the backend rejects every write
  // except the explicit confirm transition (`status: 'published'`) while `approved` — see
  // `updatePublicationService`'s `assertVisitorTransitionAllowed` in the backend plan. So the
  // normal "Guardar borrador"/"Enviar a revisión" actions would just 409 here; they're hidden in
  // favor of the single "Confirmar y publicar" action below.
  const isOwnApprovedVisitorSubmission =
    isEdit && role === 'visitor' && existing?.status === 'approved' && existing.createdBy === user?.id
  // `error`/`refetch` NO son opcionales acá: `retry` global es sólo-429 (ver `App.tsx`), así que
  // un único fallo de red deja estas dos queries en `error` para siempre — y una query en `error`
  // tiene `isLoading === false` con `data === undefined`. Sin mirar el error, ese estado se
  // renderizaba como un editor degradado ("No se reconoce el tipo de esta publicación", sin
  // TypePill y con la visibilidad de campos cayendo a los defaults) en vez de como una falla.
  const { data: types, error: typesError, refetch: refetchTypes } = usePublicationTypes()
  const { data: categories, error: categoriesError, refetch: refetchCategories } = useCategories()
  const { create: createCategory, remove: removeCategory } = useCategoryMutations()
  const { create, update, remove, discardRevision } = usePublicationMutations()
  const { keyFor, reset: resetIdempotencyKey } = useIdempotencyKey()

  // Controlled from above in create mode, internal in edit mode. The internal
  // copy is always declared (hooks can't be conditional); it simply goes unused
  // when the parent owns the draft.
  const [internalForm, setInternalForm] = useState<FormState>(EMPTY_FORM)
  const isControlled = formProp != null && onFormChange != null
  const form = isControlled ? formProp : internalForm
  const setForm = isControlled ? onFormChange : setInternalForm

  const [errors, setErrors] = useState<FormErrors>({})
  const [frontImagePreviewName, setFrontImagePreviewName] = useState<string | null>(null)
  const [uploadingFront, setUploadingFront] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadingDocx, setUploadingDocx] = useState(false)
  const [docxError, setDocxError] = useState<string | null>(null)
  /** El input real queda `hidden` y se dispara por `.click()` — el navegador rotula el botón
   *  nativo de un `<input type="file">` en SU propio idioma (p.ej. "Choose File" en un browser en
   *  inglés) sin que CSS pueda tocar ese texto, así que la única forma de que el botón diga
   *  "Elegir archivo" siempre es reemplazarlo por uno propio. Mismo patrón que el botón de imagen
   *  de `TipTapEditor.tsx`. */
  const docxInputRef = useRef<HTMLInputElement>(null)
  const [mobilePane, setMobilePane] = useState<'form' | 'preview'>('form')
  const [pendingStatus, setPendingStatus] = useState<WritablePublicationStatus | null>(null)
  /** Guardado bloqueado ANTES de salir a la red (no es un error de mutación): hoy sólo el caso de
   *  la publicación sin tipo, ver `handleSave`. Se muestra junto a `mutationError`. */
  const [saveError, setSaveError] = useState<string | null>(null)
  /** Which external-link row is expanded. A row with a URL already loaded stays open regardless. */
  const [openLinkKind, setOpenLinkKind] = useState<LinkLabel | null>(null)

  // Self-healing redirect: a published publication with an open revision is never edited
  // directly — the URL for #42 (published) bounces to #99 (its open revision) so a second
  // `POST .../revisionOf` can never be minted, including from a hand-typed/bookmarked URL. Once
  // the redirect lands, `publicationId` (from the route) becomes 99, `existing` refetches as the
  // revision row, `existing.status` is no longer `'published'`, and this effect's condition goes
  // false — so it settles in one hop, it doesn't loop. `navigate` (not `setState`) is what this
  // effect calls, so it isn't the state-in-effect pattern the lint rule flags.
  useEffect(() => {
    if (isEdit && existing?.status === 'published' && existing.revisionId != null) {
      navigate(`/perfil/publicaciones/${existing.revisionId}/editar`, { replace: true })
    }
  }, [isEdit, existing, navigate])

  // Prefill on edit once the publication loads.
  // Antes acá había que re-resolver nombres→ids porque la lectura devolvía nombres de tag y la
  // escritura pedía ids. Ahora el detalle trae la categoría RESUELTA (`{id,name,slug}`), así que
  // los ids salen directo. Sigue importando llenarlo completo: el PATCH hace FULL-REPLACE de
  // `category_ids`, con lo cual mandar un set incompleto borraría las categorías existentes.
  useEffect(() => {
    if (!isEdit || !existing) return
    setForm({
      title: existing.title,
      subtitle: existing.subtitle ?? '',
      content: existing.content,
      contentFormat: existing.contentFormat,
      categoryIds: existing.categories.map((category) => category.id),
      frontImageUrl: existing.imageUrl ?? '',
      galleryImages: existing.images.map((img) => ({
        id: img.id,
        url: img.url,
        name: img.altText ?? `Imagen #${img.id}`,
      })),
      externalLinks: existing.externalLinks,
    })
    // `setForm` es estable: es o el setter de `useState` o el que baja por
    // props desde `PublicarFlow` (también un setter de `useState`).
  }, [isEdit, existing, setForm])

  // Edit mode has no type picker — the type is fixed to whatever the
  // publication already has, derived from the loaded type list.
  const existingType = useMemo(
    () => (types ?? []).find((t) => t.id === existing?.typeId),
    [types, existing],
  )
  const matchedType = isEdit ? existingType : (types ?? []).find((t) => resolveKnownSlug(t) === slug)
  const resolvedSlug: KnownPublicationTypeSlug | null = isEdit ? resolveKnownSlug(existingType) : (slug ?? null)
  const config = resolvedSlug ? TYPE_CONFIG[resolvedSlug] : null
  const bodyLabel = config?.bodyLabel ?? 'Contenido'
  const contentMaxForCounter = form.contentFormat === 'html' ? PUBLICATION_CONTENT_MAX_HTML : PUBLICATION_CONTENT_MAX

  // Field visibility, derived from `TYPE_CONFIG` instead of hardcoded per
  // section below — this is the single place that decides what the active
  // type can render. Default to showing when the type isn't resolved yet
  // (loading / unrecognized type): hiding a field the publisher might
  // actually need is worse than briefly over-showing one.
  const showSubtitle = config?.showSubtitle ?? true
  const showCover = (config?.coverMode ?? 'single') !== 'none'
  const showGallery = config?.showGallery ?? true
  const showLinks = config?.showLinks ?? true
  // Opposite default from the flags above: paper is the ONLY type this renders for (see
  // `TYPE_CONFIG`'s comment), so an unresolved type defaults to hidden, not shown — there is no
  // "might actually need it" case to protect against here, the other three formats never want it.
  const showDocxImport = config?.showDocxImport ?? false

  // "Listo" = HAY datos, no "no está cargando". `isLoading` (`isPending && isFetching`) es `false`
  // tanto para una query que falló como para una que quedó cancelada e inactiva (React Query
  // aborta el fetch cuando el último observer se desmonta — p.ej. al navegar rápido desde "Mis
  // publicaciones" hasta acá), y en ambos casos `data` es `undefined`. Gatear por el flag dejaba
  // pasar esos estados y el form se armaba sin tipos: de ahí el "no se reconoce el tipo"
  // intermitente que sólo se arreglaba recargando. Gatear por presencia de datos los cubre a todos.
  const refDataReady = types != null && categories != null && (!isEdit || existing != null)
  const refDataError = typesError ?? categoriesError

  const toggleInArray = (arr: number[], value: number): number[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]

  const [newCategoryName, setNewCategoryName] = useState('')

  // Alta inline de categoría: se crea y se auto-selecciona, que es siempre la intención de quien la
  // está escribiendo mientras carga una publicación.
  const handleCreateCategory = async () => {
    const name = newCategoryName.trim()
    if (!name || createCategory.isPending) return
    const created = await createCategory.mutateAsync(name)
    setNewCategoryName('')
    setForm((f) => ({ ...f, categoryIds: [...f.categoryIds, created.id] }))
  }

  // La baja cascadea sobre `categories_publications`, o sea que desvincula la categoría de TODAS las
  // publicaciones, no sólo de esta. Por eso se confirma antes, misma pauta que el borrado de
  // publicación en `MisPublicacionesPanel`.
  const handleDeleteCategory = async (id: number, name: string) => {
    const confirmed = window.confirm(
      `¿Eliminar la categoría "${name}"? Se va a desvincular de todas las publicaciones que la usen, no sólo de esta.`,
    )
    if (!confirmed || removeCategory.isPending) return
    await removeCategory.mutateAsync(id)
    setForm((f) => ({ ...f, categoryIds: f.categoryIds.filter((categoryId) => categoryId !== id) }))
  }

  const handleFrontImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploadingFront(true)
    try {
      const img = await foroService.uploadImage(file)
      setForm((f) => ({ ...f, frontImageUrl: img.url }))
      setFrontImagePreviewName(file.name)
    } catch (err) {
      if (!isContentRejected(err)) setUploadError(getForoApiErrorMessage(err))
    } finally {
      setUploadingFront(false)
      e.target.value = ''
    }
  }

  const handleGalleryImagesChange = async (e: ChangeEvent<HTMLInputElement>) => {
    let files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploadError(null)

    // Novedad-only cap (see `MAX_NOVEDAD_IMAGES`): `NovedadCollage` only ever
    // shows 3 tiles + a "+N" badge, so anything past the cap would upload
    // successfully and then sit in `images[]` forever unreachable by any
    // reader. Trim to the remaining room instead of rejecting the whole
    // batch, and say so — silently dropping files with no message would look
    // like a bug.
    if (resolvedSlug === 'novedad') {
      const room = MAX_NOVEDAD_IMAGES - form.galleryImages.length
      if (room <= 0) {
        setUploadError(`Las novedades admiten hasta ${MAX_NOVEDAD_IMAGES} imágenes en la galería.`)
        e.target.value = ''
        return
      }
      if (files.length > room) {
        setUploadError(`Las novedades admiten hasta ${MAX_NOVEDAD_IMAGES} imágenes en la galería: se subieron ${room}.`)
        files = files.slice(0, room)
      }
    }

    setUploadingGallery(true)
    try {
      const uploaded = await Promise.all(files.map((file) => foroService.uploadImage(file)))
      setForm((f) => ({
        ...f,
        galleryImages: [
          ...f.galleryImages,
          ...uploaded.map((img, i) => ({ id: img.id, url: img.url, name: files[i].name })),
        ],
      }))
    } catch (err) {
      if (!isContentRejected(err)) setUploadError(getForoApiErrorMessage(err))
    } finally {
      setUploadingGallery(false)
      e.target.value = ''
    }
  }

  /**
   * Saca la imagen del form Y la borra del backend/Cloudflare. La galería es
   * full-replace en el PATCH, así que si sólo la sacáramos del estado el objeto
   * quedaría colgado en Cloudflare Images sin que nada lo referencie.
   *
   * El borrado remoto es best-effort: si falla, igual la sacamos de la galería
   * (que es lo que el usuario pidió) y la imagen queda huérfana, recuperable
   * después con `POST /images/purge-orphans`. Bloquear la edición por un fallo
   * de limpieza sería peor.
   */
  const removeGalleryImage = (imageId: number) => {
    setForm((f) => ({ ...f, galleryImages: f.galleryImages.filter((img) => img.id !== imageId) }))
    void foroService.deleteImage(imageId).catch((err) => {
      console.error('[foro] No se pudo eliminar la imagen de la galería:', err)
    })
  }

  /**
   * "Importar desde Word (.docx)" — parsea el archivo server-side (imágenes embebidas ya subidas
   * y moderadas, texto moderado) y pisa título/subtítulo/cuerpo del borrador actual con lo
   * extraído, dejando `contentFormat: 'html'` para que el campo de cuerpo pase del `<textarea>` de
   * siempre al editor rich-text. El título/subtítulo auto-extraídos quedan editables como
   * cualquier otro campo — el usuario los corrige acá mismo si mammoth se equivocó.
   *
   * Las imágenes embebidas ya quedan inlineadas como `<img>` dentro de `content`, pero además se
   * suman acá a `galleryImages` — mismas filas de `images` en el backend, mismos ids reales — para
   * que también aparezcan en "Galería de imágenes" y viajen en `imageIds` al guardar, en vez de
   * quedar sólo enterradas dentro del cuerpo.
   */
  const handleDocxImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setDocxError(null)
    setUploadingDocx(true)
    try {
      const result = await foroService.importDocx(file)
      setForm((f) => ({
        ...f,
        title: result.title || f.title,
        subtitle: result.subtitle ?? f.subtitle,
        content: result.content,
        contentFormat: result.content_format,
        galleryImages: [
          ...f.galleryImages,
          ...result.images.map((img, i) => ({
            id: img.id,
            url: img.url,
            name: img.alt_text ?? `Imagen del documento ${i + 1}`,
          })),
        ],
      }))
    } catch (err) {
      if (!isContentRejected(err)) setDocxError(getForoApiErrorMessage(err))
    } finally {
      setUploadingDocx(false)
    }
  }

  const linkUrlFor = (label: LinkLabel): string =>
    form.externalLinks.find((l) => l.label === label)?.url ?? ''

  /**
   * Upsert-by-label, preserving position: a link keeps its slot in the array
   * while it's being typed (the read shape is a `{label: url}` MAP anyway, so
   * order is cosmetic — but reordering on every keystroke would make the rows
   * jump). An emptied URL drops the row entirely, which is what "no link" means
   * on submit.
   */
  const setLinkUrl = (label: LinkLabel, url: string) => {
    setForm((f) => {
      const exists = f.externalLinks.some((l) => l.label === label)
      if (!url.trim()) {
        return { ...f, externalLinks: f.externalLinks.filter((l) => l.label !== label) }
      }
      return {
        ...f,
        externalLinks: exists
          ? f.externalLinks.map((l) => (l.label === label ? { ...l, url } : l))
          : [...f.externalLinks, { label, url }],
      }
    })
  }

  /** Legacy links (labels outside `LINK_KINDS`, saved before the picker existed) are removable, not editable. */
  const removeExternalLink = (label: string) => {
    setForm((f) => ({ ...f, externalLinks: f.externalLinks.filter((l) => l.label !== label) }))
  }

  const legacyLinks = form.externalLinks.filter((l) => !KNOWN_LINK_LABELS.includes(l.label))

  const mutationInProgress = create.isPending || update.isPending || discardRevision.isPending
  const mutationError = create.error ?? update.error ?? discardRevision.error
  const canSubmit = isEdit ? publicationId != null : matchedType != null

  // Button copy per save case (see `handleSave`'s branches for the matching requests):
  // editing a published publication never says "borrador"/"publicar" outright — the live post
  // stays untouched either way, only the wording changes to reflect that a separate draft is
  // involved.
  const draftButtonLabel = editsPublished ? 'Guardar cambios sin publicar' : 'Guardar borrador'
  // A visitor never publishes directly — their "Publicar" action sends the submission into
  // review instead. `publisher` keeps today's behaviour unchanged.
  const targetPublishStatus: WritablePublicationStatus = role === 'visitor' ? 'under_review' : 'published'
  const publishButtonLabel =
    role === 'visitor'
      ? existing?.status === 'under_review'
        ? 'Reenviar a revisión'
        : 'Enviar a revisión'
      : editsPublished || isRevisionDraft
        ? 'Publicar cambios'
        : 'Publicar'

  // "Aprobar" (publisher reviewing someone else's `under_review` submission) reuses this same
  // `update` mutation instead of a dedicated one — see `ReviewCorrectionsPanel`'s `onApprove`.
  // Tracked separately from `pendingStatus` (which is scoped to the draft/publish buttons below)
  // so the two spinners never light up for the other's in-flight request.
  const [pendingApprove, setPendingApprove] = useState(false)
  const approveStatus: ActionButtonStatus = update.isPending && pendingApprove ? 'pending' : 'idle'
  const handleApprove = () => {
    if (mutationInProgress || remove.isPending || publicationId == null) return
    setPendingApprove(true)
    update.mutate(
      { id: publicationId, input: { status: 'approved' } },
      { onSettled: () => setPendingApprove(false) },
    )
  }

  /**
   * "Eliminar" next to "Aprobar" — a reviewing publisher moderating someone else's `under_review`
   * submission. Backend allows this for any publisher, or for the owner themselves
   * (`assertOwnerOrModerator`); this button only reaches reviewers (see `ReviewCorrectionsPanel`'s
   * `isReviewer` gate), same scope as `onApprove`. Soft delete — 204, no undo — so it's gated
   * behind a confirm, same idiom as `handleDiscardRevision`.
   */
  const deleteStatus: ActionButtonStatus = remove.isPending ? 'pending' : 'idle'
  const handleDelete = async () => {
    if (update.isPending || remove.isPending || publicationId == null) return
    if (!confirm(`¿Eliminar "${existing?.title ?? 'esta publicación'}"? No vas a poder deshacerlo.`)) return
    try {
      await remove.mutateAsync(publicationId)
      navigate('/perfil/publicaciones')
    } catch {
      // El error queda en `remove.error`, mostrado por `ReviewCorrectionsPanel` (la vista de
      // revisor no renderiza el bloque de `mutationError` de más abajo, sólo el preview + panel).
    }
  }

  const handleSave = (status: WritablePublicationStatus) => {
    // Synchronous re-entrancy guard: `disabled={mutationInProgress}` only
    // takes effect after React commits, so a fast double-click on "Guardar
    // borrador"/"Publicar" can fire the mutation twice before that render lands.
    if (mutationInProgress) return
    setSaveError(null)
    const nextErrors = validateForm(form, bodyLabel, config)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    if (!canSubmit) return

    setPendingStatus(status)

    // Emptied subtitle / cover must send an explicit `null` (clears the
    // field on PATCH) rather than `undefined` (leaves it untouched).
    //
    // Hidden-field stripping: the form keeps whatever the publisher already
    // entered for gallery/links across a type switch (`PublicarFlow` decided
    // that on purpose — see its own comment — so a mind change never throws
    // work away), but nothing hidden by `TYPE_CONFIG` for the CURRENT type is
    // sent here. `showGallery`/`showLinks` false means the field is a dead
    // end for this type per the capability table in `composeConfig.ts` — an
    // image id or link that no detail template will ever render must not
    // ship. Concretely: a publication switched to podcast stops sending
    // `imageIds`; switched to discusión, stops sending `externalLinks`. If
    // it's already persisted from an earlier save (e.g. editing a publication
    // that changed type after already having gallery images), the next save
    // clears it server-side too — which is correct, not a regression, since
    // it was already unreachable by any reader.
    const baseInput = {
      title: form.title.trim(),
      subtitle: showSubtitle && form.subtitle.trim() ? form.subtitle.trim() : null,
      content: form.content,
      contentFormat: form.contentFormat,
      categoryIds: form.categoryIds,
      frontImageUrl: showCover && form.frontImageUrl ? form.frontImageUrl : null,
      imageIds: showGallery ? form.galleryImages.map((img) => img.id) : [],
      externalLinks: showLinks ? form.externalLinks.filter((l) => l.label.trim() && l.url.trim()) : [],
      status,
    }

    if (isEdit && editsPublished && status === 'draft' && publicationId != null) {
      // Editing a PUBLISHED publication and saving as draft must never PATCH the live row in
      // place — that would flip it published→draft and 404 it for readers mid-edit. Instead this
      // mints a SEPARATE staging row via `revisionOf`, exactly like the create path below, so #42
      // stays published and untouched. `typeId` falls back to `existing` first: unlike a plain
      // edit PATCH (which simply omits the key when unchanged), this is a POST, where `type_id` is
      // required — and `matchedType` here is resolved by searching the type list for `existing`'s
      // own type, which can come back `undefined` for an unrecognized type and would otherwise
      // leave the revision typeless.
      //
      // Y si aun así no hay tipo, se corta acá: `type_id` es `nullable().optional()` en el schema
      // del backend (publication.schema.ts), así que un POST sin él NO falla — crea una fila con
      // `type_id: NULL` que después no se puede editar bien nunca más (sin tipo no hay plantilla
      // de detalle ni vista previa) y que ningún reload arregla, porque el dato malo ya quedó
      // guardado. Sólo puede pasar con un original que ya venía sin tipo; mejor un error visible
      // que propagarlo a una fila nueva.
      const revisionTypeId = existing?.typeId ?? matchedType?.id
      if (revisionTypeId == null) {
        setPendingStatus(null)
        setSaveError('Esta publicación no tiene un tipo asignado, así que no se pueden guardar cambios sin publicar. Avisale al equipo técnico.')
        return
      }
      const revisionInput = { ...baseInput, typeId: revisionTypeId, revisionOf: publicationId }
      const idempotencyKey = keyFor(revisionInput)
      create.mutate(
        { ...revisionInput, idempotencyKey },
        {
          onSuccess: () => {
            resetIdempotencyKey()
            navigate('/perfil/publicaciones')
          },
        },
      )
    } else if (isEdit && publicationId != null) {
      // Every other edit case is a plain PATCH on `publicationId` — plain draft, published-in-
      // place republish, or editing an open revision draft (either saving it as draft again or
      // publishing it). `promotesRevision` tells the mutation this specific PATCH is the one that
      // publishes an open revision: the backend promotes it onto the original and soft-deletes
      // this row, so the optimistic update must REMOVE this row, not mark it published.
      const promotesRevision = isRevisionDraft && status === 'published'
      update.mutate(
        { id: publicationId, input: baseInput, promotesRevision },
        { onSuccess: () => navigate('/perfil/publicaciones') },
      )
    } else {
      // Una key por intención de submit, fingerprintenada sobre TODO lo que viaja en el body
      // (incluye `status`, así que "Guardar borrador" y después "Publicar" tras un fallo acuñan
      // keys DISTINTAS en vez de colisionar como un mismatch). `typeId` va sí o sí en el
      // fingerprint: `matchedType` sale del prop `slug`, que el padre puede cambiar vía
      // `onChangeType` con el composer todavía montado y el borrador intacto — sin él, cambiar de
      // tipo tras un submit fallido reusaría la key con otro body y el backend contestaría un 409
      // `IDEMPOTENCY_KEY_REUSED` espurio. `reset()` recién al tener éxito: un reintento con el
      // mismo payload reutiliza la key, un submit exitoso libera la próxima. Ver `useIdempotencyKey`.
      const idempotencyKey = keyFor({ ...baseInput, typeId: matchedType?.id })
      create.mutate(
        { ...baseInput, typeId: matchedType?.id, idempotencyKey },
        {
          onSuccess: () => {
            resetIdempotencyKey()
            navigate('/perfil/publicaciones')
          },
        },
      )
    }
  }

  /**
   * "Confirmar y publicar" — sólo existe cuando `isOwnApprovedVisitorSubmission`. Deliberadamente
   * NO reusa `handleSave`: ese siempre manda `baseInput` completo (title/content/categoryIds/...)
   * junto con `status`, pero el backend rechaza con 409 cualquier PATCH desde `approved` que no
   * sea EXACTAMENTE `{ status: 'published' }` (ver `assertVisitorTransitionAllowed` — evita que el
   * autor cuele un cambio de contenido distinto de lo que el revisor aprobó). Por eso este handler
   * manda un input mínimo en vez de construir uno desde `form`.
   */
  const handleConfirmPublish = () => {
    if (mutationInProgress || !canSubmit || publicationId == null) return
    setSaveError(null)
    setPendingStatus('published')
    update.mutate(
      { id: publicationId, input: { status: 'published' } },
      { onSuccess: () => navigate('/perfil/publicaciones') },
    )
  }

  /**
   * "Descartar cambios" — sólo existe cuando `isRevisionDraft` (esta fila ES el borrador de
   * revisión de una publicación ya publicada). Pega contra `DELETE /publications/:originalId/
   * revision`, un endpoint dedicado que nunca puede tocar la fila publicada aunque el id
   * estuviera mal — acá `existing.revisionOf` es justamente el id de esa original. A diferencia
   * de `handleSave`, no hay optimismo de UI que deshacer manualmente: el `mutateAsync` deja el
   * error en `discardRevision.error`, ya cableado al mismo bloque de `mutationError` de abajo.
   */
  const handleDiscardRevision = async () => {
    if (mutationInProgress) return
    if (existing?.revisionOf == null || publicationId == null) return
    if (!confirm('¿Descartar los cambios sin publicar? La publicación va a quedar como está publicada ahora.')) return
    // `pendingStatus` puede haber quedado de un guardado anterior que falló; sin limpiarlo, el
    // spinner de "Guardar borrador"/"Publicar" se prendería junto con el de este botón (ambos
    // miran `mutationInProgress`).
    setPendingStatus(null)
    try {
      await discardRevision.mutateAsync({ originalId: existing.revisionOf, revisionId: publicationId })
      navigate('/perfil/publicaciones')
    } catch {
      // El error queda en `discardRevision.error` y se muestra más abajo, junto al resto de los
      // errores de mutación del composer — nada más que hacer acá.
    }
  }

  const categoryList = useMemo(() => categories ?? [], [categories])

  // ── Live preview: builds a throwaway (id: 0) Publication from the current
  // form state and renders it through the ACTUAL public detail components,
  // so publishers see exactly what readers will see before saving. ──
  // La vista previa necesita las categorías resueltas, no sólo sus ids: es lo que consume
  // `<CategoryList>` en las plantillas reales de detalle.
  const previewCategories = useMemo(
    () => categoryList.filter((category) => form.categoryIds.includes(category.id)),
    [categoryList, form.categoryIds],
  )

  const previewPublication: Publication = useMemo(
    () => ({
      id: 0, // keeps useComments() disabled in DiscussionDetail (enabled only for id > 0)
      title: form.title.trim() || 'Título de la publicación',
      subtitle: form.subtitle.trim() || null,
      imageUrl: form.frontImageUrl || null,
      content: form.content || 'El contenido aparecerá acá…',
      contentFormat: form.contentFormat,
      typeId: matchedType?.id ?? existing?.typeId ?? null,
      createdBy: existing?.createdBy ?? user?.id ?? '',
      // The byline now comes from the joined author name, so the preview shows
      // the signed-in publisher's own name (or the original author when editing
      // someone else's publication as an admin).
      authorName: existing?.authorName ?? user?.name ?? 'Vos',
      createdAt: existing?.createdAt ?? new Date(),
      categories: previewCategories,
      // La vista previa no es de nadie: no hay estado de favorito/guardado que mostrar.
      viewer: null,
      interactions: existing?.interactions ?? null,
      externalLinks: form.externalLinks.filter((l) => l.label.trim() && l.url.trim()),
      images: form.galleryImages.map((img) => ({ id: img.id, url: img.url, altText: null })),
      status: existing?.status ?? 'draft',
      revisionOf: existing?.revisionOf ?? null,
      revisionId: null,
    }),
    [form, existing, previewCategories, matchedType, user],
  )

  const previewType: PublicationType | null = matchedType ?? (resolvedSlug ? { id: 0, name: config?.name ?? '', slug: resolvedSlug } : null)

  // Shared between the owner layout (side-by-side with the form) and the reviewer layout (preview
  // only, no form — see `isOwner` below): same pane either way, just a different neighbour.
  const previewPane =
    previewType && resolvedSlug ? (
      <ComposePreviewPane publication={previewPublication} type={previewType} slug={resolvedSlug} related={[]} />
    ) : (
      <div
        className="flex h-full min-h-[16rem] items-center justify-center rounded-2xl px-6 text-center text-sm text-gray-400"
        style={{ border: `1px solid ${foroHairline}` }}
      >
        No se reconoce el tipo de esta publicación, así que no hay vista previa disponible.
      </div>
    )

  // Gates "Confirmar y publicar" (see `isOwnApprovedVisitorSubmission`): the backend only accepts
  // an exact `{status:'published'}` PATCH from `approved`, so anything the visitor typed here after
  // the approval would be silently dropped by `handleConfirmPublish` rather than saved — better to
  // hide the confirm action than let it discard edits with no warning.
  const hasFormChanges = useMemo(() => {
    if (!existing) return false
    const currentGalleryIds = form.galleryImages.map((img) => img.id)
    const originalGalleryIds = existing.images.map((img) => img.id)
    return (
      form.title.trim() !== existing.title ||
      form.subtitle.trim() !== (existing.subtitle ?? '') ||
      form.content !== existing.content ||
      form.frontImageUrl !== (existing.imageUrl ?? '') ||
      JSON.stringify([...form.categoryIds].sort((a, b) => a - b)) !==
        JSON.stringify([...existing.categories.map((c) => c.id)].sort((a, b) => a - b)) ||
      JSON.stringify(currentGalleryIds) !== JSON.stringify(originalGalleryIds) ||
      JSON.stringify(form.externalLinks) !== JSON.stringify(existing.externalLinks)
    )
  }, [form, existing])

  if (isEdit && loadError) {
    return <ErrorMessage message={getForoApiErrorMessage(loadError)} />
  }

  // Sin tipos o sin categorías el editor no puede funcionar (ni resolver el tipo, ni mostrar la
  // vista previa, ni decidir qué campos van): se corta acá con un reintento explícito en vez de
  // renderizar un form a medias. El reintento es manual a propósito — `retry` global es sólo-429,
  // así que nadie más va a reintentar por su cuenta.
  if (refDataError) {
    return (
      <ErrorMessage
        message={`${getForoApiErrorMessage(refDataError)} No se pudieron cargar los tipos y categorías del foro.`}
        onRetry={() => {
          if (typesError) void refetchTypes()
          if (categoriesError) void refetchCategories()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Above the mobile form/preview toggle further down, so it's reachable from either pane
          without switching back to "Editar" first — same target as the "Cancelar" button at the
          bottom of the form, just not buried behind a scroll. */}
      <Link
        to="/perfil/publicaciones"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
      >
        <ChevronRight size={14} className="rotate-180" />
        Volver a mis publicaciones
      </Link>

      {/* `flex-col` on mobile so "Cambiar tipo" sits as a compact link under the title instead of
          wrapping onto its own line and reflowing the whole header (see `flex-wrap`'s old
          behaviour at narrow widths); back to a single row with the action on the right from `sm`
          up, same as before. */}
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {resolvedSlug && <TypePill slug={resolvedSlug} label={config?.name ?? ''} />}
          <div>
            <h1 className="text-xl font-bold sm:text-2xl" style={{ color: colors.blueDark }}>
              {isEdit ? 'Editar publicación' : `Publicar ${(config?.name ?? '').toLowerCase()}`}
            </h1>
            {config && <p className="text-xs text-gray-400">{config.channelLabel}</p>}
          </div>
        </div>
        {onChangeType && (
          <button type="button" onClick={onChangeType} className="text-sm font-semibold" style={{ color: colors.ctaPrimary }}>
            Cambiar tipo
          </button>
        )}
      </div>

      {isRevisionDraft && existing?.revisionOf != null && (
        // Ámbar, mismo acento que el chip de "Cambios sin publicar" — para que se lea como el
        // mismo estado en dos lugares distintos de la app.
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: `${colors.draftBadge}14`, color: colors.draftBadge }}
        >
          Estás editando cambios sin publicar de una publicación que ya está online.{' '}
          <Link to={`/publicaciones/${existing.revisionOf}`} className="font-semibold underline">
            Ver la publicación actual
          </Link>
        </div>
      )}

      {!refDataReady ? (
        <LoadingSpinner className="py-12" />
      ) : !isOwner ? (
        // Reviewing someone else's publication: read-only preview only — no form, no draft/publish
        // actions. `ReviewCorrectionsPanel` below (rendered outside this branch) is the one write
        // path a reviewing publisher gets, and only while the row is `under_review`.
        <div className="space-y-4">
          <div className="rounded-xl border px-4 py-3 text-sm text-gray-600" style={{ borderColor: colors.lightGray }}>
            No sos el autor de esta publicación — podés revisarla y dejar correcciones, pero no editarla.
          </div>
          {previewPane}
        </div>
      ) : (
        <>
          <div className="flex rounded-full p-1 lg:hidden" style={{ backgroundImage: `linear-gradient(135deg, ${colors.blueDark}, ${colors.tealDeep})` }}>
            <button
              type="button"
              onClick={() => setMobilePane('form')}
              className="flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors"
              style={mobilePane === 'form' ? { backgroundColor: colors.white, color: colors.blueDark } : { color: colors.white }}
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => setMobilePane('preview')}
              className="flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors"
              style={mobilePane === 'preview' ? { backgroundColor: colors.white, color: colors.blueDark } : { color: colors.white }}
            >
              Vista previa
            </button>
          </div>

          {/* The form column is capped so the preview gets the rest of the width:
              it renders the real detail template, which needs room to look like
              the actual page rather than a squeezed strip. */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start">
            <div
              className={`${mobilePane === 'form' ? 'block' : 'hidden'} space-y-6 rounded-2xl border bg-white p-6 shadow-sm lg:block`}
              style={{ borderColor: colors.lightGray }}
            >
              {/* ── Importar desde Word ──
                  Deliberadamente lo primero que se ve en el form (antes del título) y visualmente
                  destacado: pisa título/subtítulo/cuerpo Y suma sus imágenes embebidas a la galería
                  (ver `handleDocxImport`) de una sola acción, así que es el atajo más rápido para
                  cargar una publicación entera — vale la pena que se note antes que cualquier campo
                  suelto. Sólo paper (`showDocxImport` en `composeConfig.ts`): podcast/novedad/
                  discusión tienen cada una su propio estilo de carga deliberado (descripción de
                  audio, copy promocional, planteo de discusión) que un .docx volcado entero
                  pisotearía — paper es el único formato de artículo largo al que este atajo apunta. */}
              {showDocxImport && (
              <div
                className="rounded-2xl border-2 px-5 py-4"
                style={{ borderColor: colors.ctaPrimary, backgroundColor: `${colors.ctaPrimary}0d` }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.ctaPrimary, color: colors.white }}
                    aria-hidden="true"
                  >
                    <DocumentIcon size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-base font-bold" style={{ color: colors.blueDark }}>
                      Importar desde Word (.docx)
                    </span>
                    <p className="mb-2 mt-0.5 text-xs text-gray-500">
                      Subí un documento y completamos automáticamente el título, el subtítulo, el
                      cuerpo y la galería de imágenes.
                    </p>
                    <input
                      ref={docxInputRef}
                      type="file"
                      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => void handleDocxImport(e)}
                      disabled={uploadingDocx}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => docxInputRef.current?.click()}
                      disabled={uploadingDocx}
                      className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ backgroundColor: colors.ctaPrimary }}
                    >
                      Elegir archivo
                    </button>
                    {uploadingDocx && <p className="mt-2 text-xs text-gray-500">Procesando documento…</p>}
                    {docxError && <div className="mt-2"><ErrorMessage message={docxError} /></div>}
                  </div>
                </div>
              </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1 flex items-baseline justify-between text-sm font-medium text-gray-700">
                    Título
                    <span className="text-xs text-gray-400">{form.title.length}/250</span>
                  </span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                    style={FIELD_STYLE}
                  />
                  {errors.title && <span className="mt-1 block text-xs text-red-600">{errors.title}</span>}
                </label>

                {showSubtitle && (
                  <label className="block sm:col-span-2">
                    <span className="mb-1 flex items-baseline justify-between text-sm font-medium text-gray-700">
                      Subtítulo
                      <span className="text-xs text-gray-400">{form.subtitle.length}/500</span>
                    </span>
                    <input
                      type="text"
                      value={form.subtitle}
                      onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                      style={FIELD_STYLE}
                    />
                    {errors.subtitle && <span className="mt-1 block text-xs text-red-600">{errors.subtitle}</span>}
                  </label>
                )}
              </div>

              <div>
                <label className="block">
                  <span className="mb-1 flex items-baseline justify-between text-sm font-medium text-gray-700">
                    {bodyLabel}
                    <span className={`text-xs ${form.content.length > contentMaxForCounter ? 'text-red-600' : 'text-gray-400'}`}>
                      {form.content.length.toLocaleString('es-AR')}/{contentMaxForCounter.toLocaleString('es-AR')}
                    </span>
                  </span>
                  {form.contentFormat === 'html' ? (
                    <TipTapEditor content={form.content} onChange={(html) => setForm((f) => ({ ...f, content: html }))} />
                  ) : (
                    <textarea
                      rows={10}
                      value={form.content}
                      onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                      style={FIELD_STYLE}
                    />
                  )}
                  {errors.content && <span className="mt-1 block text-xs text-red-600">{errors.content}</span>}
                </label>
              </div>

              {/* ── Categorías ── */}
              <div>
                <span className="mb-2 block text-sm font-medium text-gray-700">Categorías</span>
                <div className="flex flex-wrap gap-1.5">
                  {categoryList.length === 0 && (
                    <span className="text-xs text-gray-400">No hay categorías creadas todavía.</span>
                  )}
                  {categoryList.map((c) => {
                    const active = form.categoryIds.includes(c.id)
                    return (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1 rounded-full pl-3 pr-1.5 py-1.5 text-xs font-medium transition-colors"
                        style={active ? { backgroundColor: colors.ctaPrimary, color: colors.white } : { backgroundColor: colors.lightGray, color: colors.blueDark }}
                      >
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, categoryIds: toggleInArray(f.categoryIds, c.id) }))}
                          aria-pressed={active}
                        >
                          {c.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteCategory(c.id, c.name)}
                          aria-label={`Eliminar la categoría ${c.name}`}
                          title="Eliminar categoría"
                          className="leading-none opacity-60 transition-opacity hover:opacity-100"
                        >
                          ×
                        </button>
                      </span>
                    )
                  })}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      // Enter no debe enviar el formulario de la publicación.
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        void handleCreateCategory()
                      }
                    }}
                    placeholder="Nueva categoría"
                    className="w-44 rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-1"
                    style={FIELD_STYLE}
                  />
                  <button
                    type="button"
                    onClick={() => void handleCreateCategory()}
                    disabled={!newCategoryName.trim() || createCategory.isPending}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ backgroundColor: colors.ctaPrimary }}
                  >
                    Crear
                  </button>
                </div>
                {(createCategory.error || removeCategory.error) && (
                  <span role="alert" className="mt-1 block text-xs text-red-600">
                    {getForoApiErrorMessage(createCategory.error ?? removeCategory.error)}
                  </span>
                )}
              </div>

              {/* ── Imagen de portada ── */}
              {showCover && (
                <div>
                  <span className="mb-1 block text-sm font-medium text-gray-700">Imagen de portada</span>
                  {form.frontImageUrl && (
                    <img src={form.frontImageUrl} alt="" className="mb-2 h-32 w-full max-w-xs rounded-lg object-cover ring-1 ring-gray-200" />
                  )}
                  <input type="file" accept="image/*" onChange={handleFrontImageChange} disabled={uploadingFront} className="text-sm" />
                  {uploadingFront && <p className="mt-1 text-xs text-gray-400">Subiendo {frontImagePreviewName}…</p>}
                </div>
              )}

              {/* ── Galería de imágenes ──
                  Oculta cuando la plantilla del formato no la renderiza (podcast): subir acá dejaría
                  las imágenes en `images[]` sin que ningún lector las vea nunca. */}
              {showGallery && (
              <div>
                <span className="mb-1 block text-sm font-medium text-gray-700">Galería de imágenes</span>
                <input type="file" accept="image/*" multiple onChange={handleGalleryImagesChange} disabled={uploadingGallery} className="text-sm" />
                {uploadingGallery && <p className="mt-1 text-xs text-gray-400">Subiendo imágenes…</p>}
                {form.galleryImages.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {form.galleryImages.map((img) => (
                      <li key={img.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600">
                        <span className="truncate">{img.name}</span>
                        <button type="button" onClick={() => removeGalleryImage(img.id)} className="ml-2 flex-shrink-0 text-red-500 hover:underline">
                          Quitar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              )}

              {uploadError && <ErrorMessage message={uploadError} />}

              {/* ── Links externos ──
                  Lista cerrada en vez de filas label+URL libres: la etiqueta es
                  justamente lo que decide cómo se renderiza el link al leer
                  (`ExternalLinksCTA` distingue 'spotify'/'youtube', y
                  `getYouTubeEmbedUrl` decide si va embebido), así que dejarla a
                  mano garantizaba que un typo rompiera la vista pública.

                  Ocultos cuando el formato no los renderiza (discusión): `DiscussionDetail` nunca
                  toca `externalLinks`. */}
              {showLinks && (
              <div>
                <span className="mb-2 block text-sm font-medium text-gray-700">Links externos</span>
                {config?.linksHint && <p className="mb-2 text-xs text-gray-400">{config.linksHint}</p>}
                <div className="space-y-2">
                  {LINK_KINDS.map((kind) => {
                    const value = linkUrlFor(kind.label)
                    const isOpen = openLinkKind === kind.label || value !== ''
                    const error = errors.links?.[kind.label]
                    return (
                      <div key={kind.label} className="rounded-lg border" style={{ borderColor: colors.lightGray }}>
                        <button
                          type="button"
                          onClick={() => setOpenLinkKind((cur) => (cur === kind.label ? null : kind.label))}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium"
                          style={{ color: colors.blueDark }}
                          aria-expanded={isOpen}
                        >
                          <span className="flex items-center gap-2">
                            {kind.name}
                            {value !== '' && (
                              <span className="inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.ctaPrimary }} aria-label="Cargado" />
                            )}
                          </span>
                          <svg
                            viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor"
                            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                            className={`transition-transform duration-200 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>
                        {isOpen && (
                          <div className="px-3 pb-3">
                            <input
                              type="url"
                              placeholder={kind.placeholder}
                              value={value}
                              onChange={(e) => setLinkUrl(kind.label, e.target.value)}
                              className="w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
                              style={FIELD_STYLE}
                            />
                            {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Links guardados antes de que existiera el selector: se pueden
                      quitar, no editar — su etiqueta ya no es representable acá. */}
                  {legacyLinks.map((link) => (
                    <div key={link.label} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2" style={{ borderColor: colors.lightGray }}>
                      <span className="min-w-0 flex-1 truncate text-xs text-gray-500">
                        <b className="font-semibold">{link.label}</b> · {link.url}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExternalLink(link.label)}
                        className="shrink-0 rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {saveError && <ErrorMessage message={saveError} />}
              {mutationError && !isContentRejected(mutationError) && <ErrorMessage message={getForoApiErrorMessage(mutationError)} />}

              <div className="flex flex-wrap justify-end gap-2 border-t pt-4" style={{ borderColor: colors.lightGray }}>
                <button
                  type="button"
                  onClick={() => navigate('/perfil/publicaciones')}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Cancelar
                </button>
                {isRevisionDraft && (
                  <ActionButton
                    variant="outline"
                    accentColor={foroPalette.errorText}
                    status={discardRevision.isPending ? 'pending' : 'idle'}
                    onClick={() => void handleDiscardRevision()}
                    disabled={mutationInProgress || uploadingFront || uploadingGallery}
                    pendingLabel="Descartando…"
                  >
                    Descartar cambios
                  </ActionButton>
                )}
                {!isOwnApprovedVisitorSubmission && (
                  <>
                    <ActionButton
                      variant="outline"
                      status={mutationInProgress && pendingStatus === 'draft' ? 'pending' : 'idle'}
                      onClick={() => handleSave('draft')}
                      disabled={!canSubmit || mutationInProgress || uploadingFront || uploadingGallery}
                      pendingLabel="Guardando…"
                    >
                      {draftButtonLabel}
                    </ActionButton>
                    <ActionButton
                      status={mutationInProgress && pendingStatus === targetPublishStatus ? 'pending' : 'idle'}
                      onClick={() => handleSave(targetPublishStatus)}
                      disabled={!canSubmit || mutationInProgress || uploadingFront || uploadingGallery}
                      pendingLabel={targetPublishStatus === 'published' ? 'Publicando…' : 'Enviando…'}
                    >
                      {publishButtonLabel}
                    </ActionButton>
                  </>
                )}
                {/* Sólo cuando esta fila ES el propio envío aprobado del visitante Y todavía no le
                    tocó nada al formulario — la única transición que el backend permite desde
                    `approved` es un PATCH mínimo `{status:'published'}` (ver
                    `isOwnApprovedVisitorSubmission`/`hasFormChanges`); con cambios sin guardar, ese
                    PATCH los descartaría en silencio, así que el botón mejor no aparece. */}
                {isOwnApprovedVisitorSubmission && !hasFormChanges && (
                  <ActionButton
                    status={mutationInProgress && pendingStatus === 'published' ? 'pending' : 'idle'}
                    onClick={handleConfirmPublish}
                    disabled={!canSubmit || mutationInProgress}
                    pendingLabel="Publicando…"
                  >
                    Confirmar y publicar
                  </ActionButton>
                )}
              </div>

              {editsPublished && (
                <p className="text-right text-xs text-gray-400">
                  Se guarda aparte como borrador; la publicación actual sigue online hasta que publiques los cambios.
                </p>
              )}
              {isOwnApprovedVisitorSubmission && (
                <p className="text-right text-xs text-gray-400">
                  {hasFormChanges
                    ? 'Hiciste cambios que no se van a guardar así — un publicador ya aprobó el contenido original. Recargá la página para descartar tus cambios y poder confirmar la publicación.'
                    : 'Un publicador ya aprobó este envío tal como está. Confirmá para publicarlo — ya no se puede editar el contenido.'}
                </p>
              )}
            </div>

            <div className={`${mobilePane === 'preview' ? 'block' : 'hidden'} lg:block`}>{previewPane}</div>
          </div>
        </>
      )}

      {isEdit && existing && (
        <ReviewCorrectionsPanel
          publication={existing}
          onApprove={handleApprove}
          approveStatus={approveStatus}
          onDelete={handleDelete}
          deleteStatus={deleteStatus}
          deleteError={remove.error ? getForoApiErrorMessage(remove.error) : null}
        />
      )}
    </div>
  )
}
