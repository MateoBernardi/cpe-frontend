import type { KnownPublicationTypeSlug } from '@features/foro'
import { typeAccent, hexToRgba } from './foroHelpers'
import { colors } from '../../../../theme'

interface TypePillProps {
  slug: KnownPublicationTypeSlug | null
  label: string
  /**
   * `solid` (default): the flat/white-surface treatment — a light tint of
   * the format's accent behind an accent-colored border and label. Used
   * wherever the pill sits on a plain surface (list rows, the featured
   * card's meta line, the home preview).
   *
   * `glass`: translucent navy scrim + `backdrop-blur` + a hairline accent
   * border, white label — for pills overlaid on a cover photo (the detail
   * hero badge), where there's actual imagery behind the pill for the blur
   * to read against, and accent-colored text directly on an unknown photo
   * would risk illegibility.
   *
   * Same shape and color language either way, so the two read as one
   * system — only the surface underneath changes which treatment fits.
   */
  variant?: 'solid' | 'glass'
}

const BASE_CLASSES = 'inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide'

/**
 * Per-type format pill: a `rounded-full` pill whose border, text (and, in
 * the `solid` variant, a light background tint) all derive from the
 * format's accent (`typeAccent`) — no dot. Color is never the only signal:
 * the label text always carries the format name. NOT the same treatment as
 * content categories (`<CategoryList>`), so this can be restyled freely without
 * touching those.
 */
export function TypePill({ slug, label, variant = 'solid' }: TypePillProps) {
  const accent = typeAccent(slug)

  if (variant === 'glass') {
    return (
      <span
        className={`${BASE_CLASSES} text-white backdrop-blur-md`}
        style={{
          backgroundColor: hexToRgba(colors.blueDark, 0.45),
          border: `1px solid ${hexToRgba(accent, 0.85)}`,
        }}
      >
        {label}
      </span>
    )
  }

  return (
    <span
      className={BASE_CLASSES}
      style={{
        backgroundColor: hexToRgba(accent, 0.1),
        color: accent,
        border: `1px solid ${hexToRgba(accent, 0.35)}`,
      }}
    >
      {label}
    </span>
  )
}
