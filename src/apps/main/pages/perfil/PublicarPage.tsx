import { useSearchParams } from 'react-router-dom'
import type { KnownPublicationTypeSlug } from '@features/foro'
import { CategoryTag, PublicationComposer, TYPE_OPTIONS, TYPE_CONFIG, typeAccent } from '@features/content/components/foro'
import { colors, layout, foroHairline } from '@/theme'
import PublisherGate from './PublisherGate'

/**
 * `/perfil/publicar` — URL-driven type picker (`?tipo=`) then the shared
 * composer. `key={slug}` on the composer resets all of its form state when
 * the type changes, since it's effectively a brand new draft.
 */

const KNOWN_SLUGS = TYPE_OPTIONS.map((t) => t.slug)

function isKnownSlug(value: string | null): value is KnownPublicationTypeSlug {
  return value != null && (KNOWN_SLUGS as string[]).includes(value)
}

export default function PublicarPage() {
  return (
    <div className="pt-[22vh] pb-[6vh] sm:pb-[8vh] md:pb-[10vh]" style={{ backgroundColor: colors.white }}>
      <div className={layout.container}>
        <PublisherGate>
          <PublicarFlow />
        </PublisherGate>
      </div>
    </div>
  )
}

function PublicarFlow() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tipoParam = searchParams.get('tipo')
  const slug = isKnownSlug(tipoParam) ? tipoParam : null

  if (!slug) {
    return <TypePicker onPick={(picked) => setSearchParams({ tipo: picked })} />
  }

  return <PublicationComposer key={slug} mode="create" slug={slug} onChangeType={() => setSearchParams({})} />
}

function TypePicker({ onPick }: { onPick: (slug: KnownPublicationTypeSlug) => void }) {
  return (
    <div>
      <h1 className="text-xl font-bold sm:text-2xl" style={{ color: colors.blueDark }}>
        ¿Qué querés publicar?
      </h1>
      <p className="mt-1 max-w-xl text-sm text-gray-500">
        Elegí un formato para empezar. Vas a ver la vista previa real mientras escribís.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TYPE_OPTIONS.map((opt) => {
          const config = TYPE_CONFIG[opt.slug]
          return (
            <button
              key={opt.slug}
              type="button"
              onClick={() => onPick(opt.slug)}
              className="flex flex-col items-start gap-2 rounded-2xl bg-white p-4 text-left transition-colors hover:bg-gray-50"
              style={{ border: `1px solid ${foroHairline}`, borderTop: `3px solid ${typeAccent(opt.slug)}` }}
            >
              <CategoryTag slug={opt.slug} label={opt.name} />
              <h2 className="text-base font-semibold" style={{ color: colors.blueDark }}>{opt.name}</h2>
              <span className="text-xs text-gray-500">{config.channelLabel}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
