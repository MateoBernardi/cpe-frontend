import { useMyInteractions, usePublicationTypes, INTERACTION_TYPE_IDS, getForoApiErrorMessage } from '@features/foro'
import { QueryState } from '@shared/components'
import { SaveButton } from '@features/content/components/foro'
import InteractionCard from '../InteractionCard'
import { groupInteractionsByPublication } from '../groupInteractionsByPublication'

/**
 * Publicaciones que el usuario guardó — interacciones `INTERACTION_TYPE_IDS.guardado`.
 *
 * Cada fila trae su propio `<SaveButton saved>`: antes este panel era sólo lectura y para quitar algo
 * de guardados había que volver a la publicación. El botón borra por target
 * (`DELETE /interactions`), así que no necesita el id de la interacción, y `useInteractionToggle`
 * saca la fila de la caché de forma optimista además de invalidar, con lo cual desaparece en el acto.
 *
 * Se agrupa por publicación igual que el panel de interacciones: acá el índice único del backend ya
 * garantiza un solo guardado por usuario y publicación, así que en la práctica cada grupo tiene un
 * elemento — se agrupa igual para que las dos pantallas se comporten de la misma forma si eso
 * cambiara.
 */
export default function GuardadosPanel() {
  const { data: types } = usePublicationTypes()
  const { data, isLoading, isError, error, refetch } = useMyInteractions({ typeIds: [INTERACTION_TYPE_IDS.guardado] })

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      errorMessage={getForoApiErrorMessage(error)}
      onRetry={refetch}
      data={data}
      emptyMessage="Todavía no guardaste ninguna publicación."
    >
      {(items) => (
        <div className="flex flex-col gap-3">
          {groupInteractionsByPublication(items).map((group) => (
            <InteractionCard
              key={group[0]!.publication.id}
              types={types}
              entries={group.map((interaction) => ({
                interaction,
                actionLabel: 'Guardaste',
                action: <SaveButton publicationId={interaction.publication.id} saved variant="inline" />,
              }))}
            />
          ))}
        </div>
      )}
    </QueryState>
  )
}
