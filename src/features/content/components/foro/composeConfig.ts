import type { ExternalLink, KnownPublicationTypeSlug } from '@features/foro'

/**
 * Per-type composer field configuration. The backend's create schema accepts
 * all fields for every publication type, but the DETAIL TEMPLATES do not
 * render all of them for every type — a field the templates never render is
 * a dead end: it uploads and persists but no reader ever sees it. This table
 * is derived from actually reading `PublicationDetail.tsx` / `DiscussionDetail.tsx`
 * / `ArticleHero.tsx`, not from guessing, and the composer/preview consult it
 * to decide what to show, validate and send. Keep it in sync if those
 * templates change what they render.
 *
 * Verified per-type capability table:
 *   - Cover (`imageUrl`): all four — rendered by `<ArticleHero>` (shared by
 *     every format; discusión just falls back to an accent gradient when absent).
 *   - Subtitle: all four — also `<ArticleHero>`, unconditional on `publication.subtitle`.
 *   - Gallery (`images[]`): paper (`<Gallery>`), novedad (`<NovedadCollage>`),
 *     discusión (`<Gallery>`) — NOT podcast. Nothing in the podcast branch of
 *     `PublicationDetail` ever touches `images`.
 *   - External links: paper / podcast / discusión (`<ExternalLinksCTA>`), novedad
 *     (YouTube link embeds, the rest go through `<ExternalLinksCTA>`) — all four
 *     now render `externalLinks`.
 *   - Categories: all four (`<CategoryList>`) — la taxonomía es una sola y aplica a todos los
 *     formatos, así que no tiene eje propio en esta tabla.
 *
 * Novedad's body is labeled "Texto promocional" (still the same `content`
 * field the backend requires for every type) because it reads as promotional
 * copy next to the collage/embed, not a long-form article — that's a label
 * choice, not a capability difference.
 */
export type CoverMode = 'single' | 'none'

export interface TypeFieldConfig {
  name: string
  bodyLabel: string
  showSubtitle: boolean
  coverMode: CoverMode
  /** Whether `images[]` (the gallery uploader, distinct from the single front
   * cover) renders anywhere in this type's detail template. Only `false` for
   * podcast — see the capability table above. */
  showGallery: boolean
  showLinks: boolean
  /** Editorial "channel" descriptor shown next to the type picker card. */
  channelLabel: string
  /** Overrides the generic label-based links hint for types whose embed
   * detection works differently (novedad's is URL-based, not label-based). */
  linksHint?: string
}

/** The 4 well-known types, in picker order. */
export const TYPE_OPTIONS: { slug: KnownPublicationTypeSlug; name: string }[] = [
  { slug: 'paper', name: 'Paper' },
  { slug: 'podcast', name: 'Podcast' },
  { slug: 'novedad', name: 'Novedad' },
  { slug: 'discusion', name: 'Discusión' },
]

/**
 * Cap on gallery images the composer accepts for a novedad. `NovedadCollage`
 * (`PublicationDetail.tsx`) only ever shows 3 tiles, with a "+N" badge on the
 * last one for whatever is left over — so this is 3 visible + 1 that still
 * earns its keep by bumping the badge to "+1". Beyond 4, an upload would sit
 * in `images[]` fully unreachable by any reader (the badge just says "+2",
 * "+3"…, never revealing the extra image itself), which is exactly the kind
 * of dead-end field this task exists to close off. Enforced in
 * `PublicationComposer.handleGalleryImagesChange` — see the guard there.
 */
export const MAX_NOVEDAD_IMAGES = 4

/** Mirrors the backend's `PUBLICATION_CONTENT_MAX` (cpe-foro-backend) — the
 * body's real hard cap, surfaced here so the composer's counter/validation
 * and the backend stay in sync without importing across repos. */
export const PUBLICATION_CONTENT_MAX = 20_000

/** A gallery image already uploaded to Cloudflare Images (id assigned by the
 * backend) — tracked separately from the front cover, which is a single URL. */
export interface GalleryImage {
  id: number
  url: string
  name: string
}

/**
 * The composer's form shape — lifted here (out of `PublicationComposer.tsx`)
 * so `PublicarPage.tsx` can hold the `create`-mode draft in `PublicarFlow`
 * and pass it down as controlled state, surviving a type change instead of
 * being thrown away by a remount. `mode: 'edit'` still manages its own copy
 * of this same shape internally (prefill comes from the loaded publication,
 * not from a picker flow).
 */
export interface FormState {
  title: string
  subtitle: string
  content: string
  categoryIds: number[]
  frontImageUrl: string
  galleryImages: GalleryImage[]
  externalLinks: ExternalLink[]
}

export const EMPTY_FORM: FormState = {
  title: '',
  subtitle: '',
  content: '',
  categoryIds: [],
  frontImageUrl: '',
  galleryImages: [],
  externalLinks: [],
}

export const TYPE_CONFIG: Record<KnownPublicationTypeSlug, TypeFieldConfig> = {
  paper: {
    name: 'Paper',
    bodyLabel: 'Cuerpo',
    showSubtitle: true,
    coverMode: 'single',
    showGallery: true,
    showLinks: true,
    channelLabel: 'Investigación',
  },
  podcast: {
    name: 'Podcast',
    bodyLabel: 'Descripción',
    showSubtitle: true,
    coverMode: 'single',
    // `PublicationDetail`'s podcast branch renders `<Prose>` + the tags/
    // interactions footer + `<ExternalLinksCTA>` — never `<Gallery>`. Nothing
    // reads `images[]` for a podcast, so the uploader is hidden and nothing
    // is sent on save (see `PublicationComposer.handleSave`).
    showGallery: false,
    showLinks: true,
    channelLabel: 'Audio',
  },
  novedad: {
    name: 'Novedad',
    bodyLabel: 'Texto promocional',
    showSubtitle: true,
    // Front cover is a single `imageUrl`, same as every other type — the old
    // `coverMode: 'multi'` conflated it with the (separate) gallery/collage.
    coverMode: 'single',
    showGallery: true,
    showLinks: true,
    channelLabel: 'Actualidad',
    linksHint: 'Un enlace de YouTube se muestra como video embebido.',
  },
  discusion: {
    name: 'Discusión',
    bodyLabel: 'Descripción',
    // `<ArticleHero>` (cover + subtitle), `<CategoryList>` and `<ExternalLinksCTA>`
    // are shared by every format including discusión — verified by reading
    // `DiscussionDetail.tsx`, which renders categories, a gallery and external
    // links like the other three formats.
    showSubtitle: true,
    coverMode: 'single',
    showGallery: true,
    showLinks: true,
    channelLabel: 'Comunidad',
  },
}
