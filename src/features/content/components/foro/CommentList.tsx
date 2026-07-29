import { useState } from 'react'
import type { Interaction } from '@features/foro'
import { useForoAuth } from '@features/foro'
import { FavoriteButton } from './FavoriteButton'
import { CommentComposer } from './CommentComposer'
import { formatForoDate, initialsOf } from './foroHelpers'
import { colors } from '../../../../theme'

/**
 * Tope de anidación que refleja `MAX_COMMENT_DEPTH` del backend. No se usa para decidir dónde
 * colgar una respuesta (eso lo resuelve el servidor, que aplana lo que se pasa del tope), sino
 * sólo para dejar de ofrecer "Responder" en el último nivel: ofrecerlo mostraría la respuesta un
 * nivel más adentro de donde realmente va a terminar.
 */
const MAX_COMMENT_DEPTH = 2

/**
 * Cuántos comentarios raíz se muestran antes del botón "mostrar más".
 *
 * El backend devuelve el hilo por `created_at` ASCENDENTE (más viejos primero), que es el orden en
 * que se lee una conversación, así que el recorte se lleva los ÚLTIMOS: quedan visibles los 2
 * primeros y el resto se revela hacia abajo. Ojo con esto — implica que el comentario que acabás de
 * escribir queda oculto, y por eso `<CommentThread>` despliega la lista al publicar uno.
 */
const ROOT_PREVIEW_COUNT = 2

interface CommentListProps {
  comments: Interaction[]
  publicationId: number
  onDelete?: (id: number) => void
  onEdit?: (id: number, content: string) => Promise<unknown>
  onReply?: (parentId: number, content: string) => Promise<unknown>
  /**
   * Id del comentario que tiene la caja de respuesta abierta, o `null` si ninguno. Vive arriba, en
   * `<CommentThread>`, y no como estado local de cada nodo, por dos razones: sólo puede haber una
   * respuesta en curso a la vez, y el hilo necesita saberlo para esconder su composer general
   * mientras se está respondiendo a alguien puntual (si no, quedan dos cajas de texto abiertas y no
   * se distingue cuál escribe una respuesta y cuál un comentario nuevo).
   */
  replyingToId?: number | null
  onReplyingToChange?: (id: number | null) => void
  /**
   * Ids de los comentarios con sus respuestas desplegadas. También vive arriba y no como estado
   * local de cada nodo: al responder hay que abrir el nodo destino para que la respuesta recién
   * escrita sea visible, y eso lo decide quien maneja `replyingToId`, no el nodo.
   */
  expandedIds?: ReadonlySet<number>
  onToggleReplies?: (id: number) => void
  /** Si se muestran todos los comentarios raíz o sólo los primeros `ROOT_PREVIEW_COUNT`. */
  showAllRoots?: boolean
  onShowAllRoots?: () => void
  /** Vista previa del composer: se ve el hilo pero nada escribe. */
  preview?: boolean
}

interface CommentNodeProps extends Omit<CommentListProps, 'comments'> {
  comment: Interaction
}

function CommentNode({
  comment,
  publicationId,
  onDelete,
  onEdit,
  onReply,
  replyingToId = null,
  onReplyingToChange,
  expandedIds,
  onToggleReplies,
  preview = false,
}: CommentNodeProps) {
  const { user, role } = useForoAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(comment.content ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const isReplying = replyingToId === comment.id
  // Colapsadas por default: un hilo con varias ramas largas empujaba los comentarios raíz fuera de
  // pantalla y no se podía ver de qué se estaba hablando sin scrollear mucho.
  const repliesExpanded = expandedIds?.has(comment.id) ?? false

  // `authorName` viene resuelto por el backend (JOIN a `user.name`); el fallback sólo aplica a un
  // usuario borrado, no al caso normal.
  const author = comment.authorName?.trim() || 'Miembro del foro'
  const isOwner = comment.userId === user?.id
  const canManage = !preview && (isOwner || role === 'admin')
  const canReply = !preview && onReply != null && comment.depth < MAX_COMMENT_DEPTH
  const edited = comment.updatedAt != null && comment.updatedAt.getTime() !== comment.createdAt.getTime()

  const handleSaveEdit = async () => {
    const trimmed = draft.trim()
    if (!trimmed || trimmed === comment.content || isSaving) return
    setIsSaving(true)
    try {
      await onEdit?.(comment.id, trimmed)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="py-5">
      <div className="flex gap-3">
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
            {edited && <span className="text-xs text-gray-400">· editado</span>}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <textarea
                className="min-h-[80px] w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving || !draft.trim() || draft.trim() === comment.content}
                  className="rounded-full px-4 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: colors.ctaPrimary }}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setDraft(comment.content ?? '') }}
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-100"
                  style={{ borderColor: colors.inputBorder, color: colors.blueDark }}
                >
                  <span aria-hidden="true">×</span> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{comment.content}</p>
          )}

          {!isEditing && (
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {/* Se renderiza también para el anónimo: el click abre el diálogo de login. */}
              {!preview && (
                <FavoriteButton
                  publicationId={publicationId}
                  parentId={comment.id}
                  favorited={comment.viewerFavorited}
                  count={comment.favoritesCount}
                  variant="inline"
                />
              )}
              {canReply && (
                isReplying ? (
                  // Cancelar con caja propia (borde + fondo) en vez del mismo texto gris que
                  // "Responder": con la caja de respuesta abierta hay que poder salir de un vistazo,
                  // y dos links grises idénticos no distinguían "abrir" de "cerrar".
                  <button
                    type="button"
                    onClick={() => onReplyingToChange?.(null)}
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-gray-100"
                    style={{ borderColor: colors.inputBorder, color: colors.blueDark }}
                  >
                    <span aria-hidden="true">×</span> Cancelar respuesta
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onReplyingToChange?.(comment.id)}
                    className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-700"
                  >
                    Responder
                  </button>
                )
              )}
              {canManage && onEdit && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-medium text-gray-400 transition-colors hover:text-gray-600"
                >
                  Editar
                </button>
              )}
              {canManage && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="text-xs font-medium text-gray-400 transition-colors hover:text-red-500"
                >
                  Eliminar
                </button>
              )}
            </div>
          )}

          {isReplying && onReply && (
            <CommentComposer
              placeholder={`Respondele a ${author}…`}
              submitLabel="Responder"
              onSubmit={async (content) => {
                await onReply(comment.id, content)
                onReplyingToChange?.(null)
              }}
            />
          )}

          {comment.replies.length > 0 && (
            <button
              type="button"
              onClick={() => onToggleReplies?.(comment.id)}
              aria-expanded={repliesExpanded}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
              style={{ color: colors.tealDeep }}
            >
              <svg
                viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor"
                strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                className={`transition-transform duration-200 motion-reduce:transition-none ${repliesExpanded ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
              {repliesExpanded
                ? 'Ocultar respuestas'
                : `Ver ${comment.replies.length} ${comment.replies.length === 1 ? 'respuesta' : 'respuestas'}`}
            </button>
          )}

          {/* Indentación decreciente: cada nivel sangra menos, así el nivel 2 sigue siendo legible
              en mobile en vez de quedar reducido a una columna de dos palabras. */}
          {repliesExpanded && comment.replies.length > 0 && (
            <div
              className="mt-2 border-l border-gray-100 pl-3 sm:pl-4"
              style={{ marginLeft: comment.depth === 0 ? 0 : 4 }}
            >
              {comment.replies.map((reply) => (
                <CommentNode
                  key={reply.id}
                  comment={reply}
                  publicationId={publicationId}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onReply={onReply}
                  replyingToId={replyingToId}
                  onReplyingToChange={onReplyingToChange}
                  expandedIds={expandedIds}
                  onToggleReplies={onToggleReplies}
                  preview={preview}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Hilo de comentarios anidado. El backend devuelve el árbol ya armado
 * (`GET /publications/:id/comments`, pública) con un tope de 2 niveles de respuesta, así que este
 * componente sólo lo recorre — no calcula profundidades ni reordena.
 *
 * Un usuario anónimo ve el hilo completo, incluidos los botones de favorito y el composer: la
 * pauta de la casa es renderizar la afordancia e interceptar la acción abriendo el diálogo de
 * login, nunca esconder o deshabilitar la UI de interacción.
 */
export function CommentList({
  comments,
  publicationId,
  onDelete,
  onEdit,
  onReply,
  replyingToId = null,
  onReplyingToChange,
  expandedIds,
  onToggleReplies,
  showAllRoots = false,
  onShowAllRoots,
  preview = false,
}: CommentListProps) {
  if (comments.length === 0) {
    return <p className="py-6 text-sm text-gray-500">Todavía no hay respuestas. Sé el primero en comentar.</p>
  }

  const visible = showAllRoots ? comments : comments.slice(0, ROOT_PREVIEW_COUNT)
  const hidden = comments.length - visible.length

  return (
    <>
      <div className="flex flex-col divide-y divide-gray-100">
        {visible.map((comment) => (
          <CommentNode
            key={comment.id}
            comment={comment}
            publicationId={publicationId}
            onDelete={onDelete}
            onEdit={onEdit}
            onReply={onReply}
            replyingToId={replyingToId}
            onReplyingToChange={onReplyingToChange}
            expandedIds={expandedIds}
            onToggleReplies={onToggleReplies}
            preview={preview}
          />
        ))}
      </div>

      {/* Revela TODOS de una y no de a tandas: el hilo ya está entero en memoria (una sola query
          trae el árbol completo), así que paginar acá sería una restricción inventada. */}
      {hidden > 0 && (
        <button
          type="button"
          onClick={onShowAllRoots}
          className="mt-3 w-full border-t border-gray-100 pt-3 text-sm font-semibold transition-colors hover:underline"
          style={{ color: colors.tealDeep }}
        >
          Mostrar {hidden} {hidden === 1 ? 'comentario' : 'comentarios'} más
        </button>
      )}
    </>
  )
}
