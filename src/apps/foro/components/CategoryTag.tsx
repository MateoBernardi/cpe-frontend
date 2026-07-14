import type { KnownPublicationTypeSlug } from '@features/foro'
import { typeSlugToCatClass } from '../lib/typeStyle'

interface CategoryTagProps {
  slug: KnownPublicationTypeSlug | null
  label: string
}

export function CategoryTag({ slug, label }: CategoryTagProps) {
  return (
    <span className={['foro-tag', typeSlugToCatClass(slug)].filter(Boolean).join(' ')}>
      <span className="foro-dot" />
      {label}
    </span>
  )
}
