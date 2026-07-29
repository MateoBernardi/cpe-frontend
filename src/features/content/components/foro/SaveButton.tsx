import { INTERACTION_TYPE_IDS } from '@features/foro'
import { InteractionToggleButton, type ToggleVariant } from './InteractionToggleButton'
import { BookmarkIcon } from './ForoIcons'
import { colors } from '../../../../theme'

interface SaveButtonProps {
  publicationId: number
  /**
   * Estado propio del usuario, resuelto server-side en `publication.viewer.saved`. Llega por prop
   * en vez de leerse acá: el dueño del dato es quien ya tiene la publicación cargada (el hero o la
   * fila de la lista), así que el botón no dispara ninguna lectura propia. Antes este componente
   * tenía un `useIsSaved` que, por CADA fila de CADA lista, se bajaba la lista completa de
   * guardados de esa publicación para buscarse a sí mismo. `false` para un anónimo — el backend
   * omite `viewer` cuando no hay sesión.
   */
  saved: boolean
  /** `pill`: botón con etiqueta sobre la portada del hero. `icon`: sólo el marcador, para filas de lista. */
  variant?: ToggleVariant
  /** Acento del formato — sólo lo usa el borde "glass" de la variante `pill` (matchea `<TypePill variant="glass">`). */
  accent?: string
}

/**
 * Toggle de "guardado" (type_id 4) — el marcador de "leer después", distinto del favorito
 * (`<FavoriteButton>`), que es una valoración. La variante `pill` va sobre la portada del hero, así
 * que su estado sin guardar usa el mismo tratamiento glass que los otros controles superpuestos
 * (scrim navy translúcido, blur, hairline de acento); al guardarse pasa a relleno sólido para que
 * el estado se lea sin ambigüedad. Toda la lógica vive en `<InteractionToggleButton>`.
 */
export function SaveButton({ publicationId, saved, variant = 'pill', accent = colors.ctaPrimary }: SaveButtonProps) {
  return (
    <InteractionToggleButton
      publicationId={publicationId}
      typeId={INTERACTION_TYPE_IDS.guardado}
      active={saved}
      icon={({ size, filled }) => <BookmarkIcon size={size} filled={filled} />}
      labelOn="Quitar de guardados"
      labelOff="Guardar"
      variant={variant}
      accent={accent}
    />
  )
}
