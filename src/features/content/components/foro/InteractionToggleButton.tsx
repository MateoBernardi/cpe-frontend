import { useState, type ReactNode } from 'react'
import { useForoAuth, useInteractionToggle, getForoApiErrorMessage } from '@features/foro'
import { hexToRgba } from './foroHelpers'
import { colors } from '../../../../theme'

export type ToggleVariant = 'pill' | 'icon' | 'inline'

interface InteractionToggleButtonProps {
  publicationId: number
  /** Presente cuando el target es un COMENTARIO en vez de la publicación (favorito sobre comentario). */
  parentId?: number
  typeId: number
  /** Estado propio del usuario, resuelto server-side (`publication.viewer.*` o `comment.viewerFavorited`). */
  active: boolean
  /** Contador a mostrar al lado del ícono. Se omite en las superficies donde no aporta. */
  count?: number
  icon: (props: { size?: number; filled?: boolean }) => ReactNode
  labelOn: string
  labelOff: string
  variant?: ToggleVariant
  /** Color de acento del formato — sólo lo usa el borde "glass" de la variante `pill`. */
  accent?: string
}

/**
 * Base compartida de los toggles de interacción (favorito y guardado). Lo único que cambia entre
 * ellos es el tipo, el ícono y las etiquetas, así que la lógica vive acá una sola vez:
 *
 * - **No hace ninguna lectura propia.** El estado sale de `viewer` en el DTO de la publicación (o de
 *   `viewerFavorited` en el nodo del comentario). Antes `SaveButton` bajaba, por CADA fila de CADA
 *   lista, la lista completa de guardados de esa publicación para buscarse a sí mismo — N requests
 *   por pantalla, y además exponía quién guardó qué.
 * - **Se renderiza siempre, incluso sin sesión**, y el click abre el diálogo de login en vez de
 *   disparar un request condenado. Es la pauta de la casa (ver `CommentComposer`): nunca se
 *   esconde ni se deshabilita la afordancia para un anónimo.
 * - El borrado va por target (`DELETE /interactions` con `{publication_id, type_id, parent_id?}`),
 *   así que no hace falta conocer el id de la fila.
 */
export function InteractionToggleButton({
  publicationId,
  parentId,
  typeId,
  active,
  count,
  icon,
  labelOn,
  labelOff,
  variant = 'pill',
  accent = colors.ctaPrimary,
}: InteractionToggleButtonProps) {
  const { isAuthenticated, openAuthDialog } = useForoAuth()
  const { add, remove } = useInteractionToggle(publicationId, typeId, parentId)
  const pending = add.isPending || remove.isPending
  /**
   * Sólo para no animar en el montaje: un botón que ya viene marcado del servidor haría "pop" solo
   * en cada navegación. Se prende en el handler del click (no en un efecto) y no se vuelve a apagar.
   *
   * Con esto puesto, la animación la dispara el propio cambio de `active`: las clases de encendido y
   * apagado tienen `animation-name` distinto, así que al cambiar la clase el navegador reinicia la
   * animación sola — no hace falta ni estado ni `key` para forzar el reinicio.
   */
  const [hasToggled, setHasToggled] = useState(false)

  // `active` llega ya invertido de forma optimista (`onMutate` de `useInteractionToggle` parchea la
  // caché antes de que salga el request), así que el flip y la animación ocurren en el frame del
  // click, no cuando contesta el servidor. Si la mutación falla, el rollback revierte `active` y la
  // animación corre en el sentido contrario — que es exactamente la señal de que no quedó.
  const animationClass = !hasToggled
    ? ''
    : active
      ? 'interaction-toggle-pop'
      : 'interaction-toggle-drop'
  // Los dos `onError` sólo revierten la caché; sin esto un fallo era completamente invisible.
  const error = add.error ?? remove.error

  const handleClick = () => {
    // Guarda de reentrada síncrona: `disabled={pending}` recién aplica después del commit de React,
    // así que un doble click rápido dispara la mutación y su deshacer con estado todavía viejo.
    if (pending) return
    if (!isAuthenticated) {
      // Sin sesión no hay cambio de estado que animar: el click abre el diálogo de login.
      openAuthDialog('sign-in')
      return
    }
    setHasToggled(true)
    if (active) {
      remove.mutate()
    } else {
      add.mutate()
    }
  }

  const label = active ? labelOn : labelOff
  const errorMessage = error ? getForoApiErrorMessage(error) : null
  const title = errorMessage ?? label

  // `inline-flex` para que el `transform` de la animación tenga caja propia y no arrastre al texto.
  const animatedIcon = (size?: number) => (
    <span className={`inline-flex ${animationClass}`}>
      {icon({ size, filled: active })}
    </span>
  )

  if (variant === 'icon') {
    const base =
      'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 active:scale-[0.88] motion-reduce:active:scale-100 disabled:cursor-not-allowed'
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-label={label}
        aria-pressed={active}
        title={title}
        className={active ? `${base} text-white` : `${base} text-gray-400 hover:text-white`}
        style={{ backgroundColor: active ? accent : undefined }}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = accent }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = '' }}
      >
        {animatedIcon()}
      </button>
    )
  }

  // `inline`: texto chico para el pie de un comentario, donde una pastilla sería demasiado peso.
  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={active}
        title={title}
        className="inline-flex items-center gap-1 text-xs font-medium transition-all duration-150 active:scale-[0.92] motion-reduce:active:scale-100 disabled:cursor-not-allowed"
        style={{ color: active ? accent : undefined }}
      >
        <span className={active ? '' : 'text-gray-400'}>{animatedIcon(14)}</span>
        <span className={active ? '' : 'text-gray-500'}>
          {label}
          {count !== undefined && count > 0 ? ` · ${count}` : ''}
        </span>
      </button>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={active}
        title={title}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:brightness-125 active:scale-[0.95] motion-reduce:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed"
        style={
          active
            ? { backgroundColor: hexToRgba(accent, 0.9), border: '1px solid transparent' }
            : { backgroundColor: hexToRgba(colors.blueDark, 0.45), border: `1px solid ${hexToRgba(accent, 0.85)}` }
        }
      >
        {animatedIcon(16)}
        {label}
        {count !== undefined && count > 0 ? ` · ${count}` : ''}
      </button>
      {errorMessage && (
        <span role="alert" className="text-xs font-medium text-white/90">
          {errorMessage}
        </span>
      )}
    </div>
  )
}
