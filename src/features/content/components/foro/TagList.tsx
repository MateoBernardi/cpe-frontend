import { colors } from '../../../../theme'

interface TagListProps {
  tags: string[]
  /** Cap for compact surfaces (list rows, cards): the extra tags collapse into a "+N" pill. Unlimited when omitted. */
  max?: number
  /** `sm` shrinks the pills for card/list contexts, where they sit next to 11–12px meta text. */
  size?: 'default' | 'sm'
}

/** Content-tag pills (topic tags, not the type `<CategoryTag>`). Renders 0-N, hides entirely when empty. No outer margin — callers control spacing for their own layout. */
export function TagList({ tags, max, size = 'default' }: TagListProps) {
  if (!tags || tags.length === 0) return null

  const visible = max != null ? tags.slice(0, max) : tags
  const extra = tags.length - visible.length

  const pillClass = size === 'sm'
    ? 'rounded-full px-2 py-0.5 text-[11px] font-medium text-gray-600'
    : 'rounded-full px-3 py-1 text-xs font-medium text-gray-600'

  return (
    <div className={`flex flex-wrap ${size === 'sm' ? 'gap-1' : 'gap-2'}`}>
      {visible.map((tag) => (
        <span key={tag} className={pillClass} style={{ backgroundColor: colors.lightGray }}>
          #{tag}
        </span>
      ))}
      {extra > 0 && (
        <span className={pillClass} style={{ backgroundColor: colors.lightGray }} title={tags.slice(visible.length).join(', ')}>
          +{extra}
        </span>
      )}
    </div>
  )
}
