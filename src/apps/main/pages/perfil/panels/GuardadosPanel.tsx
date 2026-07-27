import { useMyInteractions, usePublicationTypes, resolveKnownSlug, INTERACTION_TYPE_IDS } from '@features/foro'
import { PublicationListItem } from '@features/content/components/foro'
import { LoadingSpinner, ErrorMessage } from '@shared/components'

/** Publications the user bookmarked — `INTERACTION_TYPE_IDS.guardado` interactions. */
export default function GuardadosPanel() {
  const { data: types } = usePublicationTypes()
  const { data, isLoading, isError, refetch } = useMyInteractions({ typeId: INTERACTION_TYPE_IDS.guardado })

  if (isLoading) {
    return <LoadingSpinner size="md" className="py-12" />
  }

  if (isError) {
    return <ErrorMessage message="No pudimos cargar tus publicaciones guardadas." onRetry={refetch} />
  }

  if (!data || data.length === 0) {
    return <p className="py-8 text-sm text-gray-500">Todavía no guardaste ninguna publicación.</p>
  }

  return (
    <div className="flex flex-col divide-y divide-gray-200">
      {data.map((item) => {
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
  )
}
