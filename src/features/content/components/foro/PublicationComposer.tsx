import { useEffect, useMemo, useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  usePublication,
  usePublicationTypes,
  useCategories,
  useCategoryMutations,
  usePublicationMutations,
  useForoAuth,
  foroService,
  resolveKnownSlug,
  getForoApiErrorMessage,
  type Publication,
  type PublicationType,
  type KnownPublicationTypeSlug,
  type WritablePublicationStatus,
} from '@features/foro'
import { LoadingSpinner, ErrorMessage } from '@shared/components'
import { colors, foroHairline } from '../../../../theme'
import { ComposePreviewPane } from './ComposePreviewPane'
import { TYPE_CONFIG, PUBLICATION_CONTENT_MAX, MAX_NOVEDAD_IMAGES, EMPTY_FORM, type FormState, type TypeFieldConfig } from './composeConfig'
import { TypePill } from './TypePill'
import { ActionButton } from './ActionButton'
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

  if (!form.content.trim()) {
    errors.content = `El campo "${bodyLabel}" es obligatorio.`
  } else if (form.content.length > PUBLICATION_CONTENT_MAX) {
    errors.content = `El campo "${bodyLabel}" no puede superar los ${PUBLICATION_CONTENT_MAX.toLocaleString('es-AR')} caracteres.`
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
  const { user } = useForoAuth()

  const isEdit = mode === 'edit'
  const { data: existing, isLoading: loadingExisting, error: loadError } = usePublication(isEdit ? publicationId : undefined)
  const { data: types, isLoading: loadingTypes } = usePublicationTypes()
  const { data: categories, isLoading: loadingCategories } = useCategories()
  const { create: createCategory, remove: removeCategory } = useCategoryMutations()
  const { create, update } = usePublicationMutations()

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
  const [mobilePane, setMobilePane] = useState<'form' | 'preview'>('form')
  const [pendingStatus, setPendingStatus] = useState<WritablePublicationStatus | null>(null)
  /** Which external-link row is expanded. A row with a URL already loaded stays open regardless. */
  const [openLinkKind, setOpenLinkKind] = useState<LinkLabel | null>(null)

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

  // Field visibility, derived from `TYPE_CONFIG` instead of hardcoded per
  // section below — this is the single place that decides what the active
  // type can render. Default to showing when the type isn't resolved yet
  // (loading / unrecognized type): hiding a field the publisher might
  // actually need is worse than briefly over-showing one.
  const showSubtitle = config?.showSubtitle ?? true
  const showCover = (config?.coverMode ?? 'single') !== 'none'
  const showGallery = config?.showGallery ?? true
  const showLinks = config?.showLinks ?? true

  const isLoadingRefData = loadingTypes || loadingCategories || (isEdit && loadingExisting)

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
      setUploadError(getForoApiErrorMessage(err))
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
      setUploadError(getForoApiErrorMessage(err))
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

  const mutationInProgress = create.isPending || update.isPending
  const mutationError = create.error ?? update.error
  const canSubmit = isEdit ? publicationId != null : matchedType != null

  const handleSave = (status: WritablePublicationStatus) => {
    // Synchronous re-entrancy guard: `disabled={mutationInProgress}` only
    // takes effect after React commits, so a fast double-click on "Guardar
    // borrador"/"Publicar" can fire the mutation twice before that render lands.
    if (mutationInProgress) return
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
      categoryIds: form.categoryIds,
      frontImageUrl: showCover && form.frontImageUrl ? form.frontImageUrl : null,
      imageIds: showGallery ? form.galleryImages.map((img) => img.id) : [],
      externalLinks: showLinks ? form.externalLinks.filter((l) => l.label.trim() && l.url.trim()) : [],
      status,
    }

    if (isEdit && publicationId != null) {
      update.mutate(
        { id: publicationId, input: baseInput },
        { onSuccess: () => navigate('/perfil/publicaciones') },
      )
    } else {
      create.mutate(
        { ...baseInput, typeId: matchedType?.id },
        { onSuccess: () => navigate('/perfil/publicaciones') },
      )
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
    }),
    [form, existing, previewCategories, matchedType, user],
  )

  const previewType: PublicationType | null = matchedType ?? (resolvedSlug ? { id: 0, name: config?.name ?? '', slug: resolvedSlug } : null)

  if (isEdit && loadError) {
    return <ErrorMessage message={getForoApiErrorMessage(loadError)} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
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

      {isLoadingRefData ? (
        <LoadingSpinner className="py-12" />
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

              <label className="block">
                <span className="mb-1 flex items-baseline justify-between text-sm font-medium text-gray-700">
                  {bodyLabel}
                  <span className={`text-xs ${form.content.length > PUBLICATION_CONTENT_MAX ? 'text-red-600' : 'text-gray-400'}`}>
                    {form.content.length.toLocaleString('es-AR')}/{PUBLICATION_CONTENT_MAX.toLocaleString('es-AR')}
                  </span>
                </span>
                <textarea
                  rows={10}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                  style={FIELD_STYLE}
                />
                {errors.content && <span className="mt-1 block text-xs text-red-600">{errors.content}</span>}
              </label>

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

              {mutationError && <ErrorMessage message={getForoApiErrorMessage(mutationError)} />}

              <div className="flex flex-wrap justify-end gap-2 border-t pt-4" style={{ borderColor: colors.lightGray }}>
                <button
                  type="button"
                  onClick={() => navigate('/perfil/publicaciones')}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <ActionButton
                  variant="outline"
                  status={mutationInProgress && pendingStatus === 'draft' ? 'pending' : 'idle'}
                  onClick={() => handleSave('draft')}
                  disabled={!canSubmit || mutationInProgress || uploadingFront || uploadingGallery}
                  pendingLabel="Guardando…"
                >
                  Guardar borrador
                </ActionButton>
                <ActionButton
                  status={mutationInProgress && pendingStatus === 'published' ? 'pending' : 'idle'}
                  onClick={() => handleSave('published')}
                  disabled={!canSubmit || mutationInProgress || uploadingFront || uploadingGallery}
                  pendingLabel="Publicando…"
                >
                  Publicar
                </ActionButton>
              </div>
            </div>

            <div className={`${mobilePane === 'preview' ? 'block' : 'hidden'} lg:block`}>
              {previewType && resolvedSlug ? (
                <ComposePreviewPane publication={previewPublication} type={previewType} slug={resolvedSlug} related={[]} />
              ) : (
                <div
                  className="flex h-full min-h-[16rem] items-center justify-center rounded-2xl px-6 text-center text-sm text-gray-400"
                  style={{ border: `1px solid ${foroHairline}` }}
                >
                  No se reconoce el tipo de esta publicación, así que no hay vista previa disponible.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
