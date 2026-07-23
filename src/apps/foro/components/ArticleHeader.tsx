import type { CSSProperties } from 'react'
import type { KnownPublicationTypeSlug } from '@features/foro'
import { formatForoDate, initialsOf, typeSlugToCssVar } from '../lib/typeStyle'

interface ArticleHeaderProps {
  slug: KnownPublicationTypeSlug | null
  title: string
  subtitle?: string | null
  createdBy: string
  createdAt: Date
}

/**
 * Shared editorial header for all four detail layouts (paper, podcast,
 * novedad, discusión): serif H1 closed with an accent "period", an italic
 * standfirst from `subtitle` when present, and a byline row (avatar initials
 * + name + date) closed off by a hairline rule. `--foro-cat` is set locally
 * so the accent period picks up the right category color regardless of
 * which layout wrapper renders this. No type eyebrow/tag here — the
 * publication is already on a type-filtered view or list where the type is
 * identified elsewhere (`.foro-strip-eyebrow`, list-card `<CategoryTag>`).
 *
 * Novedades are institutional announcements, not authored pieces: the byline
 * drops the avatar/name for that slug and keeps only the date.
 */
export function ArticleHeader({ slug, title, subtitle, createdBy, createdAt }: ArticleHeaderProps) {
  const catStyle = { '--foro-cat': typeSlugToCssVar(slug) } as CSSProperties
  const isNovedad = slug === 'novedad'
  return (
    <header className="foro-article-head" style={catStyle}>
      <h1>{title}<span className="foro-accent-period">.</span></h1>
      {subtitle && <p className="foro-standfirst">{subtitle}</p>}
      <div className="foro-byline">
        {!isNovedad && (
          <>
            <span className="foro-avatar">{initialsOf(createdBy)}</span>
            <span>{createdBy}</span>
            <span className="foro-dotsep" />
          </>
        )}
        <span>{formatForoDate(createdAt)}</span>
      </div>
    </header>
  )
}
