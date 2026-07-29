import type { Publication, PublicationPreview } from '@features/foro'
import { DetailShell } from './DetailShell'
import { CommentThread } from './CommentThread'
import { CategoryList } from './CategoryList'
import { Prose } from './Prose'
import { Gallery } from './Gallery'

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
 * comment thread. Discusiones can have a cover image and a gallery like the
 * other formats: `<ArticleHero>` renders `imageUrl` when present (falling
 * back to an accent gradient otherwise), and `<Gallery>` renders `images[]`
 * below the body. Their "share" card/related list work exactly like the
 * other three formats — the save and sharing affordances are the same
 * everywhere.
 */
export function DiscussionDetail({ publication, typeName, related, preview = false, embedded = false }: DiscussionDetailProps) {
  return (
    <DetailShell publication={publication} slug="discusion" typeName={typeName} related={related} embedded={embedded}>
      <article>
        {publication.categories.length > 0 && (
          <div className="mb-5"><CategoryList categories={publication.categories} /></div>
        )}
        <Prose content={publication.content} />
        <Gallery images={publication.images} />

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
