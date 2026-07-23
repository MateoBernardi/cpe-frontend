import type { Publication, PublicationPreview } from '@features/foro'
import { useComments, useCommentMutations } from '@features/foro'
import { ArticleHeader } from './ArticleHeader'
import { InfoCard } from './InfoCard'
import { CommentList } from './CommentList'
import { CommentComposer } from './CommentComposer'
import { PublicationListItem } from './PublicationListItem'

interface DiscussionDetailProps {
  publication: Publication
  typeName: string
  related: PublicationPreview[]
}

/**
 * Discusión detail screen — built on FLAT publication comments via
 * `/interactions` (type_id=2). The publication itself is the original post;
 * comments are the replies. No nested replies / no "best answer" (not
 * modeled by the backend) — rendered flat.
 *
 * Header uses the shared editorial treatment (`<ArticleHeader>`); the OP
 * body sits directly below it with no duplicate byline — the header's own
 * hairline rule already separates it from the thread.
 */
export function DiscussionDetail({ publication, typeName, related }: DiscussionDetailProps) {
  const { data: comments, isLoading } = useComments(publication.id)
  const { create, remove } = useCommentMutations(publication.id)

  const replyCount = comments?.length ?? publication.interactions?.comments ?? 0

  return (
    <div className="foro-pod-grid">
      <article className="foro-pod-main">
        <ArticleHeader
          slug="discusion"
          typeName={typeName}
          title={publication.title}
          subtitle={publication.subtitle}
          createdBy={publication.createdBy}
          createdAt={publication.createdAt}
        />

        <div className="foro-prose foro-op-body">
          {publication.content.split(/\n{2,}/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <h3 className="foro-block-title">{replyCount} respuestas</h3>
        {isLoading ? (
          <p style={{ color: 'var(--foro-muted)', padding: '18px 0' }}>Cargando respuestas…</p>
        ) : (
          <CommentList comments={comments ?? []} onDelete={(id) => remove.mutate(id)} />
        )}

        <CommentComposer
          onSubmit={(content) => create.mutateAsync(content)}
          isSubmitting={create.isPending}
        />

        {related.length > 0 && (
          <div className="foro-related">
            <h3 className="foro-block-title">Otras conversaciones</h3>
            <div className="foro-list foro-cols-3">
              {related.map((item, i) => (
                <PublicationListItem key={item.id} publication={item} typeSlug="discusion" typeName={typeName} index={i + 1} />
              ))}
            </div>
          </div>
        )}
      </article>

      <aside className="foro-rail">
        <InfoCard rows={[{ label: 'Respuestas', value: replyCount }]} />
      </aside>
    </div>
  )
}
