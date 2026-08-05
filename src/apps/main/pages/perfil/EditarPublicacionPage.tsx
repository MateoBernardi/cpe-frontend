import { useParams } from 'react-router-dom'
import { PublicationComposer } from '@features/content/components/foro'
import { colors, layout } from '@/theme'
import PublisherGate from './PublisherGate'

/** `/perfil/publicaciones/:id/editar` — the shared composer in edit mode; it
 * derives the publication's type itself (no type picker in edit mode). */
export default function EditarPublicacionPage() {
  const { id } = useParams<{ id: string }>()
  const publicationId = id != null ? Number(id) : undefined
  const isValidId = publicationId != null && Number.isFinite(publicationId)

  return (
    <div className="pt-[22vh] pb-[6vh] sm:pb-[8vh] md:pb-[10vh]" style={{ backgroundColor: colors.white }}>
      <div className={layout.container}>
        <PublisherGate>
          {isValidId ? (
            <PublicationComposer mode="edit" publicationId={publicationId} />
          ) : (
            <p className="text-sm text-gray-500">La publicación solicitada no existe.</p>
          )}
        </PublisherGate>
      </div>
    </div>
  )
}
