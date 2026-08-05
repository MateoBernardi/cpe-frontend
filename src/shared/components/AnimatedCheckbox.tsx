import { useState } from 'react'
import { colors } from '../../theme'

interface AnimatedCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label: string
}

/**
 * Checkbox con marca animada.
 *
 * Es un `<input type="checkbox">` real (no un `div` con `role`), sólo que
 * visualmente oculto: así conserva el foco por teclado, la barra espaciadora,
 * el anuncio del lector de pantalla y la asociación con la etiqueta, sin tener
 * que reimplementar nada de eso. La caja dibujada al lado es puramente
 * decorativa (`aria-hidden`) y refleja el estado del input.
 *
 * El trazo del check se dibuja con `stroke-dasharray`/`stroke-dashoffset`
 * (keyframes en `index.css`, que también los anula bajo
 * `prefers-reduced-motion`).
 */
export default function AnimatedCheckbox({ checked, onChange, disabled = false, label }: AnimatedCheckboxProps) {
  // La animación de borrado sólo debe correr si el usuario DESMARCÓ algo, no en
  // el primer render de un checkbox que ya venía apagado (ahí no hay nada que
  // borrar y se vería un trazo fantasma retrayéndose al cargar la pantalla).
  // Es estado y no un ref porque se lee durante el render.
  const [hasToggled, setHasToggled] = useState(false)

  const handleChange = (next: boolean) => {
    setHasToggled(true)
    onChange(next)
  }

  const markClass = checked
    ? 'checkbox-mark checkbox-mark-checked'
    : hasToggled
      ? 'checkbox-mark checkbox-mark-unchecked'
      : 'checkbox-mark'

  return (
    <label className={`flex items-center gap-3 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
      <span className="relative inline-flex h-5 w-5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => handleChange(e.target.checked)}
          // `peer` + `sr-only`: sigue siendo enfocable (a diferencia de
          // `hidden`/`display:none`, que lo sacaría del orden de tabulación).
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none inline-flex h-5 w-5 items-center justify-center rounded border-2 transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 motion-reduce:transition-none"
          style={{
            borderColor: checked ? colors.ctaPrimary : colors.inputBorder,
            backgroundColor: checked ? colors.ctaPrimary : colors.white,
          }}
        >
          <svg viewBox="0 0 24 24" width={14} height={14} fill="none" aria-hidden="true">
            <path
              d="M5 12.5 10 17 19 7"
              // Blanco sobre la caja teal mientras está marcado; al desmarcar el
              // fondo vuelve a blanco, así que el trazo pasa a teal — si no, se
              // borraría un check blanco sobre blanco, o sea nada visible.
              stroke={checked ? colors.white : colors.ctaPrimary}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              // La clave fuerza el remontaje al togglear, para que la animación
              // se vuelva a ejecutar en lugar de quedar en su estado final.
              key={checked ? 'on' : 'off'}
              className={markClass}
            />
          </svg>
        </span>
      </span>
      <span className="text-sm" style={{ color: colors.blueDark }}>{label}</span>
    </label>
  )
}
