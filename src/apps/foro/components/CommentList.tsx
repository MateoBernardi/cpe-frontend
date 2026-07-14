import type { Interaction } from '@features/foro'
import { useForoAuth } from '@features/foro'
import { formatForoDate, initialsOf } from '../lib/typeStyle'

interface CommentListProps {
  comments: Interaction[]
  onDelete?: (id: number) => void
}

/** Flat comment thread — no nested replies / no "best answer" (not modeled by the backend). */
export function CommentList({ comments, onDelete }: CommentListProps) {
  const { user, role } = useForoAuth()

  if (comments.length === 0) {
    return <p style={{ color: 'var(--foro-muted)', fontSize: 14.5, padding: '18px 0' }}>Todavía no hay respuestas. Sé el primero en comentar.</p>
  }

  return (
    <div className="foro-thread">
      {comments.map((comment) => {
        const author = comment.createdBy ?? 'Miembro del foro'
        const canManage = onDelete && (comment.userId === user?.id || role === 'admin')
        return (
          <div className="foro-reply" key={comment.id}>
            <div className="foro-who">
              <span className="foro-avatar">{initialsOf(author)}</span>
            </div>
            <div className="foro-content">
              <b>{author}</b>
              <p>{comment.content}</p>
              <div className="foro-t">
                <span>{formatForoDate(comment.createdAt)}</span>
                {canManage && (
                  <button type="button" onClick={() => onDelete?.(comment.id)}>Eliminar</button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
