import type { Publication, PublicationPreview } from '@features/foro'
import { DetailShell } from './DetailShell'
import { CommentThread } from './CommentThread'
import { CategoryList } from './CategoryList'
import { ExternalLinksCTA } from './ExternalLinksCTA'
import { Prose } from './Prose'
import { Gallery } from './Gallery'
import { formatForoDate } from './foroHelpers'

interface DiscussionDetailProps {
  publication: Publication
  typeName: string
  related: PublicationPreview[]
  /**
   * Vista previa (formulario del admin / demo): la publicación todavía no
   * existe, así que el composer se muestra deshabilitado y nunca escribe.
   * `useComments` ya se auto-desactiva con `id <= 0`, así que en preview el
   * hilo tampoco hace lecturas.
   */
  preview?: boolean
  /** Forwarded to `<DetailShell>` — full-width, single-column, no sidebar (composer preview). */
  embedded?: boolean
}

/**
 * Discusión detail screen — built on FLAT publication comments via
 * `/interactions` (type_id=2). The publication itself is the original post;
 * comments are the replies. No nested replies / no "best answer" (not
 * modeled by the backend) — rendered flat.
 *
 * `<DetailShell>` supplies the hero (title/meta/share/save), reading-progress
 * bar and the share/related sidebar — this only renders the OP body + the
 * comment thread. Discusiones can have a cover image, a gallery and external
 * links like the other formats: `<ArticleHero>` renders `imageUrl` when
 * present (falling back to an accent gradient otherwise), `<Gallery>` renders
 * `images[]` below the body, and `<ExternalLinksCTA>` renders
 * `publication.externalLinks` (hidden entirely when the list is empty). Their
 * "share" card/related list work exactly like the other three formats — the
 * save and sharing affordances are the same everywhere.
 */
export function DiscussionDetail({ publication, typeName, related, preview = false, embedded = false }: DiscussionDetailProps) {
  const ctaLabel = `${typeName} · ${formatForoDate(publication.createdAt)}`

  return (
    <DetailShell publication={publication} slug="discusion" typeName={typeName} related={related} embedded={embedded}>
      <article>
        {publication.categories.length > 0 && (
          <div className="mb-5"><CategoryList categories={publication.categories} /></div>
        )}
        <Prose content={publication.content} />
        <Gallery images={publication.images} />
        {publication.externalLinks.length > 0 && (
          <div className="mt-6 max-w-md"><ExternalLinksCTA label={ctaLabel} title={publication.title} links={publication.externalLinks} /></div>
        )}

        <CommentThread
          publicationId={publication.id}
          commentCount={publication.interactions?.comments}
          noun="respuestas"
          preview={preview}
        />
      </article>
    </DetailShell>
  )
}
