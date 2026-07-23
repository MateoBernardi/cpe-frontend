import type { ReactNode } from 'react'
import type { Publication, PublicationPreview, PublicationType, KnownPublicationTypeSlug } from '@features/foro'
import { DetailShell } from './DetailShell'
import { TagList } from './TagList'
import { ExternalLinksCTA } from './ExternalLinksCTA'
import { Prose } from './Prose'
import { formatForoDate, interactionRows, getYouTubeEmbedUrl } from './foroHelpers'
import { colors } from '../../../../theme'

interface PublicationDetailProps {
  publication: Publication
  type: PublicationType | undefined
  slug: Exclude<KnownPublicationTypeSlug, 'discusion'>
  related: PublicationPreview[]
}

/**
 * Podcast episode's primary "listen" unit: the episode cover art beside its
 * listen CTA (`<ExternalLinksCTA>`, Spotify/YouTube) so the artwork and the
 * action read as one prominent module instead of the cover living only in
 * the hero, disconnected from the links further down. Cover left / CTA right
 * on desktop, stacked on mobile. Falls back to the plain CTA (no cover
 * frame) when the episode has no `imageUrl`.
 */
function PodcastListenUnit({ publication, ctaLabel }: { publication: Publication; ctaLabel: string }) {
  if (publication.externalLinks.length === 0) return null

  const cta = <ExternalLinksCTA label={ctaLabel} title={publication.title} links={publication.externalLinks} />

  if (!publication.imageUrl) {
    return <div className="mb-7 max-w-md">{cta}</div>
  }

  return (
    <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-stretch">
      <div className="mx-auto aspect-square w-40 shrink-0 overflow-hidden rounded-2xl shadow-md ring-1 ring-slate-200/60 sm:mx-0 sm:w-44">
        <img src={publication.imageUrl} alt="" aria-hidden="true" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">{cta}</div>
    </div>
  )
}

function Gallery({ images }: { images: Publication['images'] }) {
  if (!images || images.length === 0) return null
  return (
    <div className="my-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((img) => (
        <div key={img.id} className="aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-slate-200/60">
          <img src={img.url} alt={img.altText ?? ''} className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  )
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
 * Promotional image collage for a novedad with no embeddable video:
 * `imageUrl` (front cover) + `images[]` (gallery) combined into a single
 * ordered list. Layout adapts to the count (1 = full-bleed, 2 = even split,
 * 3+ = one large + supporting stack), capped at 3 visible tiles with a "+N"
 * badge on the last one when there's more.
 */
function NovedadCollage({ imageUrl, images }: { imageUrl: string | null; images: Publication['images'] }) {
  const combined = [
    ...(imageUrl ? [{ id: -1, url: imageUrl, altText: null as string | null }] : []),
    ...(images ?? []),
  ]
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
 *   an embedded 16:9 player right after the tags; otherwise `imageUrl` +
 *   `images[]` combine into a promotional collage (`<NovedadCollage>`). The
 *   `content` field renders below as short promotional copy, not article
 *   prose. Any non-YouTube external links still render via
 *   `<ExternalLinksCTA>`.
 */
export function PublicationDetail({ publication, type, slug, related }: PublicationDetailProps) {
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
          <TagList tags={publication.tags} />
          <InteractionsRow rows={rows} />
        </footer>
        {publication.externalLinks.length > 0 && (
          <div className="mt-6 max-w-md">
            <ExternalLinksCTA label={ctaLabel} title={publication.title} links={publication.externalLinks} />
          </div>
        )}
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
          <TagList tags={publication.tags} />
          <InteractionsRow rows={rows} />
        </footer>
      </article>
    )
  } else {
    const youtubeLink = publication.externalLinks.find((link) => getYouTubeEmbedUrl(link.url) !== null)
    const embedUrl = youtubeLink ? getYouTubeEmbedUrl(youtubeLink.url) : null
    const otherLinks = publication.externalLinks.filter((link) => getYouTubeEmbedUrl(link.url) === null)

    body = (
      <article>
        <div className="mb-5"><TagList tags={publication.tags} /></div>
        {embedUrl
          ? <NovedadVideo embedUrl={embedUrl} title={publication.title} />
          : <NovedadCollage imageUrl={publication.imageUrl} images={publication.images} />}
        <Prose content={publication.content} size="lg" />
        {otherLinks.length > 0 && (
          <div className="mt-7 max-w-md">
            <ExternalLinksCTA label={ctaLabel} title={publication.title} links={otherLinks} />
          </div>
        )}
        <div className="mt-8 border-t border-gray-100 pt-6">
          <InteractionsRow rows={rows} />
        </div>
      </article>
    )
  }

  return (
    <DetailShell publication={publication} slug={slug} typeName={typeName} related={related}>
      {body}
    </DetailShell>
  )
}
