import { INTERACTION_TYPE_IDS } from '@features/foro'
import { InteractionToggleButton, type ToggleVariant } from './InteractionToggleButton'
import { StarIcon } from './ForoIcons'
import { colors } from '../../../../theme'

interface FavoriteButtonProps {
  publicationId: number
  /**
   * Presente cuando el favorito apunta a un COMENTARIO en vez de a la publicación. En el modelo hay
   * una sola tabla de interacciones: un favorito sobre un comentario es una fila con `parent_id`
   * apuntando a ese comentario (ver DECISIONS D51).
   */
  parentId?: number
  /** `publication.viewer.favorited`, o `comment.viewerFavorited` cuando hay `parentId`. */
  favorited: boolean
  /** Contador a mostrar junto a la estrella. Se usa en comentarios; en el hero se omite. */
  count?: number
  variant?: ToggleVariant
}

/**
 * Toggle de "favorito" (type_id 1) para publicaciones y comentarios.
 *
 * Estrella teal, no corazón: decisión de producto explícita para que el foro no lea como una red
 * social (ver DECISIONS D48). El tipo subyacente es el viejo `like`, renombrado a `favorito` en la
 * migración 0015 — de ahí que el id sea 1.
 *
 * El acento es fijo (teal) y no el del formato, a diferencia de `<SaveButton>`: el favorito es la
 * misma acción en las cuatro plantillas y en los comentarios, así que conviene que se vea igual en
 * todas y no que cambie de color según dónde esté.
 */
export function FavoriteButton({ publicationId, parentId, favorited, count, variant = 'pill' }: FavoriteButtonProps) {
  return (
    <InteractionToggleButton
      publicationId={publicationId}
      parentId={parentId}
      typeId={INTERACTION_TYPE_IDS.favorito}
      active={favorited}
      count={count}
      icon={({ size, filled }) => <StarIcon size={size} filled={filled} />}
      labelOn="Quitar de favoritos"
      labelOff="Favorito"
      variant={variant}
      accent={colors.tealMid}
    />
  )
}
