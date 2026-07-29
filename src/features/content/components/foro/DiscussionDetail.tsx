import type { Publication, PublicationPreview } from '@features/foro'
import { useComments, useCommentMutations } from '@features/foro'
import { DetailShell } from './DetailShell'
import { CommentList } from './CommentList'
import { CommentComposer } from './CommentComposer'
import { TagList } from './TagList'
import { Prose } from './Prose'
import { Gallery } from './Gallery'
import { colors } from '../../../../theme'

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
  const { data: comments, isLoading } = useComments(publication.id)
  const { create, remove } = useCommentMutations(publication.id)

  const replyCount = comments?.length ?? publication.interactions?.comments ?? 0

  return (
    <DetailShell publication={publication} slug="discusion" typeName={typeName} related={related} embedded={embedded}>
      <article>
        {publication.tags.length > 0 && (
          <div className="mb-5"><TagList tags={publication.tags} /></div>
        )}
        <Prose content={publication.content} />
        <Gallery images={publication.images} />

        <h3 className="font-primary mb-2 mt-10 border-b border-gray-100 pb-3 text-lg font-bold" style={{ color: colors.blueDark }}>
          {replyCount} respuestas
        </h3>
        {isLoading ? (
          <p className="py-5 text-sm text-gray-500">Cargando respuestas…</p>
        ) : (
          <CommentList comments={comments ?? []} onDelete={(id) => remove.mutate(id)} />
        )}

        <CommentComposer
          preview={preview}
          onSubmit={(content) => (preview ? Promise.resolve() : create.mutateAsync(content))}
          isSubmitting={create.isPending}
        />
      </article>
    </DetailShell>
  )
}
