import { useMyInteractions, usePublicationTypes, INTERACTION_TYPE_IDS, getForoApiErrorMessage } from '@features/foro'
import { QueryState } from '@shared/components'
import InteractionCard from '../InteractionCard'

/** The user's own comments — `INTERACTION_TYPE_IDS.comentario` interactions, with the comment text plus the publication it belongs to. */
export default function InteraccionesPanel() {
  const { data: types } = usePublicationTypes()
  const { data, isLoading, isError, error, refetch } = useMyInteractions({ typeId: INTERACTION_TYPE_IDS.comentario })

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      errorMessage={getForoApiErrorMessage(error)}
      onRetry={refetch}
      data={data}
      emptyMessage="Todavía no comentaste ninguna publicación."
    >
      {(items) => (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <InteractionCard key={item.id} interaction={item} types={types} actionLabel="Comentaste" />
          ))}
        </div>
      )}
    </QueryState>
  )
}
