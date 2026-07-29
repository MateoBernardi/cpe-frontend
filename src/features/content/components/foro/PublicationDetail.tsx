import type { ReactNode } from 'react'
import type { Publication, PublicationPreview, PublicationType, KnownPublicationTypeSlug } from '@features/foro'
import { DetailShell } from './DetailShell'
import { CategoryList } from './CategoryList'
import { ExternalLinksCTA } from './ExternalLinksCTA'
import { Prose } from './Prose'
import { Gallery } from './Gallery'
import { CommentThread } from './CommentThread'
import { formatForoDate, interactionRows, getYouTubeEmbedUrl } from './foroHelpers'
import { colors } from '../../../../theme'

interface PublicationDetailProps {
  publication: Publication
  type: PublicationType | undefined
  slug: Exclude<KnownPublicationTypeSlug, 'discusion'>
  related: PublicationPreview[]
  /** Forwarded to `<DetailShell>` — full-width, single-column, no sidebar (composer preview). */
  embedded?: boolean
}

/**
 * 16:9 YouTube embed for a novedad whose external links contain a
 * recognizable YouTube URL (see `getYouTubeEmbedUrl`). Runtime browser embed
 * only, no external fetch from our side.
 */
function NovedadVideo({ embedUrl, title }: { embedUrl: string; title: string }) {
  return (
    <div className="relative my-7 aspect-video w-full overflow-hidden rounded-2xl shadow-md ring-1 ring-slate-200/60" style={{ backgroundColor: colors.lightGray }}>
      <iframe
        className="absolute inset-0 h-full w-full border-0"
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  )
}

/**
 * Promotional image collage for a novedad with no embeddable video: the
 * gallery `images[]` only. `imageUrl` (front cover) is deliberately excluded
 * — `<ArticleHero>` (rendered by `<DetailShell>`, which wraps this body)
 * already shows it full-bleed above, so including it here would duplicate
 * the cover as the first tile. Layout adapts to the count (1 = full-bleed,
 * 2 = even split, 3+ = one large + supporting stack), capped at 3 visible
 * tiles with a "+N" badge on the last one when there's more.
 */
function NovedadCollage({ images }: { images: Publication['images'] }) {
  const combined = images ?? []
  if (combined.length === 0) return null

  const visible = combined.slice(0, 3)
  const extra = combined.length - visible.length

  const gridClass =
    visible.length === 1 ? 'grid-cols-1'
      : visible.length === 2 ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-[1.5fr_1fr] sm:grid-rows-2'

  return (
    <div className={`my-7 grid gap-3 ${gridClass}`}>
      {visible.map((img, i) => (
        <div
          key={img.id}
          className={[
            'relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200/60',
            visible.length === 3 && i === 0 ? 'aspect-[16/10] sm:aspect-auto sm:row-span-2' : 'aspect-[4/3]',
            visible.length === 1 ? 'aspect-[16/8]' : '',
          ].join(' ')}
        >
          <img src={img.url} alt={img.altText ?? ''} className="h-full w-full object-cover" />
          {extra > 0 && i === visible.length - 1 && (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white">
              +{extra}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

/** Inline interaction-stat row. Hides entirely when there are no counts. */
function InteractionsRow({ rows }: { rows: { label: string; value: number }[] }) {
  if (rows.length === 0) return null
  return (
    <div className="flex flex-wrap gap-5 text-sm text-gray-500">
      {rows.map((r) => (
        <span key={r.label}>
          <b className="font-semibold" style={{ color: colors.blueDark }}>{r.value.toLocaleString('es-AR')}</b> {r.label.toLowerCase()}
        </span>
      ))}
    </div>
  )
}

/**
 * Centre-column body for Paper / Podcast / Novedad — the three non-thread
 * detail formats. `<DetailShell>` supplies the hero, reading-progress bar
 * and the share/related sidebar; this only renders the format-specific
 * article body:
 * - Paper: article prose + gallery, a flat footer (tags left, interactions
 *   right), then an external-links CTA card (if any).
 * - Podcast: the external-link CTA (Spotify/YouTube) up front — platform
 *   links are the point — then prose + the same flat footer.
 * - Novedad: media-first/promotional — not a long-form article. A
 *   YouTube-recognizable external link (see `getYouTubeEmbedUrl`) renders as
 *   an embedded 16:9 player right after the tags; otherwise `images[]`
 *   (gallery only — `imageUrl` is excluded since `<ArticleHero>` already
 *   shows it as the hero) renders as a promotional collage
 *   (`<NovedadCollage>`). The `content` field renders below as short
 *   promotional copy, not article prose. Any non-YouTube external links
 *   still render via `<ExternalLinksCTA>`.
 */
export function PublicationDetail({ publication, type, slug, related, embedded = false }: PublicationDetailProps) {
  const rows = interactionRows(publication.interactions, slug)
  const typeName = type?.name ?? ''
  const ctaLabel = `${typeName} · ${formatForoDate(publication.createdAt)}`

  let body: ReactNode

  if (slug === 'paper') {
    body = (
      <article>
        <Prose content={publication.content} />
        <Gallery images={publication.images} />
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6">
          <CategoryList categories={publication.categories} />
          <InteractionsRow rows={rows} />
        </footer>
        {publication.externalLinks.length > 0 && (
          <div className="mt-6 max-w-md">
            <ExternalLinksCTA label={ctaLabel} title={publication.title} links={publication.externalLinks} />
          </div>
        )}
        <CommentThread publicationId={publication.id} commentCount={publication.interactions?.comments} />
      </article>
    )
  } else if (slug === 'podcast') {
    body = (
      <article>
        {publication.externalLinks.length > 0 && (
          <div className="mb-7 max-w-md">
            <ExternalLinksCTA label={ctaLabel} title={publication.title} links={publication.externalLinks} />
          </div>
        )}
        <Prose content={publication.content} />
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6">
          <CategoryList categories={publication.categories} />
          <InteractionsRow rows={rows} />
        </footer>
        <CommentThread publicationId={publication.id} commentCount={publication.interactions?.comments} />
      </article>
    )
  } else {
    const youtubeLink = publication.externalLinks.find((link) => getYouTubeEmbedUrl(link.url) !== null)
    const embedUrl = youtubeLink ? getYouTubeEmbedUrl(youtubeLink.url) : null
    const otherLinks = publication.externalLinks.filter((link) => getYouTubeEmbedUrl(link.url) === null)

    body = (
      <article>
        <div className="mb-5"><CategoryList categories={publication.categories} /></div>
        {embedUrl
          ? <NovedadVideo embedUrl={embedUrl} title={publication.title} />
          : <NovedadCollage images={publication.images} />}
        <Prose content={publication.content} size="lg" />
        {otherLinks.length > 0 && (
          <div className="mt-7 max-w-md">
            <ExternalLinksCTA label={ctaLabel} title={publication.title} links={otherLinks} />
          </div>
        )}
        <div className="mt-8 border-t border-gray-100 pt-6">
          <InteractionsRow rows={rows} />
        </div>
        <CommentThread publicationId={publication.id} commentCount={publication.interactions?.comments} />
      </article>
    )
  }

  return (
    <DetailShell publication={publication} slug={slug} typeName={typeName} related={related} embedded={embedded}>
      {body}
    </DetailShell>
  )
}
