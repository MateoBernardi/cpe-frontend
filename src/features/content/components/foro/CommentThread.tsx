import { useState } from 'react'
import { useComments, useCommentMutations, getForoApiErrorMessage, isContentRejected } from '@features/foro'
import { CommentList } from './CommentList'
import { CommentComposer } from './CommentComposer'
import { colors, foroPalette } from '../../../../theme'

interface CommentThreadProps {
  publicationId: number
  /** Contador del backend, usado como valor de arranque mientras el hilo carga. */
  commentCount?: number | null
  /** Encabezado del bloque. Discusión dice "respuestas"; el resto, "comentarios". */
  noun?: 'respuestas' | 'comentarios'
  /**
   * Vista previa del composer del publisher: la publicación todavía no existe, así que no se lee ni
   * se escribe nada. `useComments` ya se auto-desactiva con `id <= 0`.
   */
  preview?: boolean
}

/**
 * Hilo de comentarios completo (encabezado + árbol + caja de respuesta), extraído de
 * `DiscussionDetail` para que las cuatro plantillas lo compartan.
 *
 * Antes los comentarios existían SÓLO en la plantilla de discusión, mientras paper/podcast/novedad
 * mostraban un contador de comentarios sin ningún hilo debajo — un número que no llevaba a ninguna
 * parte. Ahora las cuatro montan esto.
 */
export function CommentThread({ publicationId, commentCount, noun = 'comentarios', preview = false }: CommentThreadProps) {
  const { data: comments, isLoading, error } = useComments(publicationId)
  const { create, update, remove } = useCommentMutations(publicationId)
  /**
   * Qué comentario está siendo respondido. Vive acá y no dentro de cada nodo porque hace falta para
   * dos cosas a la vez: que sólo una caja de respuesta esté abierta, y que el composer general de
   * abajo se esconda mientras se responde a alguien puntual — con los dos visibles no se distingue
   * cuál escribe una respuesta al hilo y cuál un comentario nuevo a la publicación.
   */
  const [replyingToId, setReplyingToId] = useState<number | null>(null)
  /** Comentarios con sus respuestas desplegadas. Arrancan todos colapsados. */
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<number>>(() => new Set())
  const [showAllRoots, setShowAllRoots] = useState(false)

  const toggleReplies = (id: number) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  /**
   * Abrir la caja de respuesta de un comentario despliega también sus respuestas.
   *
   * No es cosmético: la respuesta que se está por escribir se agrega a ESE nodo, así que con el nodo
   * colapsado el usuario escribiría y publicaría sin ver nunca aparecer su propia respuesta. Se
   * despliega al abrir la caja (y no al enviar) para que quede desplegado también si cancela, y para
   * que pueda leer lo que ya se respondió antes de escribir.
   */
  const handleReplyingToChange = (id: number | null) => {
    setReplyingToId(id)
    if (id !== null) {
      setExpandedIds((current) => new Set(current).add(id))
    }
  }

  /**
   * Publicar un comentario raíz despliega la lista completa.
   *
   * El hilo viene ordenado del más viejo al más nuevo y el recorte muestra los primeros
   * `ROOT_PREVIEW_COUNT`, así que un comentario nuevo entra al final — es decir, escondido detrás del
   * botón "mostrar más". Sin esto, publicar no producía ningún cambio visible.
   */
  const handleRootSubmit = async (content: string, idempotencyKey: string) => {
    if (preview) return
    // Antes del await, no después: la fila optimista se inserta al final de las raíces, así que en
    // un hilo con más de `ROOT_PREVIEW_COUNT` comentarios quedaba escondida detrás de "mostrar más"
    // durante todo el vuelo del POST — justo la ventana en la que hay que ver el "Posteando…".
    setShowAllRoots(true)
    await create.mutateAsync({ content, idempotencyKey })
  }

  // Mientras carga se muestra el contador agregado que ya vino con la publicación; una vez que llega
  // el árbol, su tamaño manda. Ojo: `comments.length` son sólo las raíces, así que el total se cuenta
  // recorriendo el árbol — si no, un hilo de 1 raíz con 5 respuestas mostraría "1".
  const countNodes = (nodes: typeof comments): number =>
    (nodes ?? []).reduce((total, node) => total + 1 + countNodes(node.replies), 0)
  const total = comments ? countNodes(comments) : (commentCount ?? 0)

  const writeError = create.error ?? update.error ?? remove.error

  return (
    <section>
      <h3
        className="font-primary mb-2 mt-10 border-b border-gray-100 pb-3 text-lg font-bold"
        style={{ color: colors.blueDark }}
      >
        {total} {noun}
      </h3>

      {error && (
        <p role="alert" className="py-4 text-sm" style={{ color: foroPalette.errorText }}>
          {getForoApiErrorMessage(error)}
        </p>
      )}

      {isLoading ? (
        <p className="py-5 text-sm text-gray-500">Cargando {noun}…</p>
      ) : (
        <CommentList
          comments={comments ?? []}
          publicationId={publicationId}
          preview={preview}
          replyingToId={replyingToId}
          onReplyingToChange={handleReplyingToChange}
          expandedIds={expandedIds}
          onToggleReplies={toggleReplies}
          showAllRoots={showAllRoots}
          onShowAllRoots={() => setShowAllRoots(true)}
          onDelete={(id) => remove.mutate(id)}
          onEdit={(id, content) => update.mutateAsync({ id, content })}
          onReply={(parentId, content, idempotencyKey) => create.mutateAsync({ content, parentId, idempotencyKey })}
          // El composer de respuesta vive dentro de `CommentNode` (adentro de `CommentList`), no
          // acá — sin este flag su guard `isSubmitting` quedaba siempre en `false` y un doble Enter
          // rápido sí llegaba a disparar dos POST /interactions.
          replyPending={create.isPending}
        />
      )}

      {writeError && !isContentRejected(writeError) && (
        <p role="alert" className="mt-3 text-sm" style={{ color: foroPalette.errorText }}>
          {getForoApiErrorMessage(writeError)}
        </p>
      )}

      {/* Se esconde mientras hay una respuesta abierta: ver `replyingToId`. */}
      {replyingToId === null && (
        <CommentComposer
          preview={preview}
          onSubmit={handleRootSubmit}
          isSubmitting={create.isPending}
        />
      )}
    </section>
  )
}
