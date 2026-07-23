import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCategories, usePublications, usePublicationTypes, resolveKnownSlug } from '@features/foro'
import { ConceptMap } from '../components/ConceptMap'
import { PublicationsSlide } from '../components/PublicationsSlide'
import { TypeHero } from '../components/TypeHero'
import { MagazineGrid } from '../components/MagazineGrid'

/** Simple centered loading placeholder, matching the foro's existing style. */
function ForoLoading({ label }: { label: string }) {
  return (
    <div className="foro-wrap" style={{ padding: '60px 0', textAlign: 'center' }}>
      <p style={{ color: 'var(--foro-muted)' }}>{label}</p>
    </div>
  )
}

/** Conceptual-map experience: no `?tipo` (or an unrecognized one). */
function MapExperience() {
  const { data: categories, isLoading, isError } = useCategories()

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [slideOpen, setSlideOpen] = useState(false)

  const handleSelectCategory = (id: number) => {
    setSelectedIds([id])
    setSlideOpen(true)
  }

  const handleToggleCategory = (id: number) => {
    setSelectedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
      if (updated.length === 0) setSlideOpen(false)
      return updated
    })
  }

  const handleClose = () => setSlideOpen(false)

  if (isLoading) {
    return <ForoLoading label="Cargando conceptos…" />
  }

  if (isError || !categories || categories.length === 0) {
    return (
      <div className="foro-wrap" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--foro-muted)' }}>
          No pudimos cargar el mapa conceptual en este momento. Probá recargar la página.
        </p>
      </div>
    )
  }

  return (
    <>
      <ConceptMap categories={categories} onSelectCategory={handleSelectCategory} />
      <PublicationsSlide
        open={slideOpen}
        categories={categories}
        selectedIds={selectedIds}
        onToggleCategory={handleToggleCategory}
        onClose={handleClose}
      />
    </>
  )
}

/** Type-filtered magazine view: a known `?tipo=` slug. */
function TypeExperience({ typeId, typeSlug, typeName }: { typeId: number; typeSlug: ReturnType<typeof resolveKnownSlug>; typeName: string }) {
  const { data: publications, isLoading } = usePublications({ typeId, limit: 24 })

  if (isLoading) {
    return <ForoLoading label="Cargando publicaciones…" />
  }

  if (!publications || publications.length === 0) {
    return (
      <div className="foro-wrap" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--foro-muted)' }}>Todavía no hay publicaciones en este canal.</p>
      </div>
    )
  }

  const [featured, ...rest] = publications

  return (
    <div className="foro-wrap">
      <TypeHero publication={featured} typeSlug={typeSlug} typeName={typeName} />
      <MagazineGrid publications={rest} typeSlug={typeSlug} typeName={typeName} />
    </div>
  )
}

export default function HomePage() {
  const [searchParams] = useSearchParams()
  const tipo = searchParams.get('tipo')

  const { data: types, isLoading: typesLoading } = usePublicationTypes()

  // <MapExperience> is keyed by the raw `tipo` value so that its local
  // selection/slide state always resets when the param changes — including
  // between two different unrecognized `tipo` values, which would otherwise
  // both render the same component instance and keep stale state.
  if (!tipo) {
    return <MapExperience key="__root__" />
  }

  if (typesLoading) {
    return <ForoLoading label="Cargando…" />
  }

  const matchedType = types?.find((type) => resolveKnownSlug(type) === tipo)

  if (!matchedType) {
    // Unknown/unsupported `tipo` value: fall back to the map experience.
    return <MapExperience key={tipo} />
  }

  return (
    <TypeExperience
      key={tipo}
      typeId={matchedType.id}
      typeSlug={resolveKnownSlug(matchedType)}
      typeName={matchedType.name}
    />
  )
}
