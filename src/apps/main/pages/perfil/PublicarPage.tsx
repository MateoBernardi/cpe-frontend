import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForoAuth, type KnownPublicationTypeSlug } from '@features/foro'
import { TypePill, PublicationComposer, TYPE_OPTIONS, TYPE_CONFIG, typeAccent, EMPTY_FORM, type FormState } from '@features/content/components/foro'
import { colors, layout, foroHairline } from '@/theme'
import PublisherGate from './PublisherGate'

/** The two types visitors may submit — the rest (`podcast`, `novedad`) stay publisher-only, per the
 *  review-workflow decision: only community-contribution formats go through review. */
const VISITOR_TYPE_SLUGS: readonly KnownPublicationTypeSlug[] = ['paper', 'discusion']

/**
 * `/perfil/publicar` — URL-driven type picker (`?tipo=`) then the shared
 * composer.
 *
 * The draft lives HERE, not in the composer: picking a format swaps this
 * screen between the picker and the composer, and the composer used to carry
 * `key={slug}` on top of that — so changing your mind about the format threw
 * away everything already written. Holding the form state one level up makes
 * the format a property of the draft instead of a reason to start over.
 */

function isKnownSlug(value: string | null, allowedSlugs: readonly KnownPublicationTypeSlug[]): value is KnownPublicationTypeSlug {
  return value != null && (allowedSlugs as readonly string[]).includes(value)
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
  const { role } = useForoAuth()
  // Visitors only submit paper/discusión — the two formats the review workflow was built for
  // (see `VISITOR_TYPE_SLUGS`). Publishers keep the full picker, unaffected.
  const availableOptions = role === 'visitor' ? TYPE_OPTIONS.filter((opt) => VISITOR_TYPE_SLUGS.includes(opt.slug)) : TYPE_OPTIONS
  const allowedSlugs = availableOptions.map((opt) => opt.slug)

  const [searchParams, setSearchParams] = useSearchParams()
  const tipoParam = searchParams.get('tipo')
  const slug = isKnownSlug(tipoParam, allowedSlugs) ? tipoParam : null

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const hasDraft = form.title.trim() !== '' || form.content.trim() !== ''

  if (!slug) {
    return <TypePicker options={availableOptions} hasDraft={hasDraft} onPick={(picked) => setSearchParams({ tipo: picked })} />
  }

  return (
    <PublicationComposer
      mode="create"
      slug={slug}
      form={form}
      onFormChange={setForm}
      onChangeType={() => setSearchParams({})}
    />
  )
}

function TypePicker({
  options,
  hasDraft,
  onPick,
}: {
  options: typeof TYPE_OPTIONS
  hasDraft: boolean
  onPick: (slug: KnownPublicationTypeSlug) => void
}) {
  return (
    <div>
      <h1 className="text-xl font-bold sm:text-2xl" style={{ color: colors.blueDark }}>
        ¿Qué querés publicar?
      </h1>
      <p className="mt-1 max-w-xl text-sm text-gray-500">
        {hasDraft
          ? 'Elegí otro formato: lo que ya escribiste se conserva.'
          : 'Elegí un formato para empezar. Vas a ver la vista previa real mientras escribís.'}
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {options.map((opt) => {
          const config = TYPE_CONFIG[opt.slug]
          return (
            <button
              key={opt.slug}
              type="button"
              onClick={() => onPick(opt.slug)}
              className="flex flex-col items-start gap-2 rounded-2xl bg-white p-4 text-left transition-colors hover:bg-gray-50"
              style={{ border: `1px solid ${foroHairline}`, borderTop: `3px solid ${typeAccent(opt.slug)}` }}
            >
              <TypePill slug={opt.slug} label={opt.name} />
              <h2 className="text-base font-semibold" style={{ color: colors.blueDark }}>{opt.name}</h2>
              <span className="text-xs text-gray-500">{config.channelLabel}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
