import type { Category } from '@features/foro'
import { colors } from '../../../../theme'

interface CategoryListProps {
  categories: Category[]
  /** Tope para superficies compactas (filas, tarjetas): las extra se colapsan en una pastilla "+N". Sin límite si se omite. */
  max?: number
  /** `sm` achica las pastillas para tarjetas/filas, donde conviven con texto meta de 11–12px. */
  size?: 'default' | 'sm'
}

/**
 * Pastillas de categoría — la taxonomía de contenido, distinta de `<TypePill>`, que muestra el
 * FORMATO de la publicación (Paper/Podcast/Novedad/Discusión).
 *
 * Antes esto era `<TagList>` y recibía `string[]`: la lectura devolvía nombres de tag y la escritura
 * pedía ids, lo que forzaba una re-resolución nombre→id en el composer. Se dio de baja la tabla
 * `tags` (redundante con `categorias`, y vacía en el seed) y ahora la lectura devuelve la categoría
 * resuelta, así que estas pastillas tienen id y slug disponibles si algún día se vuelven filtro.
 * Renderiza 0-N y se esconde entera cuando está vacía. Sin margen externo: el spacing lo controla
 * cada caller.
 */
export function CategoryList({ categories, max, size = 'default' }: CategoryListProps) {
  if (!categories || categories.length === 0) return null

  const visible = max != null ? categories.slice(0, max) : categories
  const extra = categories.length - visible.length

  const pillClass = size === 'sm'
    ? 'rounded-full px-2 py-0.5 text-[11px] font-medium text-gray-600'
    : 'rounded-full px-3 py-1 text-xs font-medium text-gray-600'

  return (
    <div className={`flex flex-wrap ${size === 'sm' ? 'gap-1' : 'gap-2'}`}>
      {visible.map((category) => (
        <span key={category.id} className={pillClass} style={{ backgroundColor: colors.lightGray }}>
          #{category.name}
        </span>
      ))}
      {extra > 0 && (
        <span
          className={pillClass}
          style={{ backgroundColor: colors.lightGray }}
          title={categories.slice(visible.length).map((c) => c.name).join(', ')}
        >
          +{extra}
        </span>
      )}
    </div>
  )
}
