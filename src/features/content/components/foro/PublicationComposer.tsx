import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  usePublication,
  usePublicationTypes,
  useCategories,
  useTags,
  usePublicationMutations,
  useForoAuth,
  foroService,
  resolveKnownSlug,
  getForoApiErrorMessage,
  type ExternalLink,
  type Publication,
  type PublicationType,
  type KnownPublicationTypeSlug,
} from '@features/foro'
import { LoadingSpinner, ErrorMessage } from '@shared/components'
import { colors, foroHairline } from '../../../../theme'
import { ComposePreviewPane } from './ComposePreviewPane'
import { TYPE_CONFIG } from './composeConfig'
import { CategoryTag } from './CategoryTag'
import { isSafeHttpUrl } from './foroHelpers'

/**
 * Shared publication composer — used both by `/perfil/publicar` (create,
 * `slug` fixed by the type picker one screen up) and
 * `/perfil/publicaciones/:id/editar` (edit, type derived from the loaded
 * publication since there is no type-picker in edit mode). Real data + real
 * upload + real mutations, with two explicit submit actions (draft vs.
 * published) instead of one.
 *
 * Product decision: unlike the demo composer, EVERY field renders for EVERY
 * type — `TYPE_CONFIG` is only consulted for `bodyLabel` / `channelLabel`,
 * never to hide fields.
 */

interface GalleryImage {
  id: number
  url: string
  name: string
}

interface FormState {
  title: string
  subtitle: string
  content: string
  categoryIds: number[]
  tagIds: number[]
  frontImageUrl: string
  galleryImages: GalleryImage[]
  externalLinks: ExternalLink[]
}

const EMPTY_FORM: FormState = {
  title: '',
  subtitle: '',
  content: '',
  categoryIds: [],
  tagIds: [],
  frontImageUrl: '',
  galleryImages: [],
  externalLinks: [],
}

interface FormErrors {
  title?: string
  subtitle?: string
  content?: string
  externalLinks?: (string | undefined)[]
}

/** Adapted from the demo composer's `validateForm` — same rules, ported onto
 * this form's real shape (`tagIds`/`frontImageUrl`/`galleryImages` instead
 * of `tagsText`/`coverObjectUrl`). Subtitle and links are now validated
 * unconditionally since every field renders for every type. */
function validateForm(form: FormState, bodyLabel: string): FormErrors {
  const errors: FormErrors = {}

  const title = form.title.trim()
  if (!title) {
    errors.title = 'El título es obligatorio.'
  } else if (title.length > 250) {
    errors.title = 'El título no puede superar los 250 caracteres.'
  }

  if (form.subtitle.trim().length > 500) {
    errors.subtitle = 'El subtítulo no puede superar los 500 caracteres.'
  }

  if (!form.content.trim()) {
    errors.content = `El campo "${bodyLabel}" es obligatorio.`
  }

  const linkErrors = form.externalLinks.map((link) => {
    const label = link.label.trim()
    const url = link.url.trim()
    if (!label && !url) return undefined // fully-empty rows are dropped on submit, not validated
    if (!label || label.length > 100) return 'La etiqueta debe tener entre 1 y 100 caracteres.'
    if (!isSafeHttpUrl(url)) {
      return 'La URL no es válida (tiene que ser un link http:// o https://).'
    }
    return undefined
  })
  if (linkErrors.some(Boolean)) errors.externalLinks = linkErrors

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
}

export function PublicationComposer({ mode, slug, publicationId, onChangeType }: PublicationComposerProps) {
  const navigate = useNavigate()
  const { user } = useForoAuth()

  const isEdit = mode === 'edit'
  const { data: existing, isLoading: loadingExisting, error: loadError } = usePublication(isEdit ? publicationId : undefined)
  const { data: types, isLoading: loadingTypes } = usePublicationTypes()
  const { data: categories, isLoading: loadingCategories } = useCategories()
  const { data: tags, isLoading: loadingTags } = useTags()
  const { create, update } = usePublicationMutations()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [frontImagePreviewName, setFrontImagePreviewName] = useState<string | null>(null)
  const [uploadingFront, setUploadingFront] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [mobilePane, setMobilePane] = useState<'form' | 'preview'>('form')
  const [pendingStatus, setPendingStatus] = useState<'draft' | 'published' | null>(null)

  // Prefill on edit once the publication loads.
  // Publication detail exposes tag NAMES, not ids, so resolve them back to ids
  // via the loaded tags list. This is required for correctness, not just UX:
  // the publication PATCH does a FULL-REPLACE of `tag_ids`, so submitting an
  // empty/incomplete set would silently wipe the publication's existing tags.
  useEffect(() => {
    if (!isEdit || !existing) return
    const tagIdByName = new Map((tags ?? []).map((t) => [t.name, t.id]))
    const resolvedTagIds = existing.tags
      .map((name) => tagIdByName.get(name))
      .filter((tagId): tagId is number => tagId != null)
    setForm({
      title: existing.title,
      subtitle: existing.subtitle ?? '',
      content: existing.content,
      categoryIds: existing.categoryIds,
      tagIds: resolvedTagIds,
      frontImageUrl: existing.imageUrl ?? '',
      galleryImages: existing.images.map((img) => ({
        id: img.id,
        url: img.url,
        name: img.altText ?? `Imagen #${img.id}`,
      })),
      externalLinks: existing.externalLinks,
    })
  }, [isEdit, existing, tags])

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

  const isLoadingRefData = loadingTypes || loadingCategories || loadingTags || (isEdit && loadingExisting)

  const toggleInArray = (arr: number[], value: number): number[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]

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
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploadError(null)
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

  const addExternalLink = () => {
    setForm((f) => ({ ...f, externalLinks: [...f.externalLinks, { label: '', url: '' }] }))
  }

  const updateExternalLink = (index: number, patch: Partial<ExternalLink>) => {
    setForm((f) => ({
      ...f,
      externalLinks: f.externalLinks.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    }))
  }

  const removeExternalLink = (index: number) => {
    setForm((f) => ({ ...f, externalLinks: f.externalLinks.filter((_, i) => i !== index) }))
  }

  const mutationInProgress = create.isPending || update.isPending
  const mutationError = create.error ?? update.error
  const canSubmit = isEdit ? publicationId != null : matchedType != null

  const handleSave = (status: 'draft' | 'published') => {
    // Synchronous re-entrancy guard: `disabled={mutationInProgress}` only
    // takes effect after React commits, so a fast double-click on "Guardar
    // borrador"/"Publicar" can fire the mutation twice before that render lands.
    if (mutationInProgress) return
    const nextErrors = validateForm(form, bodyLabel)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    if (!canSubmit) return

    setPendingStatus(status)

    // Emptied subtitle / cover must send an explicit `null` (clears the
    // field on PATCH) rather than `undefined` (leaves it untouched).
    const baseInput = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() ? form.subtitle.trim() : null,
      content: form.content,
      categoryIds: form.categoryIds,
      tagIds: form.tagIds,
      frontImageUrl: form.frontImageUrl ? form.frontImageUrl : null,
      imageIds: form.galleryImages.map((img) => img.id),
      externalLinks: form.externalLinks.filter((l) => l.label.trim() && l.url.trim()),
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
  const tagList = useMemo(() => tags ?? [], [tags])

  // ── Live preview: builds a throwaway (id: 0) Publication from the current
  // form state and renders it through the ACTUAL public detail components,
  // so publishers see exactly what readers will see before saving. ──
  const previewTagNames = useMemo(() => {
    const nameById = new Map(tagList.map((t) => [t.id, t.name]))
    return form.tagIds.map((tagId) => nameById.get(tagId)).filter((n): n is string => n != null)
  }, [tagList, form.tagIds])

  const previewPublication: Publication = useMemo(
    () => ({
      id: 0, // keeps useComments() disabled in DiscussionDetail (enabled only for id > 0)
      title: form.title.trim() || 'Título de la publicación',
      subtitle: form.subtitle.trim() || null,
      imageUrl: form.frontImageUrl || null,
      content: form.content || 'El contenido aparecerá acá…',
      typeId: matchedType?.id ?? existing?.typeId ?? null,
      createdBy: existing?.createdBy ?? user?.name ?? 'Vos',
      createdAt: existing?.createdAt ?? new Date(),
      tags: previewTagNames,
      categoryIds: form.categoryIds,
      interactions: existing?.interactions ?? null,
      externalLinks: form.externalLinks.filter((l) => l.label.trim() && l.url.trim()),
      images: form.galleryImages.map((img) => ({ id: img.id, url: img.url, altText: null })),
      status: existing?.status ?? 'draft',
    }),
    [form, existing, previewTagNames, matchedType, user],
  )

  const previewType: PublicationType | null = matchedType ?? (resolvedSlug ? { id: 0, name: config?.name ?? '', slug: resolvedSlug } : null)

  if (isEdit && loadError) {
    return <ErrorMessage message={getForoApiErrorMessage(loadError)} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {resolvedSlug && <CategoryTag slug={resolvedSlug} label={config?.name ?? ''} />}
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

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
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
                    style={{ borderColor: colors.inputBorder }}
                  />
                  {errors.title && <span className="mt-1 block text-xs text-red-600">{errors.title}</span>}
                </label>

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
                    style={{ borderColor: colors.inputBorder }}
                  />
                  {errors.subtitle && <span className="mt-1 block text-xs text-red-600">{errors.subtitle}</span>}
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">{bodyLabel}</span>
                <textarea
                  rows={10}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                  style={{ borderColor: colors.inputBorder }}
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
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, categoryIds: toggleInArray(f.categoryIds, c.id) }))}
                        className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                        style={active ? { backgroundColor: colors.ctaPrimary, color: colors.white } : { backgroundColor: colors.lightGray, color: colors.blueDark }}
                      >
                        {c.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Etiquetas ── */}
              <div>
                <span className="mb-2 block text-sm font-medium text-gray-700">Etiquetas</span>
                <div className="flex flex-wrap gap-1.5">
                  {tagList.length === 0 && (
                    <span className="text-xs text-gray-400">No hay etiquetas creadas todavía.</span>
                  )}
                  {tagList.map((t) => {
                    const active = form.tagIds.includes(t.id)
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, tagIds: toggleInArray(f.tagIds, t.id) }))}
                        className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                        style={active ? { backgroundColor: colors.blueMid, color: colors.white } : { backgroundColor: colors.lightGray, color: colors.blueDark }}
                      >
                        {t.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Imagen de portada ── */}
              <div>
                <span className="mb-1 block text-sm font-medium text-gray-700">Imagen de portada</span>
                {form.frontImageUrl && (
                  <img src={form.frontImageUrl} alt="" className="mb-2 h-32 w-full max-w-xs rounded-lg object-cover ring-1 ring-gray-200" />
                )}
                <input type="file" accept="image/*" onChange={handleFrontImageChange} disabled={uploadingFront} className="text-sm" />
                {uploadingFront && <p className="mt-1 text-xs text-gray-400">Subiendo {frontImagePreviewName}…</p>}
              </div>

              {/* ── Galería de imágenes ── */}
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

              {uploadError && <ErrorMessage message={uploadError} />}

              {/* ── Links externos ── */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Links externos</span>
                  <button
                    type="button"
                    onClick={addExternalLink}
                    className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                  >
                    + Agregar link
                  </button>
                </div>
                {config?.linksHint && <p className="mb-2 text-xs text-gray-400">{config.linksHint}</p>}
                <div className="space-y-2">
                  {form.externalLinks.map((link, i) => (
                    <div key={i}>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Etiqueta"
                          value={link.label}
                          onChange={(e) => updateExternalLink(i, { label: e.target.value })}
                          className="w-1/3 rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
                          style={{ borderColor: colors.inputBorder }}
                        />
                        <input
                          type="url"
                          placeholder="https://..."
                          value={link.url}
                          onChange={(e) => updateExternalLink(i, { url: e.target.value })}
                          className="flex-1 rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
                          style={{ borderColor: colors.inputBorder }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExternalLink(i)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                        >
                          Quitar
                        </button>
                      </div>
                      {errors.externalLinks?.[i] && <span className="mt-1 block text-xs text-red-600">{errors.externalLinks[i]}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {mutationError && <ErrorMessage message={getForoApiErrorMessage(mutationError)} />}

              <div className="flex flex-wrap justify-end gap-2 border-t pt-4" style={{ borderColor: colors.lightGray }}>
                <button
                  type="button"
                  onClick={() => navigate('/perfil/publicaciones')}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={!canSubmit || mutationInProgress || uploadingFront || uploadingGallery}
                  className="rounded-xl border px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                  style={{ borderColor: colors.ctaPrimary, color: colors.ctaPrimary }}
                >
                  {mutationInProgress && pendingStatus === 'draft' ? 'Guardando…' : 'Guardar borrador'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  disabled={!canSubmit || mutationInProgress || uploadingFront || uploadingGallery}
                  className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: colors.ctaPrimary }}
                  onMouseEnter={(e) => { if (!mutationInProgress) e.currentTarget.style.backgroundColor = colors.ctaPrimaryHover }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.ctaPrimary }}
                >
                  {mutationInProgress && pendingStatus === 'published' ? 'Publicando…' : 'Publicar'}
                </button>
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
