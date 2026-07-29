import type { MyInteraction, PublicationType } from '@features/foro'
import { resolveKnownSlug } from '@features/foro'
import { PublicationListItem, formatForoDate } from '@features/content/components/foro'
import { colors } from '@/theme'

interface InteractionCardProps {
  interaction: MyInteraction
  types: PublicationType[] | undefined
  /** Verbo en primera persona: "Comentaste", "Guardaste". */
  actionLabel: string
}

/**
 * Una interacción del usuario y la publicación sobre la que ocurrió, como una
 * sola unidad.
 *
 * Antes el comentario flotaba suelto ARRIBA de la fila de la publicación, sin
 * ninguna superficie en común: no quedaba claro si el texto pertenecía a la
 * publicación de arriba o a la de abajo. Acá van los dos dentro de la misma
 * tarjeta, con un encabezado que dice qué hiciste y cuándo, y la publicación
 * abajo como el objeto sobre el que actuaste.
 */
export default function InteractionCard({ interaction, types, actionLabel }: InteractionCardProps) {
  const type = types?.find((t) => t.id === interaction.publication.typeId)

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: colors.lightGray }}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.tealDeep }}>
          {actionLabel}
        </span>
        <span className="text-xs text-gray-400">{formatForoDate(interaction.createdAt)}</span>
      </div>

      {interaction.content && (
        <p
          className="mt-2 border-l-2 pl-3 text-sm italic leading-relaxed"
          style={{ color: colors.blueDark, borderColor: colors.ctaPrimary }}
        >
          {interaction.content}
        </p>
      )}

      <div className="mt-3 border-t pt-3" style={{ borderColor: colors.lightGray }}>
        <PublicationListItem
          publication={interaction.publication}
          typeSlug={resolveKnownSlug(type)}
          typeName={type?.name ?? ''}
          size="compact"
          showSave={false}
        />
      </div>
    </div>
  )
}
