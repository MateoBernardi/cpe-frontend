import type { ReactNode } from 'react'
import type { MyInteraction, PublicationType } from '@features/foro'
import { resolveKnownSlug } from '@features/foro'
import { PublicationListItem, formatForoDate } from '@features/content/components/foro'
import { colors } from '@/theme'

export interface InteractionCardEntry {
  interaction: MyInteraction
  /** Verbo en primera persona: "Comentaste", "Guardaste", "Marcaste como favorito". */
  actionLabel: string
  /**
   * Acción sobre esta interacción puntual (no sobre la publicación): quitar de guardados, quitar de
   * favoritos. Va alineada a la derecha del encabezado para no confundirse con las acciones de la
   * fila de publicación de abajo.
   */
  action?: ReactNode
}

interface InteractionCardProps {
  /**
   * TODAS las interacciones del usuario sobre UNA publicación, ya ordenadas. Antes este componente
   * recibía una sola interacción, así que comentar tres veces la misma publicación y además marcarla
   * como favorito producía cuatro tarjetas repitiendo la misma fila de publicación: la pantalla se
   * leía como cuatro publicaciones distintas. Ahora la publicación aparece una vez y arriba se
   * listan todas las acciones que hiciste sobre ella.
   */
  entries: InteractionCardEntry[]
  types: PublicationType[] | undefined
}

/**
 * Una publicación y todo lo que el usuario hizo sobre ella, como una sola unidad.
 *
 * El orden importa: primero las acciones (qué hiciste y cuándo), después la publicación como el
 * objeto sobre el que actuaste. Antes el comentario flotaba suelto ARRIBA de la fila de la
 * publicación, sin ninguna superficie en común, y no quedaba claro si el texto pertenecía a la
 * publicación de arriba o a la de abajo.
 */
export default function InteractionCard({ entries, types }: InteractionCardProps) {
  const first = entries[0]
  if (!first) return null

  const publication = first.interaction.publication
  const type = types?.find((t) => t.id === publication.typeId)

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: colors.lightGray }}>
      <div className="flex flex-col gap-3">
        {entries.map(({ interaction, actionLabel, action }) => (
          <div key={`${interaction.typeId}-${interaction.id}`}>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.tealDeep }}>
                {actionLabel}
              </span>
              <span className="text-xs text-gray-400">{formatForoDate(interaction.createdAt)}</span>
              {action && <span className="ml-auto">{action}</span>}
            </div>

            {interaction.content && (
              <p
                className="mt-2 border-l-2 pl-3 text-sm italic leading-relaxed"
                style={{ color: colors.blueDark, borderColor: colors.ctaPrimary }}
              >
                {interaction.content}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 border-t pt-3" style={{ borderColor: colors.lightGray }}>
        <PublicationListItem
          publication={publication}
          typeSlug={resolveKnownSlug(type)}
          typeName={type?.name ?? ''}
          size="compact"
          showSave={false}
        />
      </div>
    </div>
  )
}
