import { Link, useParams } from 'react-router-dom'
import {
  usePublication,
  usePublicationTypes,
  usePublications,
  resolveKnownSlug,
} from '@features/foro'
import { PublicationDetail } from '../components/PublicationDetail'
import { DiscussionDetail } from '../components/DiscussionDetail'
import { CategoryTag } from '../components/CategoryTag'

export default function PublicationPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const { data: publication, isLoading, isError } = usePublication(Number.isFinite(id) ? id : undefined)
  const { data: types } = usePublicationTypes()
  const type = types?.find((t) => t.id === publication?.typeId)
  const slug = resolveKnownSlug(type)

  const { data: relatedRaw } = usePublications(publication?.typeId != null ? { typeId: publication.typeId, limit: 4 } : undefined)
  const related = (relatedRaw ?? []).filter((p) => p.id !== publication?.id).slice(0, 3)

  if (isLoading) {
    return (
      <div className="foro-wrap" style={{ padding: '60px 0' }}>
        <p style={{ color: 'var(--foro-muted)' }}>Cargando publicación…</p>
      </div>
    )
  }

  if (isError || !publication) {
    return (
      <div className="foro-wrap" style={{ padding: '60px 0' }}>
        <h2>No encontramos esta publicación</h2>
        <p style={{ color: 'var(--foro-muted)', marginTop: 12 }}>
          Puede haber sido eliminada o el enlace es incorrecto.
        </p>
        <Link className="foro-btn foro-btn-teal" to="/" style={{ marginTop: 20, display: 'inline-flex' }}>Volver al foro</Link>
      </div>
    )
  }

  return (
    <main className="foro-pod">
      <div className="foro-wrap">
        <nav className="foro-crumbs">
          <Link to="/">Foro</Link> <span>/</span>
          {type && <Link to={`/?tipo=${slug}`}>{type.name}</Link>}
          {type && <span>/</span>}
          <CategoryTag slug={slug} label={`N.${publication.id}`} />
        </nav>

        {slug === 'discusion'
          ? <DiscussionDetail publication={publication} typeName={type?.name ?? 'Discusión'} related={related} />
          : (
            <PublicationDetail
              publication={publication}
              type={type}
              slug={(slug ?? 'paper') as 'paper' | 'podcast' | 'novedad'}
              related={related}
            />
          )}
      </div>
    </main>
  )
}
