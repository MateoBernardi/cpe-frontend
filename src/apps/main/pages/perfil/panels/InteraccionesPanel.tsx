import { useMyInteractions, usePublicationTypes, resolveKnownSlug, INTERACTION_TYPE_IDS, getForoApiErrorMessage } from '@features/foro'
import { PublicationListItem } from '@features/content/components/foro'
import { QueryState } from '@shared/components'
import { colors } from '@/theme'

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
        <div className="flex flex-col">
          {items.map((item) => (
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
      )}
    </QueryState>
  )
}
