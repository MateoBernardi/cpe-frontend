import { useState, type FormEvent } from 'react'
import { useForoAuth, useIdempotencyKey } from '@features/foro'
import { hoverBgSwap } from './foroHelpers'
import { colors } from '../../../../theme'

interface CommentComposerProps {
  /** `idempotencyKey` es una por intención de submit — ver `keyFor` en `handleSubmit` abajo. */
  onSubmit: (content: string, idempotencyKey: string) => Promise<unknown>
  isSubmitting?: boolean
  placeholder?: string
  submitLabel?: string
  /**
   * Modo vista previa (composer del admin / demo): el hilo que se está
   * previsualizando todavía no existe en el backend, así que el formulario se
   * muestra pero nunca envía. Evita que un click dispare un POST /interactions
   * contra una publicación inexistente.
   */
  preview?: boolean
}

/** Reply composer — posting requires auth; opens the auth dialog otherwise. */
export function CommentComposer({
  onSubmit,
  isSubmitting = false,
  placeholder = 'Sumá tu experiencia a esta conversación…',
  submitLabel = 'Publicar respuesta',
  preview = false,
}: CommentComposerProps) {
  const { isAuthenticated, openAuthDialog } = useForoAuth()
  const [content, setContent] = useState('')
  const { keyFor, reset: resetIdempotencyKey } = useIdempotencyKey()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (preview) return
    // `disabled` en el botón no alcanza: sólo aplica después del commit de React, así
    // que un doble Enter rápido puede alcanzar a disparar `onSubmit` dos veces antes de
    // que este guard tome efecto. Antes eso persistía un comentario duplicado de
    // verdad: los comentarios están excluidos del índice único del backend
    // (`interacciones_unique_single_per_user` filtra `type_id <> 2`). Ese agujero
    // ahora lo tapa la `Idempotency-Key` que arma `keyFor` más abajo — el backend
    // deduplica por (scope, key) aunque este guard síncrono llegue tarde.
    if (isSubmitting) return
    if (!isAuthenticated) {
      openAuthDialog('sign-in')
      return
    }
    const trimmed = content.trim()
    if (!trimmed) return
    const idempotencyKey = keyFor({ content: trimmed })
    // Se vacía ANTES del await: `useCommentMutations().create` ya inserta la fila optimista en el
    // hilo desde su `onMutate`, así que dejar el texto acá mientras el POST está en vuelo mostraba
    // el mismo comentario dos veces (en la caja y en la lista, esta última como "Posteando…").
    setContent('')
    try {
      await onSubmit(trimmed, idempotencyKey)
    } catch {
      // El POST falló (típicamente el 422 de moderación) y `onError` ya podó la fila optimista del
      // hilo: se devuelve el texto a la caja para que se pueda corregir y reintentar en vez de
      // perderlo. La key NO se resetea — un reintento con el mismo contenido debe reusarla.
      // El error en sí no se propaga: lo muestra `CommentThread` leyendo `create.error`, y dejarlo
      // escapar de un handler de submit sólo generaba un unhandled rejection en consola.
      setContent(trimmed)
      return
    }
    // Recién al resolver: un reintento con el mismo contenido reutiliza la key (el
    // fingerprint no cambió); un éxito libera la próxima key para el siguiente comentario.
    resetIdempotencyKey()
  }

  return (
    <form className="mt-6 rounded-xl p-5" style={{ backgroundColor: colors.lightGray }} onSubmit={handleSubmit}>
      <textarea
        className="min-h-[90px] w-full resize-y rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500/50"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        disabled={preview}
        onFocus={() => { if (!preview && !isAuthenticated) openAuthDialog('sign-in') }}
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        {preview
          ? <span className="text-xs text-gray-500">Vista previa — las respuestas se habilitan al publicar.</span>
          : !isAuthenticated && <span className="text-xs text-gray-500">Iniciá sesión para participar.</span>}
        <button
          type="submit"
          className="ml-auto rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          style={{ backgroundColor: colors.ctaPrimary }}
          disabled={preview || isSubmitting || !content.trim()}
          {...hoverBgSwap(colors.ctaPrimary, colors.ctaPrimaryHover)}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
