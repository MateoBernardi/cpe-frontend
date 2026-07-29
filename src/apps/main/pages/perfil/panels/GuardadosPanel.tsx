import { useMyInteractions, usePublicationTypes, INTERACTION_TYPE_IDS, getForoApiErrorMessage } from '@features/foro'
import { QueryState } from '@shared/components'
import InteractionCard from '../InteractionCard'

/** Publications the user bookmarked — `INTERACTION_TYPE_IDS.guardado` interactions. */
export default function GuardadosPanel() {
  const { data: types } = usePublicationTypes()
  const { data, isLoading, isError, error, refetch } = useMyInteractions({ typeId: INTERACTION_TYPE_IDS.guardado })

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
          {items.map((item) => (
            <InteractionCard key={item.id} interaction={item} types={types} actionLabel="Guardaste" />
          ))}
        </div>
      )}
    </QueryState>
  )
}
