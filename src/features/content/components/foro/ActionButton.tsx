import type { ReactNode } from 'react'
import { colors } from '../../../../theme'

export type ActionButtonStatus = 'idle' | 'pending' | 'success'

interface ActionButtonProps {
  status: ActionButtonStatus
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
  /** Label shown while `status === 'pending'` — defaults to `children`. */
  pendingLabel?: ReactNode
  /** Label shown while `status === 'success'` — defaults to `children`. */
  successLabel?: ReactNode
  /** `solid` (filled, brand color) for the primary action ("Publicar" /
   * "Guardar cambios"); `outline` for the secondary one ("Guardar borrador"). */
  variant?: 'solid' | 'outline'
  /** Overrides the brand `ctaPrimary` accent — usado por acciones destructivas
   * (p.ej. "Descartar cambios" con `foroPalette.errorText`) que igual quieren
   * el spinner/check/pending plumbing de este botón en vez de un `<button>`
   * suelto. Sólo cambia el color; no toca el hover del `solid` (pensado hoy
   * sólo para `outline`, que no tiene hover propio). */
  accentColor?: string
  /** Forwarded to the underlying `<button>` — `'submit'` lets this sit inside
   * a `<form onSubmit>` (CuentaPanel) instead of requiring a manual `onClick`
   * that re-triggers the submit. */
  type?: 'button' | 'submit'
  className?: string
}

/** Small inline spinner — plain SVG, same "no icon font / no external fetch"
 * convention as the rest of the Foro's icon set (`ForoIcons.tsx`), kept local
 * here since this file owns its own iconography and isn't touching that
 * shared file. */
function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      className="motion-reduce:animate-none animate-spin"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2.5} opacity={0.25} />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  )
}

/** Animated check — a single stroked path "drawn" via `stroke-dasharray` /
 * `stroke-dashoffset` (with `pathLength={1}` so the dash math is 0–1
 * regardless of the path's real length) animating from hidden to fully
 * stroked on mount. The keyframes live in `index.css` alongside the app's
 * other animations (`logoPulse`, `fadeIn`, `cvPulse`) rather than in an
 * inline `<style>` here, which would be duplicated per button instance;
 * that file also drops the animation under `prefers-reduced-motion`. */
function AnimatedCheck() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" aria-hidden="true">
      <path
        d="M5 12.5 10 17 19 7"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="action-button-check"
      />
    </svg>
  )
}

/**
 * `idle → pending → success` button used for the composer's "Guardar
 * borrador" / "Publicar" and `CuentaPanel`'s "Guardar cambios" — replaces the
 * old "just swap the text to 'Guardando…'" treatment with a spinner, an
 * animated check, and a press micro-interaction (`active:scale-*`).
 *
 * Presentational only: it owns no timers. A caller that wants `success` to
 * revert to `idle` after a beat (e.g. `CuentaPanel`, which doesn't navigate
 * away on save) schedules that itself; a caller that navigates away on
 * success (the composer) simply never lingers on the state.
 */
export function ActionButton({
  status,
  onClick,
  disabled = false,
  children,
  pendingLabel,
  successLabel,
  variant = 'solid',
  accentColor,
  type = 'button',
  className = '',
}: ActionButtonProps) {
  const isPending = status === 'pending'
  const isSuccess = status === 'success'
  const accent = accentColor ?? colors.ctaPrimary

  const variantStyle =
    variant === 'solid'
      ? { backgroundColor: accent, color: colors.white }
      : { backgroundColor: 'transparent', color: accent, border: `1px solid ${accent}` }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isPending}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-150 active:scale-[0.97] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={variantStyle}
      onMouseEnter={(e) => {
        if (variant === 'solid' && !isPending) e.currentTarget.style.backgroundColor = colors.ctaPrimaryHover
      }}
      onMouseLeave={(e) => {
        if (variant === 'solid') e.currentTarget.style.backgroundColor = colors.ctaPrimary
      }}
    >
      {isPending && <Spinner />}
      {isSuccess && <AnimatedCheck />}
      <span>{isPending ? (pendingLabel ?? children) : isSuccess ? (successLabel ?? children) : children}</span>
    </button>
  )
}
