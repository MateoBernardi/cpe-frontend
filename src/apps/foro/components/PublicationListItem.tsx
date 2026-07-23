import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { PublicationPreview, KnownPublicationTypeSlug } from '@features/foro'
import { CategoryTag } from './CategoryTag'
import { formatForoDate, initialsOf } from '../lib/typeStyle'

interface PublicationListItemProps {
  publication: PublicationPreview
  typeSlug: KnownPublicationTypeSlug | null
  typeName: string
  index: number
}

/**
 * Channel/external links (Spotify/Apple/YouTube…) rendered as small flat chips.
 * Optional on previews — if the backend hasn't sent `external_links` yet,
 * `externalLinks` is undefined and this renders nothing (never crashes).
 */
function ChannelLinks({ links }: { links: PublicationPreview['externalLinks'] }) {
  if (!links || links.length === 0) return null
  return (
    <div className="foro-channels">
      {links.map((link) => (
        <a
          key={link.label}
          className="foro-channel"
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {link.label}
        </a>
      ))}
    </div>
  )
}

/**
 * `showAuthor` is `false` for novedades: institutional announcements have no
 * author identity, so the row keeps only the date (never the avatar/name).
 */
function MetaLine({ publication, showAuthor = true }: { publication: PublicationPreview; showAuthor?: boolean }) {
  return (
    <div className="foro-card-meta">
      {showAuthor && (
        <>
          <span className="foro-avatar">{initialsOf(publication.createdBy)}</span>
          <span>{publication.createdBy}</span>
          <span className="foro-dotsep" />
        </>
      )}
      <span>{formatForoDate(publication.createdAt)}</span>
    </div>
  )
}

/** `.list-item` — the shared row used across feed strips and related-item lists. */
export function PublicationListItem({ publication, typeSlug, typeName, index }: PublicationListItemProps) {
  const n = String(index).padStart(3, '0')
  const to = `/publicaciones/${publication.id}`
  const catStyle = { '--foro-cat': `var(--foro-c-${typeSlugCssKey(typeSlug)})` } as CSSProperties

  if (typeSlug === 'discusion') {
    const replies = publication.interactions?.comments
    return (
      <article className="foro-list-item foro-is-foro">
        <div className="foro-text">
          <div className="foro-idx">HILO · N.{n}</div>
          <CategoryTag slug={typeSlug} label={typeName} />
          <h3><Link to={to}>{publication.title}</Link></h3>
          {publication.subtitle && <p className="foro-excerpt">{publication.subtitle}</p>}
          {replies != null && (
            <div className="foro-stat">
              <span><b>{replies}</b> respuestas</span>
            </div>
          )}
        </div>
      </article>
    )
  }

  // Novedades read as a "front page": a prominent 16:9 image stacked over the
  // text instead of the small square thumbnail used by papers/podcasts. Still
  // flat — rows separated by the shared hairline rule, no shadow/elevation.
  if (typeSlug === 'novedad') {
    return (
      <article className="foro-list-item foro-is-novedad" style={catStyle}>
        <Link className="foro-novedad-media" to={to} aria-hidden tabIndex={-1}>
          <div className="foro-ph foro-novedad-img">
            {publication.imageUrl
              ? <img src={publication.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span>img</span>}
          </div>
        </Link>
        <div className="foro-text">
          <div className="foro-idx">N.{n}</div>
          <CategoryTag slug={typeSlug} label={typeName} />
          <h3><Link to={to}>{publication.title}</Link></h3>
          {publication.subtitle && <p className="foro-excerpt">{publication.subtitle}</p>}
          <MetaLine publication={publication} showAuthor={false} />
        </div>
      </article>
    )
  }

  return (
    <article className="foro-list-item" style={catStyle}>
      <div className="foro-thumb foro-ph">
        {publication.imageUrl
          ? <img src={publication.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
          : <span>img</span>}
      </div>
      <div className="foro-text">
        <div className="foro-idx">N.{n}</div>
        <CategoryTag slug={typeSlug} label={typeName} />
        <h3><Link to={to}>{publication.title}</Link></h3>
        {publication.subtitle && <p className="foro-excerpt">{publication.subtitle}</p>}
        <MetaLine publication={publication} />
        <ChannelLinks links={publication.externalLinks} />
      </div>
    </article>
  )
}

function typeSlugCssKey(slug: KnownPublicationTypeSlug | null): string {
  switch (slug) {
    case 'paper': return 'papers'
    case 'podcast': return 'podcasts'
    case 'novedad': return 'novedades'
    case 'discusion': return 'foros'
    default: return 'papers'
  }
}
