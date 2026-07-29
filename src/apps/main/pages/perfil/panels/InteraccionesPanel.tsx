import { useMyInteractions, usePublicationTypes, INTERACTION_TYPE_IDS, getForoApiErrorMessage } from '@features/foro'
import { QueryState } from '@shared/components'
import { FavoriteButton } from '@features/content/components/foro'
import InteractionCard, { type InteractionCardEntry } from '../InteractionCard'
import { groupInteractionsByPublication } from '../groupInteractionsByPublication'

/**
 * La actividad del usuario sobre publicaciones: sus comentarios y sus favoritos, agrupados por
 * publicación y ordenados por lo más reciente.
 *
 * Va en un único request porque `GET /interactions/me` acepta `type_ids` (CSV) — antes tomaba un
 * `type_id` suelto y este panel sólo podía mostrar comentarios. Los guardados siguen viviendo en su
 * propio panel: son "leer después", no actividad.
 *
 * Editar un comentario se hace desde el hilo, no desde acá: el sentido de una corrección depende de
 * lo que digan los comentarios de alrededor, y esta tarjeta muestra el texto fuera de su
 * conversación. La fila enlaza a la publicación, que es donde está el contexto.
 */
export default function InteraccionesPanel() {
  const { data: types } = usePublicationTypes()
  const { data, isLoading, isError, error, refetch } = useMyInteractions({
    typeIds: [INTERACTION_TYPE_IDS.comentario, INTERACTION_TYPE_IDS.favorito],
  })

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      errorMessage={getForoApiErrorMessage(error)}
      onRetry={refetch}
      data={data}
      emptyMessage="Todavía no comentaste ni marcaste favoritos."
    >
      {(items) => (
        <div className="flex flex-col gap-3">
          {groupInteractionsByPublication(items).map((group) => {
            const entries: InteractionCardEntry[] = group.map((interaction) => {
              const isFavorite = interaction.typeId === INTERACTION_TYPE_IDS.favorito
              return {
                interaction,
                actionLabel: isFavorite ? 'Marcaste como favorito' : 'Comentaste',
                // Sólo el favorito se puede quitar desde acá: borrar un comentario se hace en el
                // hilo, donde se ve a qué conversación pertenece.
                action: isFavorite
                  ? <FavoriteButton publicationId={interaction.publication.id} favorited variant="inline" />
                  : undefined,
              }
            })
            return <InteractionCard key={group[0]!.publication.id} entries={entries} types={types} />
          })}
        </div>
      )}
    </QueryState>
  )
}
