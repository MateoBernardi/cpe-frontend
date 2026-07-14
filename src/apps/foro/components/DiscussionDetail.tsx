import type { Publication, PublicationPreview } from '@features/foro'
import { useComments, useCommentMutations } from '@features/foro'
import { CategoryTag } from './CategoryTag'
import { InfoCard } from './InfoCard'
import { CommentList } from './CommentList'
import { CommentComposer } from './CommentComposer'
import { PublicationListItem } from './PublicationListItem'
import { formatForoDate, initialsOf } from '../lib/typeStyle'

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
 */
export function DiscussionDetail({ publication, typeName, related }: DiscussionDetailProps) {
  const { data: comments, isLoading } = useComments(publication.id)
  const { create, remove } = useCommentMutations(publication.id)

  const replyCount = comments?.length ?? publication.interactions?.comments ?? 0

  return (
    <div className="foro-pod-grid">
      <article className="foro-pod-main">
        <CategoryTag slug="discusion" label={typeName} />
        <h1>{publication.title}</h1>

        <div className="foro-op">
          <div className="foro-who">
            <span className="foro-avatar">{initialsOf(publication.createdBy)}</span>
            <b>{publication.createdBy}</b>
            <span className="foro-dotsep" />
            <span>{formatForoDate(publication.createdAt)}</span>
          </div>
          <div className="foro-body">
            {publication.content.split(/\n{2,}/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </div>
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
