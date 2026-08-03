import { useState, type ReactNode } from 'react'
import { useForoAuth, useInteractionToggle, useIdempotencyKey, getForoApiErrorMessage } from '@features/foro'
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
  const { add, remove, isRemovingRow } = useInteractionToggle(publicationId, typeId, parentId)
  const { keyFor, reset: resetIdempotencyKey } = useIdempotencyKey()
  // `isRemovingRow` sigue prendido un rato después de que `remove` termina: cubre la ventana en que
  // `useInteractionToggle` diferió sacar la fila de los paneles de perfil (`GET /interactions/me`)
  // para no cortar la animación de este mismo botón — ver `removeFromMyInteractions` ahí. Sin
  // sumarla, un segundo click justo en ese hueco dispararía un DELETE contra un target que el
  // servidor ya borró.
  const pending = add.isPending || remove.isPending || isRemovingRow
  /**
   * Contador de clicks iniciados por el usuario (nunca se toca en un efecto). Arranca en 0 así un
   * botón que ya viene marcado del servidor no anima en el montaje — recién anima a partir del
   * primer click. De ahí en más el VALOR no importa: se usa como `key` del `<span>` animado (ver
   * `animatedIcon` más abajo) para forzar un remount en CADA click, sin importar si la clase de
   * animación resultante (`pop`/`drop`) es la misma que la vez anterior.
   *
   * Antes el reinicio dependía únicamente de que `animation-name` cambiara entre pop y drop, así que
   * una secuencia que aterrizaba dos veces en la misma clase — optimista `true` → rollback `false` →
   * refetch `true`, o dos clicks rápidos donde la guarda de reentrada de abajo se come el segundo —
   * no reiniciaba ninguna animación. Mismo criterio que `AnimatedCheckbox.tsx`, que resuelve lo mismo
   * con `key={checked ? 'on' : 'off'}`; acá no alcanza una key derivada del estado porque el estado
   * puede repetirse, así que hace falta algo monótono.
   */
  const [clickCount, setClickCount] = useState(0)

  // `active` llega ya invertido de forma optimista (`onMutate` de `useInteractionToggle` parchea la
  // caché antes de que salga el request), así que el flip y la animación ocurren en el frame del
  // click, no cuando contesta el servidor. Si la mutación falla, el rollback revierte `active` y la
  // animación corre en el sentido contrario — que es exactamente la señal de que no quedó.
  const animationClass = clickCount === 0
    ? ''
    : active
      ? 'interaction-toggle-pop'
      : 'interaction-toggle-drop'
  // Los dos `onError` sólo revierten la caché; sin esto un fallo era completamente invisible.
  const error = add.error ?? remove.error

  const handleClick = () => {
    // Guarda de reentrada síncrona: ya no hay `disabled` que lea `pending` (ver más abajo por qué),
    // y aunque lo hubiera recién aplicaría después del commit de React — así que sin esto un doble
    // click rápido dispara la mutación y su deshacer con estado todavía viejo.
    if (pending) return
    if (!isAuthenticated) {
      // Sin sesión no hay cambio de estado que animar: el click abre el diálogo de login.
      openAuthDialog('sign-in')
      return
    }
    setClickCount((c) => c + 1)
    if (active) {
      // Sólo el alta (POST /interactions) lleva idempotency key — la baja es un DELETE, fuera del
      // alcance de este esquema. La deduplicación de un doble-click acá ya la cubre, en la práctica,
      // el índice único parcial de la base (`interacciones_unique_single_per_user`).
      remove.mutate()
    } else {
      // Cinturón y tiradores: favorito/guardado ya dedupean por el índice único de la base, pero una
      // key hace que el replay devuelva el 201 original en vez de correr contra el re-read de
      // `onConflictDoNothing` en `interaction.repo.ts`.
      add.mutate(keyFor({ typeId, publicationId, parentId }), { onSettled: resetIdempotencyKey })
    }
  }

  const label = active ? labelOn : labelOff
  const errorMessage = error ? getForoApiErrorMessage(error) : null
  const title = errorMessage ?? label

  // `inline-flex` para que el `transform` de la animación tenga caja propia y no arrastre al texto.
  // `key={clickCount}` fuerza el remount del `<span>` en cada click (ver comentario de `clickCount`
  // más arriba) — es lo que garantiza el reinicio de la animación, no la clase en sí.
  const animatedIcon = (size?: number) => (
    <span key={clickCount} className={`inline-flex ${animationClass}`}>
      {icon({ size, filled: active })}
    </span>
  )

  // Ya no se usa el atributo `disabled` para expresar "mutación en vuelo": los navegadores cortan
  // `:active` en un elemento disabled apenas React comitea `disabled=true` (que pasa en el mismo
  // tick del click, porque la mutación arranca sync dentro de `handleClick`), así que
  // `active:scale-[...]` se revertía a mitad de la presión y el pop/drop nunca llegaba a jugar — el
  // bug "aleatorio" de las animaciones que no disparan. La protección real contra doble-fire ya está
  // en la guarda síncrona de `handleClick`; acá sólo queda comunicar el estado ocupado de forma que
  // no mate `:active` (`aria-busy` + una atenuación visual en vez de bloquear el elemento).
  const busyClass = pending ? 'opacity-60 cursor-wait' : ''

  if (variant === 'icon') {
    const base =
      'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 active:scale-[0.88] motion-reduce:active:scale-100'
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-busy={pending}
        aria-label={label}
        aria-pressed={active}
        title={title}
        className={`${active ? `${base} text-white` : `${base} text-gray-400 hover:text-white`} ${busyClass}`}
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
        aria-busy={pending}
        aria-pressed={active}
        title={title}
        className={`inline-flex items-center gap-1 text-xs font-medium transition-all duration-150 active:scale-[0.92] motion-reduce:active:scale-100 ${busyClass}`}
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
        aria-busy={pending}
        aria-pressed={active}
        title={title}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:brightness-125 active:scale-[0.95] motion-reduce:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${busyClass}`}
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
