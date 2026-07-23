import type { Publication, PublicationPreview, PublicationType, KnownPublicationTypeSlug } from '@features/foro'
import { ArticleHeader } from './ArticleHeader'
import { TagList } from './TagList'
import { InfoCard } from './InfoCard'
import { ExternalLinksCTA } from './ExternalLinksCTA'
import { PublicationListItem } from './PublicationListItem'
import { formatForoDate } from '../lib/typeStyle'
import { interactionRows } from '../lib/interactionRows'
import { getYouTubeEmbedUrl } from '../lib/youtube'

interface PublicationDetailProps {
  publication: Publication
  type: PublicationType | undefined
  slug: Exclude<KnownPublicationTypeSlug, 'discusion'>
  related: PublicationPreview[]
}

function Prose({ content }: { content: string }) {
  const paragraphs = content.split(/\n{2,}/).filter((p) => p.trim().length > 0)
  return (
    <div className="foro-prose">
      {(paragraphs.length > 0 ? paragraphs : [content]).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  )
}

function Gallery({ images }: { images: Publication['images'] }) {
  if (!images || images.length === 0) return null
  return (
    <div className="foro-gallery">
      {images.map((img) => (
        <img key={img.id} src={img.url} alt={img.altText ?? ''} />
      ))}
    </div>
  )
}

/**
 * `.foro-news-video` — 16:9 YouTube embed for a novedad whose external links
 * contain a recognizable YouTube URL (see `getYouTubeEmbedUrl`). Runtime
 * browser embed only, no external fetch from our side.
 */
function NovedadVideo({ embedUrl, title }: { embedUrl: string; title: string }) {
  return (
    <div className="foro-news-video">
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  )
}

/**
 * `.foro-news-collage` — promotional image collage for a novedad with no
 * embeddable video: `imageUrl` (front cover) + `images[]` (gallery) combined
 * into a single ordered list. Layout adapts to the count (1 = full-bleed,
 * 2 = even split, 3+ = one large + supporting stack), capped at 3 visible
 * tiles with a "+N" badge on the last one when there's more.
 */
function NovedadCollage({ imageUrl, images }: { imageUrl: string | null; images: Publication['images'] }) {
  const combined = [
    ...(imageUrl ? [{ id: -1, url: imageUrl, altText: null as string | null }] : []),
    ...(images ?? []),
  ]
  if (combined.length === 0) return null

  const visible = combined.slice(0, 3)
  const extra = combined.length - visible.length

  return (
    <div className={`foro-news-collage foro-news-collage-${visible.length}`}>
      {visible.map((img, i) => (
        <div key={img.id} className="foro-news-collage-item">
          <img src={img.url} alt={img.altText ?? ''} />
          {extra > 0 && i === visible.length - 1 && (
            <span className="foro-news-collage-more">+{extra}</span>
          )}
        </div>
      ))}
    </div>
  )
}

/** `.foro-interactions` — inline mono stat row. Hides entirely when there are no counts. */
function InteractionsRow({ rows }: { rows: { label: string; value: number }[] }) {
  if (rows.length === 0) return null
  return (
    <div className="foro-interactions">
      {rows.map((r) => <span key={r.label}><b>{r.value.toLocaleString('es-AR')}</b> {r.label.toLowerCase()}</span>)}
    </div>
  )
}

function RelatedBlock({ related, slug, typeName }: { related: PublicationPreview[]; slug: KnownPublicationTypeSlug | null; typeName: string }) {
  if (related.length === 0) return null
  return (
    <div className="foro-related">
      <h3 className="foro-block-title">Seguir leyendo</h3>
      <div className="foro-list foro-cols-3">
        {related.map((item, i) => (
          <PublicationListItem key={item.id} publication={item} typeSlug={slug} typeName={typeName} index={i + 1} />
        ))}
      </div>
    </div>
  )
}

/**
 * Structural template for Paper / Podcast / Novedad detail screens — all
 * three share the `<ArticleHeader>` editorial treatment (tag, serif H1 with
 * accent period, italic standfirst, byline + hairline rule):
 * - Paper (`.foro-paper`): single centered editorial column with a wide
 *   hero break-out, a drop-cap first paragraph, and a flat article footer
 *   (tags left, interactions right). External links (if any) render as an
 *   inline CTA card below the footer — papers no longer use a side rail.
 * - Podcast (`.foro-pod-grid`): keeps the two-column layout with a sticky
 *   rail (external-link CTA + stats) since platform links need to stay
 *   prominent.
 * - Novedad (`.foro-news`): media-first/promotional — not a long-form
 *   article. A YouTube-recognizable external link (see `getYouTubeEmbedUrl`)
 *   renders as an embedded 16:9 player right after the header; otherwise
 *   `imageUrl` + `images[]` combine into a promotional collage
 *   (`<NovedadCollage>`). The `content` field renders below as short
 *   promotional copy (`.foro-news-promo-copy`), not article prose. Any
 *   non-YouTube external links still render via `<ExternalLinksCTA>`.
 */
export function PublicationDetail({ publication, type, slug, related }: PublicationDetailProps) {
  const rows = interactionRows(publication.interactions, slug)
  const typeName = type?.name ?? ''
  const ctaLabel = `${typeName.toUpperCase()} · ${formatForoDate(publication.createdAt).toUpperCase()}`

  const header = (
    <ArticleHeader
      slug={slug}
      title={publication.title}
      subtitle={publication.subtitle}
      createdBy={publication.createdBy}
      createdAt={publication.createdAt}
    />
  )

  if (slug === 'paper') {
    return (
      <article className="foro-paper">
        {header}
        {publication.imageUrl && (
          <div className="foro-paper-hero"><img src={publication.imageUrl} alt="" /></div>
        )}
        <div className="foro-paper-body">
          <Prose content={publication.content} />
          <Gallery images={publication.images} />
        </div>
        <footer className="foro-paper-footer">
          <TagList tags={publication.tags} />
          <InteractionsRow rows={rows} />
        </footer>
        {publication.externalLinks.length > 0 && (
          <div className="foro-paper-cta">
            <ExternalLinksCTA label={ctaLabel} title={publication.title} links={publication.externalLinks} />
          </div>
        )}
        <RelatedBlock related={related} slug={slug} typeName={typeName} />
      </article>
    )
  }

  if (slug === 'novedad') {
    const youtubeLink = publication.externalLinks.find((link) => getYouTubeEmbedUrl(link.url) !== null)
    const embedUrl = youtubeLink ? getYouTubeEmbedUrl(youtubeLink.url) : null
    const otherLinks = publication.externalLinks.filter((link) => getYouTubeEmbedUrl(link.url) === null)

    return (
      <article className="foro-news">
        {header}
        {embedUrl
          ? <NovedadVideo embedUrl={embedUrl} title={publication.title} />
          : <NovedadCollage imageUrl={publication.imageUrl} images={publication.images} />}
        <div className="foro-news-promo-copy">
          <TagList tags={publication.tags} />
          <Prose content={publication.content} />
        </div>
        {otherLinks.length > 0 && (
          <div className="foro-news-cta">
            <ExternalLinksCTA label={ctaLabel} title={publication.title} links={otherLinks} />
          </div>
        )}
        <InteractionsRow rows={rows} />
        <RelatedBlock related={related} slug={slug} typeName={typeName} />
      </article>
    )
  }

  return (
    <div className="foro-pod-grid">
      <aside className="foro-rail">
        <ExternalLinksCTA
          label={ctaLabel}
          title={publication.title}
          links={publication.externalLinks}
        />
        <InfoCard rows={rows} />
      </aside>
      <article className="foro-pod-main">
        {header}
        {publication.imageUrl && (
          <div className="foro-hero-img"><img src={publication.imageUrl} alt="" /></div>
        )}
        <TagList tags={publication.tags} />
        <Prose content={publication.content} />
        <Gallery images={publication.images} />
        <RelatedBlock related={related} slug={slug} typeName={typeName} />
      </article>
    </div>
  )
}
