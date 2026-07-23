import type { KnownPublicationTypeSlug, Publication, PublicationPreview, PublicationType } from '@features/foro'
import { PublicationDetail, DiscussionDetail, typeAccent } from '@features/content/components/foro'
import { foroHairline } from '@/theme'

interface ComposePreviewPaneProps {
  publication: Publication
  type: PublicationType
  slug: KnownPublicationTypeSlug
  related: PublicationPreview[]
  /** Optional label override for the pane header (defaults to "Vista previa"). */
  label?: string
}

/**
 * Side-by-side live preview: renders the ACTUAL public detail components
 * (`PublicationDetail` / `DiscussionDetail`) against the in-progress form
 * state, so publishers see exactly what readers will see. Read-only —
 * never mounted with a real publication id from a persisted publication.
 */
export function ComposePreviewPane({ publication, type, slug, related, label = 'Vista previa' }: ComposePreviewPaneProps) {
  return (
    <div className="flex flex-col" style={{ border: `1px solid ${foroHairline}` }}>
      <div
        className="flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider"
        style={{ borderBottom: `1px solid ${foroHairline}`, color: typeAccent(slug) }}
      >
        <span>{label}</span>
        <span className="text-gray-400">{type.name}</span>
      </div>
      <div className="max-h-[80vh] overflow-y-auto px-4 py-6 sm:px-6" aria-hidden>
        {slug === 'discusion' ? (
          <DiscussionDetail publication={publication} typeName={type.name} related={related} preview />
        ) : (
          <PublicationDetail publication={publication} type={type} slug={slug} related={related} />
        )}
      </div>
    </div>
  )
}
