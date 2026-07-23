import type { Interaction } from '@features/foro'
import { useForoAuth } from '@features/foro'
import { formatForoDate, initialsOf } from './foroHelpers'
import { colors } from '../../../../theme'

interface CommentListProps {
  comments: Interaction[]
  onDelete?: (id: number) => void
}

/** Flat comment thread — no nested replies / no "best answer" (not modeled by the backend). */
export function CommentList({ comments, onDelete }: CommentListProps) {
  const { user, role } = useForoAuth()

  if (comments.length === 0) {
    return <p className="py-6 text-sm text-gray-500">Todavía no hay respuestas. Sé el primero en comentar.</p>
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {comments.map((comment) => {
        const author = comment.createdBy ?? 'Miembro del foro'
        const canManage = onDelete && (comment.userId === user?.id || role === 'admin')
        return (
          <div className="flex gap-3 py-5" key={comment.id}>
            <span
              className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{ backgroundColor: `${colors.tealMid}1a`, color: colors.tealDeep }}
            >
              {initialsOf(author)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-semibold" style={{ color: colors.blueDark }}>{author}</span>
                <span className="text-xs text-gray-400">{formatForoDate(comment.createdAt)}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{comment.content}</p>
              {canManage && (
                <button
                  type="button"
                  className="mt-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-red-500"
                  onClick={() => onDelete?.(comment.id)}
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
