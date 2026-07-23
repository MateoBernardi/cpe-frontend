import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  canPublish,
  type ExternalLink,
  type Publication,
  type PublicationType,
  type KnownPublicationTypeSlug,
} from '@features/foro'
import { CategoryTag, typeAccent } from '@features/content/components/foro'
import { foroHairline } from '@/theme'
import { DemoAuthProvider } from './demo/demoAuth'
import { useDemoAuth } from './demo/demoAuthContext'
import { DEMO_SAVED, DEMO_MY_PUBLICATIONS, type DemoPublicationEntry } from './demo/demoData'
import { TYPE_OPTIONS, TYPE_CONFIG, MAX_NOVEDAD_IMAGES, type TypeFieldConfig } from './composeConfig'
import { ComposePreviewPane } from './composeShared'

/**
 * `/admin/foro/demo` — the "preview instance": a fully navigable, purely
 * client-side demonstration of the publication-composer UX (type picker,
 * per-type conditional fields, live preview) ported from the abandoned
 * Foro SPA's `PublicarPage`. Runs entirely on mock data from `./demo` —
 * NEVER calls `foroService`, never uploads images, never mutates the real
 * backend. Nested under `<AdminForoGate>` so it inherits a real
 * `ForoAuthProvider` (needed because the reused public detail components
 * — `DiscussionDetail`'s comment composer/list — read `useForoAuth()`
 * internally even in preview).
 */

const KNOWN_SLUGS = TYPE_OPTIONS.map((t) => t.slug)

function isKnownSlug(value: string | null): value is KnownPublicationTypeSlug {
  return value != null && (KNOWN_SLUGS as string[]).includes(value)
}

/** Union of the moved mock publications, deduped by id — used to fake a
 * "related content" strip below the live preview so the demo feels like a
 * real feed, not just an empty article. */
function useRelatedPool(): DemoPublicationEntry[] {
  return useMemo(() => {
    const byId = new Map<number, DemoPublicationEntry>()
    for (const entry of [...DEMO_SAVED, ...DEMO_MY_PUBLICATIONS]) byId.set(entry.preview.id, entry)
    return Array.from(byId.values())
  }, [])
}

interface ComposeForm {
  title: string
  subtitle: string
  content: string
  coverObjectUrl: string | null
  /** novedad only: up to `MAX_NOVEDAD_IMAGES` local object URLs; index 0
   * doubles as the front cover, the rest become the gallery. */
  imageObjectUrls: string[]
  tagsText: string
  externalLinks: ExternalLink[]
}

const EMPTY_FORM: ComposeForm = {
  title: '',
  subtitle: '',
  content: '',
  coverObjectUrl: null,
  imageObjectUrls: [],
  tagsText: '',
  externalLinks: [],
}

interface FormErrors {
  title?: string
  subtitle?: string
  content?: string
  externalLinks?: (string | undefined)[]
}

function validateForm(form: ComposeForm, config: TypeFieldConfig): FormErrors {
  const errors: FormErrors = {}

  const title = form.title.trim()
  if (!title) {
    errors.title = 'El título es obligatorio.'
  } else if (title.length > 250) {
    errors.title = 'El título no puede superar los 250 caracteres.'
  }

  if (config.showSubtitle && form.subtitle.trim().length > 500) {
    errors.subtitle = 'El subtítulo no puede superar los 500 caracteres.'
  }

  if (!form.content.trim()) {
    errors.content = `El campo "${config.bodyLabel}" es obligatorio.`
  }

  if (config.showLinks) {
    const linkErrors = form.externalLinks.map((link) => {
      const label = link.label.trim()
      const url = link.url.trim()
      if (!label && !url) return undefined // fully-empty rows are dropped on submit, not validated
      if (!label || label.length > 100) return 'La etiqueta debe tener entre 1 y 100 caracteres.'
      try {
        new URL(url)
      } catch {
        return 'La URL no es válida (tiene que incluir "https://").'
      }
      return undefined
    })
    if (linkErrors.some(Boolean)) errors.externalLinks = linkErrors
  }

  return errors
}

// ── Shared input styling — flat, hairline borders, no radius (matches the
// public Foro surfaces; only solid CTA buttons keep rounded-xl). ──
const fieldWrapClass = 'block'
const labelRowClass = 'mb-1 flex items-baseline justify-between'
const labelClass = 'text-sm font-medium text-gray-800'
const hintClass = 'text-xs text-gray-400'
const errorClass = 'mt-1 block text-xs text-red-600'
const inputClass = 'w-full border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none'

export default function AdminForoDemoPage() {
  return (
    <DemoAuthProvider>
      <AdminForoDemoContent />
    </DemoAuthProvider>
  )
}

function AdminForoDemoContent() {
  const { user, role, demoState, setDemoState } = useDemoAuth()

  return (
    <div className="space-y-6">
      <div>
        <Link to="/foro" className="text-sm text-blue-600 hover:underline">
          ← Volver a publicaciones
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Instancia de previsualización</h1>
            <p className="mt-1 text-sm text-gray-500">
              Demostración navegable del flujo de creación del Foro, con datos de prueba.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border border-amber-300 bg-amber-50 px-4 py-3">
        <p className="text-xs font-medium text-amber-900">
          DEMO — Esta página es solo de demostración. No se sube nada ni se escribe en el backend real.
        </p>
        <div className="flex items-center gap-1.5">
          {(['logged-out', 'visitor', 'publisher'] as const).map((state) => (
            <button
              key={state}
              type="button"
              onClick={() => setDemoState(state)}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                demoState === state
                  ? 'bg-amber-900 text-white'
                  : 'bg-white text-amber-900 hover:bg-amber-100'
              }`}
              style={{ border: '1px solid #b45309' }}
            >
              {state === 'logged-out' ? 'Deslogueado' : state === 'visitor' ? 'Visitante' : 'Publicador'}
            </button>
          ))}
        </div>
      </div>

      {!canPublish(role) ? (
        <div className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-300 px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-gray-900">Se necesita el rol de publicador</h2>
          <p className="max-w-md text-sm text-gray-500">
            Usá el selector de arriba y elegí <strong>Publicador</strong> para probar el flujo de creación de
            publicaciones (demo: {user ? user.name : 'sin sesión'}).
          </p>
        </div>
      ) : (
        <PublicarFlow authorName={user!.name} />
      )}
    </div>
  )
}

function PublicarFlow({ authorName }: { authorName: string }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const tipoParam = searchParams.get('tipo')
  const slug = isKnownSlug(tipoParam) ? tipoParam : null

  if (!slug) {
    return <TypePicker onPick={(picked) => setSearchParams({ tipo: picked })} />
  }

  return <ComposeScreen key={slug} slug={slug} authorName={authorName} onChangeType={() => setSearchParams({})} />
}

function TypePicker({ onPick }: { onPick: (slug: KnownPublicationTypeSlug) => void }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">¿Qué querés publicar?</h2>
      <p className="mt-1 max-w-xl text-sm text-gray-500">
        Elegí un formato para empezar. Vas a ver la vista previa real mientras escribís.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TYPE_OPTIONS.map((opt) => {
          const config = TYPE_CONFIG[opt.slug]
          return (
            <button
              key={opt.slug}
              type="button"
              onClick={() => onPick(opt.slug)}
              className="flex flex-col items-start gap-2 bg-white p-4 text-left transition-colors hover:bg-gray-50"
              style={{ border: `1px solid ${foroHairline}`, borderTop: `3px solid ${typeAccent(opt.slug)}` }}
            >
              <CategoryTag slug={opt.slug} label={opt.name} />
              <h3 className="text-base font-semibold text-gray-900">{opt.name}</h3>
              <span className="text-xs text-gray-500">{config.channelLabel}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ComposeScreen({
  slug,
  authorName,
  onChangeType,
}: {
  slug: KnownPublicationTypeSlug
  authorName: string
  onChangeType: () => void
}) {
  const config = TYPE_CONFIG[slug]
  const relatedPool = useRelatedPool()
  const related = useMemo(
    () => relatedPool.filter((e) => e.slug === slug).map((e) => e.preview).slice(0, 3),
    [relatedPool, slug],
  )

  const [form, setForm] = useState<ComposeForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [mobilePane, setMobilePane] = useState<'form' | 'preview'>('form')

  // Track the latest cover/gallery object URLs in refs so the unmount-only
  // cleanup effects below always revoke whatever is current, without
  // re-running on every keystroke.
  const coverUrlRef = useRef<string | null>(null)
  useEffect(() => {
    coverUrlRef.current = form.coverObjectUrl
  }, [form.coverObjectUrl])
  useEffect(() => {
    return () => {
      if (coverUrlRef.current) URL.revokeObjectURL(coverUrlRef.current)
    }
  }, [])

  const imageUrlsRef = useRef<string[]>([])
  useEffect(() => {
    imageUrlsRef.current = form.imageObjectUrls
  }, [form.imageObjectUrls])
  useEffect(() => {
    return () => {
      imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  // Real flow: foroService.uploadImage(file) → front_image_url. Demo uses a
  // local object URL only — nothing ever leaves the browser.
  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm((f) => {
      if (f.coverObjectUrl) URL.revokeObjectURL(f.coverObjectUrl)
      return { ...f, coverObjectUrl: URL.createObjectURL(file) }
    })
    e.target.value = ''
  }

  // Real flow: foroService.uploadImage(file) per file → image_ids, with the
  // first upload's id also sent as front_image_url. Demo uses local object
  // URLs only, capped at MAX_NOVEDAD_IMAGES. Each selection REPLACES the
  // current set — the previous object URLs are revoked immediately.
  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_NOVEDAD_IMAGES)
    if (files.length === 0) return
    setForm((f) => {
      f.imageObjectUrls.forEach((url) => URL.revokeObjectURL(url))
      return { ...f, imageObjectUrls: files.map((file) => URL.createObjectURL(file)) }
    })
    e.target.value = ''
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const nextErrors = validateForm(form, config)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) setSubmitted(true)
  }

  const preview: Publication = useMemo(
    () => ({
      id: 0, // CRITICAL: keeps useComments() disabled in DiscussionDetail (enabled: publicationId > 0)
      title: form.title.trim() || 'Título de la publicación',
      subtitle: form.subtitle.trim() || null,
      // Multi-image types (novedad): the first image doubles as the front
      // cover, the rest become the gallery — matches the `front_image_url`
      // + `image_ids` split the real backend expects.
      imageUrl: config.coverMode === 'multi' ? (form.imageObjectUrls[0] ?? null) : form.coverObjectUrl,
      content: form.content || 'El contenido aparecerá aquí…',
      typeId: 0,
      createdBy: authorName,
      createdAt: new Date(),
      tags: form.tagsText.split(',').map((t) => t.trim()).filter(Boolean),
      categoryIds: [],
      interactions: null,
      externalLinks: form.externalLinks.filter((l) => l.label.trim() && l.url.trim()),
      images: config.coverMode === 'multi'
        ? form.imageObjectUrls.slice(1).map((url, i) => ({ id: i + 1, url, altText: null })) // fake sequential ids, preview-only
        : [],
    }),
    [form, authorName, config.coverMode],
  )

  const previewType: PublicationType = { id: 0, name: config.name, slug }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 border px-6 py-16 text-center" style={{ borderColor: foroHairline }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: typeAccent(slug) }}>
          Demo
        </span>
        <h2 className="text-lg font-semibold text-gray-900">Tu publicación está lista</h2>
        <p className="max-w-md text-sm text-gray-500">Modo demostración: no se envió al servidor.</p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Seguir editando
          </button>
          <Link
            to="/foro"
            className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            Ir a publicaciones
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Publicar {config.name.toLowerCase()}
        </h2>
        <button type="button" onClick={onChangeType} className="text-sm text-blue-600 hover:underline">
          Cambiar tipo
        </button>
      </div>

      <div className="mt-3 flex lg:hidden" style={{ border: `1px solid ${foroHairline}` }}>
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

      <div className="mt-5 grid gap-6 lg:grid-cols-2 lg:items-start">
        <form
          onSubmit={handleSubmit}
          noValidate
          className={`${mobilePane === 'form' ? 'block' : 'hidden'} space-y-5 lg:block`}
        >
          <label className={fieldWrapClass}>
            <div className={labelRowClass}>
              <span className={labelClass}>Título</span>
              <span className={hintClass}>{form.title.length}/250</span>
            </div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputClass}
              style={{ borderColor: foroHairline }}
            />
            {errors.title && <span className={errorClass}>{errors.title}</span>}
          </label>

          {config.showSubtitle && (
            <label className={fieldWrapClass}>
              <div className={labelRowClass}>
                <span className={labelClass}>Subtítulo</span>
                <span className={hintClass}>{form.subtitle.length}/500</span>
              </div>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                className={inputClass}
                style={{ borderColor: foroHairline }}
              />
              {errors.subtitle && <span className={errorClass}>{errors.subtitle}</span>}
            </label>
          )}

          {config.coverMode === 'single' && (
            <label className={fieldWrapClass}>
              <span className={labelClass}>Imagen de portada</span>
              {form.coverObjectUrl && (
                <img src={form.coverObjectUrl} alt="" className="mt-2 h-32 w-full max-w-xs object-cover" />
              )}
              <input type="file" accept="image/*" onChange={handleCoverChange} className="mt-2 text-sm" />
              <span className={`mt-1 block ${hintClass}`}>Demo: la imagen queda solo en tu navegador, no se sube.</span>
            </label>
          )}

          {config.coverMode === 'multi' && (
            <label className={fieldWrapClass}>
              <span className={labelClass}>Imágenes</span>
              {form.imageObjectUrls.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.imageObjectUrls.map((url, i) => (
                    <img
                      key={url}
                      src={url}
                      alt=""
                      className="h-20 w-28 object-cover"
                      style={i === 0 ? { outline: `2px solid ${typeAccent(slug)}` } : undefined}
                    />
                  ))}
                </div>
              )}
              <input type="file" accept="image/*" multiple onChange={handleImagesChange} className="mt-2 text-sm" />
              <span className={`mt-1 block ${hintClass}`}>
                Demo: hasta {MAX_NOVEDAD_IMAGES} imágenes, solo en tu navegador. La primera es la portada; el resto
                se muestra como galería.
              </span>
            </label>
          )}

          {config.showLinks && (
            <div>
              <span className={labelClass}>Links externos</span>
              <p className={`mb-2 mt-0.5 ${hintClass}`}>
                {config.linksHint ?? 'Usá la etiqueta "spotify" o "youtube" para que se muestren con su tarjeta especial.'}
              </p>
              <div className="space-y-2">
                {form.externalLinks.map((link, i) => (
                  <div key={i}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Etiqueta"
                        value={link.label}
                        onChange={(e) => updateExternalLink(i, { label: e.target.value })}
                        className={`${inputClass} w-1/3`}
                        style={{ borderColor: foroHairline }}
                      />
                      <input
                        type="url"
                        placeholder="https://…"
                        value={link.url}
                        onChange={(e) => updateExternalLink(i, { url: e.target.value })}
                        className={`${inputClass} flex-1`}
                        style={{ borderColor: foroHairline }}
                      />
                      <button
                        type="button"
                        onClick={() => removeExternalLink(i)}
                        className="border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Quitar
                      </button>
                    </div>
                    {errors.externalLinks?.[i] && <span className={errorClass}>{errors.externalLinks[i]}</span>}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExternalLink}
                  className="border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  + Agregar link
                </button>
              </div>
            </div>
          )}

          <label className={fieldWrapClass}>
            <span className={labelClass}>{config.bodyLabel}</span>
            <textarea
              rows={12}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className={`${inputClass} mt-1`}
              style={{ borderColor: foroHairline }}
            />
            {errors.content && <span className={errorClass}>{errors.content}</span>}
          </label>

          {config.showTags && (
            <label className={fieldWrapClass}>
              <span className={labelClass}>Etiquetas</span>
              <input
                type="text"
                placeholder="salud laboral, remoto, bienestar"
                value={form.tagsText}
                onChange={(e) => setForm((f) => ({ ...f, tagsText: e.target.value }))}
                className={`${inputClass} mt-1`}
                style={{ borderColor: foroHairline }}
              />
              <span className={`mt-1 block ${hintClass}`}>Separadas por coma.</span>
            </label>
          )}

          <button
            type="submit"
            className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            Publicar (demo)
          </button>
        </form>

        <div className={`${mobilePane === 'preview' ? 'block' : 'hidden'} lg:block`}>
          <ComposePreviewPane publication={preview} type={previewType} slug={slug} related={related} />
        </div>
      </div>
    </div>
  )
}
