import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  usePublication,
  usePublicationTypes,
  useCategories,
  useTags,
  usePublicationMutations,
  foroService,
  resolveKnownSlug,
  type ExternalLink,
  type Publication,
} from '@features/foro'
import { LoadingSpinner, ErrorMessage } from '@shared/components'
import { foroHairline } from '@/theme'
import { TYPE_CONFIG } from './composeConfig'
import { ComposePreviewPane } from './composeShared'

interface GalleryImage {
  id: number
  url: string
  name: string
}

interface FormState {
  title: string
  subtitle: string
  content: string
  typeId: number | ''
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
  typeId: '',
  categoryIds: [],
  tagIds: [],
  frontImageUrl: '',
  galleryImages: [],
  externalLinks: [],
}

export default function AdminForoPublicationFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = id != null
  const publicationId = isEdit ? Number(id) : undefined
  const navigate = useNavigate()

  const { data: existing, isLoading: loadingExisting, error: loadError } = usePublication(publicationId)
  const { data: types, isLoading: loadingTypes } = usePublicationTypes()
  const { data: categories, isLoading: loadingCategories } = useCategories()
  const { data: tags, isLoading: loadingTags } = useTags()
  const { create, update } = usePublicationMutations()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [frontImagePreviewName, setFrontImagePreviewName] = useState<string | null>(null)
  const [uploadingFront, setUploadingFront] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [mobilePane, setMobilePane] = useState<'form' | 'preview'>('form')

  // Prefill on edit once the publication loads.
  // Publication detail exposes tag NAMES, not ids, so resolve them back to ids
  // via the loaded tags list. This is required for correctness, not just UX:
  // the publication PATCH does a FULL-REPLACE of `tag_ids`, so submitting an
  // empty/incomplete set would silently wipe the publication's existing tags.
  useEffect(() => {
    if (!existing) return
    const tagIdByName = new Map((tags ?? []).map((t) => [t.name, t.id]))
    const resolvedTagIds = existing.tags
      .map((name) => tagIdByName.get(name))
      .filter((tagId): tagId is number => tagId != null)
    setForm({
      title: existing.title,
      subtitle: existing.subtitle ?? '',
      content: existing.content,
      typeId: existing.typeId ?? '',
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
  }, [existing, tags])

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
      setUploadError(err instanceof Error ? err.message : 'Error subiendo la imagen de portada')
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
      setUploadError(err instanceof Error ? err.message : 'Error subiendo imágenes de la galería')
    } finally {
      setUploadingGallery(false)
      e.target.value = ''
    }
  }

  const removeGalleryImage = (imageId: number) => {
    setForm((f) => ({ ...f, galleryImages: f.galleryImages.filter((img) => img.id !== imageId) }))
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return

    const input = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || undefined,
      content: form.content,
      typeId: form.typeId === '' ? undefined : form.typeId,
      categoryIds: form.categoryIds,
      tagIds: form.tagIds,
      frontImageUrl: form.frontImageUrl || undefined,
      imageIds: form.galleryImages.map((img) => img.id),
      externalLinks: form.externalLinks.filter((l) => l.label.trim() && l.url.trim()),
    }

    if (isEdit && publicationId != null) {
      update.mutate(
        { id: publicationId, input },
        { onSuccess: () => navigate('/foro') },
      )
    } else {
      create.mutate(input, { onSuccess: () => navigate('/foro') })
    }
  }

  const categoryList = useMemo(() => categories ?? [], [categories])
  const tagList = useMemo(() => tags ?? [], [tags])

  // ── Live preview: builds a throwaway (id: 0) Publication from the current
  // form state and renders it through the ACTUAL public detail components,
  // so publishers see exactly what readers will see before saving. ──
  const selectedType = useMemo(
    () => (typeof form.typeId === 'number' ? (types ?? []).find((t) => t.id === form.typeId) : undefined),
    [types, form.typeId],
  )
  const previewSlug = resolveKnownSlug(selectedType)

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
      typeId: typeof form.typeId === 'number' ? form.typeId : null,
      createdBy: existing?.createdBy ?? 'Vos',
      createdAt: existing?.createdAt ?? new Date(),
      tags: previewTagNames,
      categoryIds: form.categoryIds,
      interactions: existing?.interactions ?? null,
      externalLinks: form.externalLinks.filter((l) => l.label.trim() && l.url.trim()),
      images: form.galleryImages.map((img) => ({ id: img.id, url: img.url, altText: null })),
    }),
    [form, existing, previewTagNames],
  )

  const bodyLabel = previewSlug ? TYPE_CONFIG[previewSlug].bodyLabel : 'Contenido'

  if (isEdit && loadError) {
    return <ErrorMessage message={loadError instanceof Error ? loadError.message : 'Error cargando la publicación'} />
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/foro" className="text-sm text-blue-600 hover:underline">
          ← Volver a publicaciones
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
          {isEdit ? 'Editar publicación' : 'Nueva publicación'}
        </h1>
      </div>

      {isLoadingRefData ? (
        <LoadingSpinner className="py-12" />
      ) : (
        <>
          <div className="flex lg:hidden" style={{ border: `1px solid ${foroHairline}` }}>
            <button
              type="button"
              onClick={() => setMobilePane('form')}
              className={`flex-1 px-3 py-2 text-sm font-medium ${mobilePane === 'form' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'}`}
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => setMobilePane('preview')}
              className={`flex-1 px-3 py-2 text-sm font-medium ${mobilePane === 'preview' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'}`}
            >
              Vista previa
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <form
              onSubmit={handleSubmit}
              className={`${mobilePane === 'form' ? 'block' : 'hidden'} space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:block`}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Título</span>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Subtítulo</span>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Tipo</span>
                  <select
                    value={form.typeId}
                    onChange={(e) => setForm((f) => ({ ...f, typeId: e.target.value === '' ? '' : Number(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="">Sin tipo</option>
                    {(types ?? []).map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">{bodyLabel}</span>
                <textarea
                  required
                  rows={10}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </label>

              {/* ── Categorías ── */}
              <div>
                <span className="mb-2 block text-sm font-medium text-gray-700">Categorías</span>
                <div className="flex flex-wrap gap-1.5">
                  {categoryList.length === 0 && (
                    <span className="text-xs text-gray-400">No hay categorías creadas todavía.</span>
                  )}
                  {categoryList.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, categoryIds: toggleInArray(f.categoryIds, c.id) }))}
                      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        form.categoryIds.includes(c.id)
                          ? 'bg-teal-600 text-white ring-2 ring-teal-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Etiquetas ── */}
              <div>
                <span className="mb-2 block text-sm font-medium text-gray-700">Etiquetas</span>
                <div className="flex flex-wrap gap-1.5">
                  {tagList.length === 0 && (
                    <span className="text-xs text-gray-400">No hay etiquetas creadas todavía.</span>
                  )}
                  {tagList.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, tagIds: toggleInArray(f.tagIds, t.id) }))}
                      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        form.tagIds.includes(t.id)
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
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
                      <li key={img.id} className="flex items-center justify-between rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-600">
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
                    className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                  >
                    + Agregar link
                  </button>
                </div>
                <div className="space-y-2">
                  {form.externalLinks.map((link, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Etiqueta"
                        value={link.label}
                        onChange={(e) => updateExternalLink(i, { label: e.target.value })}
                        className="w-1/3 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      <input
                        type="url"
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => updateExternalLink(i, { url: e.target.value })}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeExternalLink(i)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {mutationError && (
                <ErrorMessage
                  message={mutationError instanceof Error ? mutationError.message : 'Error al guardar la publicación'}
                />
              )}

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <Link
                  to="/foro"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={mutationInProgress || uploadingFront || uploadingGallery}
                  className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                >
                  {mutationInProgress ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear publicación'}
                </button>
              </div>
            </form>

            <div className={`${mobilePane === 'preview' ? 'block' : 'hidden'} lg:block`}>
              {selectedType && previewSlug ? (
                <ComposePreviewPane publication={previewPublication} type={selectedType} slug={previewSlug} related={[]} />
              ) : (
                <div
                  className="flex h-full min-h-[16rem] items-center justify-center px-6 text-center text-sm text-gray-400"
                  style={{ border: `1px solid ${foroHairline}` }}
                >
                  Elegí un tipo reconocido (paper, podcast, novedad o discusión) para ver la vista previa en vivo.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
