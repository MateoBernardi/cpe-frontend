import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { PublicationPreview, KnownPublicationTypeSlug } from '@features/foro'
import { SpotifyLink } from './SpotifyLink'
import { YouTubeMark } from './PlatformMarks'
import { formatForoDate, initialsOf, typeSlugToCssVar, typeSlugChannelLabel } from '../lib/typeStyle'
import { findYouTubeLink } from '../lib/youtube'
import './magazine.css'

interface TypeHeroProps {
  publication: PublicationPreview
  typeSlug: KnownPublicationTypeSlug | null
}

/** 'spotify' → 'Spotify', 'sitio web' → 'Sitio web'. */
function prettyExternalLinkLabel(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Podcasts read as "Escuchar en Spotify →"; every other type as "Ver en …→". */
function externalLinkCtaVerb(typeSlug: KnownPublicationTypeSlug | null): string {
  return typeSlug === 'podcast' ? 'Escuchar' : 'Ver'
}

/**
 * External-channel CTAs (Spotify/YouTube/…) for the hero's featured
 * publication. Spotify links get the richer <SpotifyLink> "listen card"
 * (channel picture + wordmark); youtube links get the dedicated
 * `.foro-btn-youtube` treatment (near-black/white, AA-legible) plus the
 * inline <YouTubeMark/> logo; every other label keeps the plain teal
 * `.foro-btn` treatment used elsewhere in the foro. Optional on previews:
 * renders nothing when `externalLinks` is absent/empty. Sits as a sibling of
 * the title/meta `<Link>`s below, never nested inside one, so it never
 * conflicts with the hero's own navigation.
 */
function ExternalLinksHero({ links, typeSlug, episodeTitle }: { links: PublicationPreview['externalLinks']; typeSlug: KnownPublicationTypeSlug | null; episodeTitle: string }) {
  if (!links || links.length === 0) return null
  return (
    <div className="foro-typehero-links">
      {links.map((link) => {
        if (link.label === 'spotify') {
          return <SpotifyLink key={link.label} url={link.url} episodeTitle={episodeTitle} />
        }
        const isYouTube = link.label === 'youtube'
        return (
          <a
            key={link.label}
            className={['foro-btn', isYouTube ? 'foro-btn-youtube' : 'foro-btn-teal'].join(' ')}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {isYouTube && <YouTubeMark />}
            {externalLinkCtaVerb(typeSlug)} en {prettyExternalLinkLabel(link.label)} →
          </a>
        )
      })}
    </div>
  )
}

/**
 * Large magazine-style "destacada" hero for the newest publication of the
 * currently selected publication type. Sits above <MagazineGrid> on a
 * type/category view. Image/text side by side on desktop, stacked on
 * mobile — flat: hairline rule only, no shadow/elevation, foro.css tokens
 * throughout. Falls back to a flat accent-tinted `.foro-ph` panel (same
 * convention as <PublicationListItem>) when there is no cover image.
 *
 * Novedades get a deliberately different, media-first treatment
 * (`.foro-novedad-hero`): a full-bleed image break-out (no author avatar —
 * a novedad is an institutional announcement, not an authored piece) with a
 * compact caption below carrying only the date + title + optional short
 * subtitle. A small badge flags when the featured novedad has an attached
 * video (a YouTube-recognizable external link), matching the promotional
 * video embed the detail page renders for that case.
 */
export function TypeHero({ publication, typeSlug }: TypeHeroProps) {
  const to = `/publicaciones/${publication.id}`

  if (typeSlug === 'novedad') {
    const hasVideo = findYouTubeLink(publication.externalLinks) != null
    return (
      <section className="foro-novedad-hero">
        <Link className="foro-novedad-hero-media" to={to} aria-hidden tabIndex={-1}>
          <div className="foro-ph foro-novedad-hero-img">
            {publication.imageUrl
              ? <img src={publication.imageUrl} alt="" />
              : <span>img</span>}
          </div>
          {hasVideo && (
            <span className="foro-novedad-hero-video-badge"><YouTubeMark size={14} /> Video</span>
          )}
        </Link>
        <div className="foro-novedad-hero-caption">
          <span className="foro-strip-eyebrow foro-novedad-hero-eyebrow">Destacada · {typeSlugChannelLabel(typeSlug)}</span>
          <h2><Link to={to}>{publication.title}</Link></h2>
          {publication.subtitle && <p className="foro-standfirst">{publication.subtitle}</p>}
          <span className="foro-novedad-hero-date">{formatForoDate(publication.createdAt)}</span>
          <Link className="foro-sec-link foro-typehero-cta" to={to}>Ver más →</Link>
        </div>
      </section>
    )
  }

  const catStyle = { '--foro-cat': typeSlugToCssVar(typeSlug) } as CSSProperties

  return (
    <section className="foro-typehero" style={catStyle}>
      <Link className="foro-typehero-media" to={to} aria-hidden tabIndex={-1}>
        <div className="foro-ph foro-typehero-img">
          {publication.imageUrl
            ? <img src={publication.imageUrl} alt="" />
            : <span>img</span>}
        </div>
      </Link>
      <div className="foro-typehero-body">
        <span className="foro-strip-eyebrow">Destacada · {typeSlugChannelLabel(typeSlug)}</span>
        <h2><Link to={to}>{publication.title}</Link></h2>
        {publication.subtitle && <p className="foro-standfirst">{publication.subtitle}</p>}
        <div className="foro-card-meta">
          <span className="foro-avatar">{initialsOf(publication.createdBy)}</span>
          <span>{publication.createdBy}</span>
          <span className="foro-dotsep" />
          <span>{formatForoDate(publication.createdAt)}</span>
        </div>
        <ExternalLinksHero links={publication.externalLinks} typeSlug={typeSlug} episodeTitle={publication.title} />
        <Link className="foro-sec-link foro-typehero-cta" to={to}>Leer más →</Link>
      </div>
    </section>
  )
}
