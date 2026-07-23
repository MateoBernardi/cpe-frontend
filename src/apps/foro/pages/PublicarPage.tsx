import { useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  canPublish,
  type ExternalLink,
  type Publication,
  type PublicationType,
  type KnownPublicationTypeSlug,
} from '@features/foro'
import { useDemoAuth } from '../demo/demoAuthContext'
import { PublicationDetail } from '../components/PublicationDetail'
import { DiscussionDetail } from '../components/DiscussionDetail'
import { CategoryTag } from '../components/CategoryTag'
import { typeSlugToCssVar, typeSlugChannelLabel } from '../lib/typeStyle'

/** The 4 well-known types, in picker order. */
const TYPE_OPTIONS: { slug: KnownPublicationTypeSlug; name: string }[] = [
  { slug: 'paper', name: 'Paper' },
  { slug: 'podcast', name: 'Podcast' },
  { slug: 'novedad', name: 'Novedad' },
  { slug: 'discusion', name: 'Discusión' },
]

const KNOWN_SLUGS = TYPE_OPTIONS.map((t) => t.slug)

function isKnownSlug(value: string | null): value is KnownPublicationTypeSlug {
  return value != null && (KNOWN_SLUGS as string[]).includes(value)
}

/** Cover images: `'single'` (paper/podcast — one cover input, unchanged),
 * `'multi'` (novedad — up to `MAX_NOVEDAD_IMAGES` images; the first one
 * doubles as the front cover, the rest become the gallery), or `'none'`
 * (discusión). */
type CoverMode = 'single' | 'multi' | 'none'

const MAX_NOVEDAD_IMAGES = 4

interface TypeFieldConfig {
  name: string
  bodyLabel: string
  showSubtitle: boolean
  coverMode: CoverMode
  showLinks: boolean
  showTags: boolean
  /** Overrides the generic label-based links hint when the type's embed
   * detection works differently (novedad's is URL-based, not label-based). */
  linksHint?: string
}

/** Which fields each publication type surfaces — mirrors the ONE backend
 * create schema (all fields exist for every type); the UI just chooses which
 * ones to show/require per type. Novedad is promotional (a couple of images
 * or a video, not a long-form article): multi-image cover instead of a
 * single one, and its body is labeled "Texto promocional" though it still
 * maps to the same `content` field the backend requires for every type. */
const TYPE_CONFIG: Record<KnownPublicationTypeSlug, TypeFieldConfig> = {
  novedad: {
    name: 'Novedad',
    bodyLabel: 'Texto promocional',
    showSubtitle: true,
    coverMode: 'multi',
    showLinks: true,
    showTags: true,
    linksHint: 'Un enlace de YouTube se muestra como video embebido.',
  },
  paper: { name: 'Paper', bodyLabel: 'Cuerpo', showSubtitle: true, coverMode: 'single', showLinks: true, showTags: true },
  podcast: { name: 'Podcast', bodyLabel: 'Descripción', showSubtitle: true, coverMode: 'single', showLinks: true, showTags: true },
  discusion: { name: 'Discusión', bodyLabel: 'Descripción', showSubtitle: false, coverMode: 'none', showLinks: false, showTags: false },
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

export default function PublicarPage() {
  const { user, role, setDemoState } = useDemoAuth()

  if (!canPublish(role)) {
    return (
      <div className="foro-wrap" style={{ padding: '70px 0' }}>
        <div className="foro-empty" style={{ borderTop: 'none', padding: 0 }}>
          <span className="foro-empty-eyebrow">Publicar</span>
          <p>Necesitás una cuenta de publicador para crear contenido en el foro.</p>
          <button type="button" className="foro-demo-chip" onClick={() => setDemoState('publisher')}>
            Activar modo publicador (demo)
          </button>
        </div>
      </div>
    )
  }

  // canPublish(role) only holds while demoState is 'publisher', which is the
  // only state that yields a non-null user — safe to assert here.
  return <PublicarFlow authorName={user!.name} />
}

function PublicarFlow({ authorName }: { authorName: string }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const tipoParam = searchParams.get('tipo')
  const slug = isKnownSlug(tipoParam) ? tipoParam : null

  if (!slug) {
    return <TypePicker onPick={(picked) => setSearchParams({ tipo: picked })} />
  }

  return <ComposeScreen key={slug} slug={slug} authorName={authorName} />
}

function TypePicker({ onPick }: { onPick: (slug: KnownPublicationTypeSlug) => void }) {
  return (
    <main className="foro-pod">
      <div className="foro-wrap">
        <h1>¿Qué querés publicar<span className="foro-accent-period">.</span></h1>
        <p style={{ color: 'var(--foro-muted)', marginTop: 12, maxWidth: '52ch' }}>
          Elegí un formato para empezar. Vas a ver la vista previa real mientras escribís.
        </p>
        <div className="foro-type-cards">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.slug}
              type="button"
              className="foro-type-card"
              style={{ '--foro-cat': typeSlugToCssVar(opt.slug) } as CSSProperties}
              onClick={() => onPick(opt.slug)}
            >
              <CategoryTag slug={opt.slug} label={opt.name} />
              <h3>{opt.name}</h3>
              <span className="foro-type-card-desc">{typeSlugChannelLabel(opt.slug)}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}

function ComposeScreen({ slug, authorName }: { slug: KnownPublicationTypeSlug; authorName: string }) {
  const config = TYPE_CONFIG[slug]

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

  // Real flow: foroService.uploadImage(file) → front_image_url. Demo uses a local object URL only.
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
  // current set (same "replace on change" idiom as the single cover input
  // above) — the previous object URLs are revoked immediately.
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
      // cover, the rest become the gallery (`images[]`) — matches the
      // `front_image_url` + `image_ids` split the real backend expects.
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
      <main className="foro-pod">
        <div className="foro-wrap">
          <div className="foro-pubform-confirm">
            <div className="foro-eyebrow">DEMO</div>
            <h2>Tu publicación está lista<span className="foro-accent-period">.</span></h2>
            <p className="foro-pubform-confirm-note">Modo demostración: no se envió al servidor.</p>
            <div className="foro-pubform-confirm-actions">
              <button type="button" className="foro-btn foro-btn-light" onClick={() => setSubmitted(false)}>
                Seguir editando
              </button>
              <Link to="/perfil/publicador" className="foro-btn foro-btn-teal">
                Ir a mi perfil
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="foro-pod">
      <div className="foro-wrap">
        <h1>Publicar {config.name.toLowerCase()}<span className="foro-accent-period">.</span></h1>

        <div className="foro-compose-toggle">
          <button type="button" className={mobilePane === 'form' ? 'active' : ''} onClick={() => setMobilePane('form')}>
            Editar
          </button>
          <button type="button" className={mobilePane === 'preview' ? 'active' : ''} onClick={() => setMobilePane('preview')}>
            Vista previa
          </button>
        </div>

        <div className="foro-compose-grid" data-mobile-pane={mobilePane}>
          <form className="foro-compose-form foro-pubform" onSubmit={handleSubmit} noValidate>
            <label>
              <div className="foro-pubform-label-row">
                <span className="foro-pubform-label">Título</span>
                <span className="foro-field-hint">{form.title.length}/250</span>
              </div>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              {errors.title && <span className="foro-field-error">{errors.title}</span>}
            </label>

            {config.showSubtitle && (
              <label>
                <div className="foro-pubform-label-row">
                  <span className="foro-pubform-label">Subtítulo</span>
                  <span className="foro-field-hint">{form.subtitle.length}/500</span>
                </div>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                />
                {errors.subtitle && <span className="foro-field-error">{errors.subtitle}</span>}
              </label>
            )}

            {config.coverMode === 'single' && (
              <label>
                <span className="foro-pubform-label">Imagen de portada</span>
                {form.coverObjectUrl && (
                  <img src={form.coverObjectUrl} alt="" className="foro-pubform-cover-preview" />
                )}
                <input type="file" accept="image/*" onChange={handleCoverChange} />
                <span className="foro-field-hint">Demo: la imagen queda solo en tu navegador, no se sube.</span>
              </label>
            )}

            {config.coverMode === 'multi' && (
              <label>
                <span className="foro-pubform-label">Imágenes</span>
                {form.imageObjectUrls.length > 0 && (
                  <div className="foro-pubform-images-preview">
                    {form.imageObjectUrls.map((url, i) => (
                      <img key={url} src={url} alt="" className={i === 0 ? 'foro-pubform-images-cover' : ''} />
                    ))}
                  </div>
                )}
                <input type="file" accept="image/*" multiple onChange={handleImagesChange} />
                <span className="foro-field-hint">
                  Demo: hasta {MAX_NOVEDAD_IMAGES} imágenes, solo en tu navegador. La primera es la portada; el resto
                  se muestra como galería.
                </span>
              </label>
            )}

            {config.showLinks && (
              <div>
                <div className="foro-pubform-label-row">
                  <span className="foro-pubform-label">Links externos</span>
                </div>
                <span className="foro-field-hint" style={{ display: 'block', marginBottom: 10 }}>
                  {config.linksHint ?? 'Usá la etiqueta "spotify" o "youtube" para que se muestren con su tarjeta especial.'}
                </span>
                <div className="foro-pubform-links">
                  {form.externalLinks.map((link, i) => (
                    <div key={i}>
                      <div className="foro-pubform-link-row">
                        <input
                          type="text"
                          placeholder="Etiqueta"
                          value={link.label}
                          onChange={(e) => updateExternalLink(i, { label: e.target.value })}
                        />
                        <input
                          type="url"
                          placeholder="https://…"
                          value={link.url}
                          onChange={(e) => updateExternalLink(i, { url: e.target.value })}
                        />
                        <button type="button" className="foro-pubform-link-remove" onClick={() => removeExternalLink(i)}>
                          Quitar
                        </button>
                      </div>
                      {errors.externalLinks?.[i] && (
                        <span className="foro-field-error">{errors.externalLinks[i]}</span>
                      )}
                    </div>
                  ))}
                  <button type="button" className="foro-pubform-link-add" onClick={addExternalLink}>
                    + Agregar link
                  </button>
                </div>
              </div>
            )}

            <label>
              <span className="foro-pubform-label">{config.bodyLabel}</span>
              <textarea
                rows={12}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
              {errors.content && <span className="foro-field-error">{errors.content}</span>}
            </label>

            {config.showTags && (
              <label>
                <span className="foro-pubform-label">Etiquetas</span>
                <input
                  type="text"
                  placeholder="salud laboral, remoto, bienestar"
                  value={form.tagsText}
                  onChange={(e) => setForm((f) => ({ ...f, tagsText: e.target.value }))}
                />
                <span className="foro-field-hint">Separadas por coma.</span>
              </label>
            )}

            <button type="submit" className="foro-btn foro-btn-teal">
              Publicar
            </button>
          </form>

          <div className="foro-preview-pane" aria-hidden>
            {slug === 'discusion' ? (
              <DiscussionDetail publication={preview} typeName={config.name} related={[]} />
            ) : (
              <PublicationDetail publication={preview} type={previewType} slug={slug} related={[]} />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
