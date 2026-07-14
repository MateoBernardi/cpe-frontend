import type { Publication, PublicationPreview, PublicationType, KnownPublicationTypeSlug } from '@features/foro'
import { CategoryTag } from './CategoryTag'
import { TagList } from './TagList'
import { InfoCard } from './InfoCard'
import { ExternalLinksCTA } from './ExternalLinksCTA'
import { PublicationListItem } from './PublicationListItem'
import { formatForoDate, initialsOf } from '../lib/typeStyle'
import { interactionRows } from '../lib/interactionRows'

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
 * Shared structural template for Paper / Podcast / Novedad, per the design
 * handoff. Paper & Podcast get the two-column layout with a sticky `.rail`
 * (CTA card of external_links + info card of interaction stats); Novedad is
 * a single centered column with an inline stat row instead.
 */
export function PublicationDetail({ publication, type, slug, related }: PublicationDetailProps) {
  const rows = interactionRows(publication.interactions, slug)
  const ctaLabel = `${type?.name?.toUpperCase() ?? ''} · ${formatForoDate(publication.createdAt).toUpperCase()}`

  const header = (
    <>
      <CategoryTag slug={slug} label={type?.name ?? ''} />
      <h1>{publication.title}</h1>
      <div className="foro-meta">
        <span className="foro-avatar">{initialsOf(publication.createdBy)}</span>
        <span>{publication.createdBy}</span>
        <span className="foro-dotsep" />
        <span>{formatForoDate(publication.createdAt)}</span>
      </div>
    </>
  )

  const body = (
    <>
      {publication.subtitle && <p className="foro-lede">{publication.subtitle}</p>}
      {publication.imageUrl && (
        <div className="foro-hero-img"><img src={publication.imageUrl} alt="" /></div>
      )}
      <TagList tags={publication.tags} />
      <Prose content={publication.content} />
      <Gallery images={publication.images} />
    </>
  )

  const relatedBlock = related.length > 0 && (
    <div className="foro-related">
      <h3 className="foro-block-title">Relacionados</h3>
      <div className="foro-list foro-cols-3">
        {related.map((item, i) => (
          <PublicationListItem key={item.id} publication={item} typeSlug={slug} typeName={type?.name ?? ''} index={i + 1} />
        ))}
      </div>
    </div>
  )

  if (slug === 'novedad') {
    return (
      <article className="foro-news">
        {header}
        {body}
        {rows.length > 0 && (
          <div className="foro-interactions">
            {rows.map((r) => <span key={r.label}><b>{r.value.toLocaleString('es-AR')}</b> {r.label.toLowerCase()}</span>)}
          </div>
        )}
        {relatedBlock}
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
        {body}
        {relatedBlock}
      </article>
    </div>
  )
}
