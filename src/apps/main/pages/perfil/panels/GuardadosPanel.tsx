import { useMyInteractions, usePublicationTypes, resolveKnownSlug, INTERACTION_TYPE_IDS, getForoApiErrorMessage } from '@features/foro'
import { PublicationListItem } from '@features/content/components/foro'
import { QueryState } from '@shared/components'

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
        <div className="flex flex-col divide-y divide-gray-200">
          {items.map((item) => {
            const type = types?.find((t) => t.id === item.publication.typeId)
            return (
              <PublicationListItem
                key={item.id}
                publication={item.publication}
                typeSlug={resolveKnownSlug(type)}
                typeName={type?.name ?? ''}
                size="compact"
              />
            )
          })}
        </div>
      )}
    </QueryState>
  )
}
