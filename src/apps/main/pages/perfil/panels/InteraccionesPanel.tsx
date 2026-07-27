import { useMyInteractions, usePublicationTypes, resolveKnownSlug, INTERACTION_TYPE_IDS } from '@features/foro'
import { PublicationListItem } from '@features/content/components/foro'
import { LoadingSpinner, ErrorMessage } from '@shared/components'
import { colors } from '@/theme'

/** The user's own comments — `INTERACTION_TYPE_IDS.comentario` interactions, with the comment text plus the publication it belongs to. */
export default function InteraccionesPanel() {
  const { data: types } = usePublicationTypes()
  const { data, isLoading, isError, refetch } = useMyInteractions({ typeId: INTERACTION_TYPE_IDS.comentario })

  if (isLoading) {
    return <LoadingSpinner size="md" className="py-12" />
  }

  if (isError) {
    return <ErrorMessage message="No pudimos cargar tus interacciones." onRetry={refetch} />
  }

  if (!data || data.length === 0) {
    return <p className="py-8 text-sm text-gray-500">Todavía no comentaste ninguna publicación.</p>
  }

  return (
    <div className="flex flex-col">
      {data.map((item) => (
        <div key={item.id} className="border-b py-5 first:pt-0 last:border-b-0 last:pb-0" style={{ borderColor: colors.lightGray }}>
          {item.content && (
            <p className="mb-3 text-sm leading-relaxed" style={{ color: colors.blueDark }}>
              &ldquo;{item.content}&rdquo;
            </p>
          )}
          <PublicationListItem
            publication={item.publication}
            typeSlug={resolveKnownSlug(types?.find((t) => t.id === item.publication.typeId))}
            typeName={types?.find((t) => t.id === item.publication.typeId)?.name ?? ''}
            size="compact"
            showSave={false}
          />
        </div>
      ))}
    </div>
  )
}
