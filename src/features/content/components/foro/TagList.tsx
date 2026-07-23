import { colors } from '../../../../theme'

interface TagListProps {
  tags: string[]
}

/** Content-tag pills (topic tags, not the type `<CategoryTag>`). Renders 0-N, hides entirely when empty. No outer margin — callers control spacing for their own layout. */
export function TagList({ tags }: TagListProps) {
  if (!tags || tags.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full px-3 py-1 text-xs font-medium text-gray-600"
          style={{ backgroundColor: colors.lightGray }}
        >
          #{tag}
        </span>
      ))}
    </div>
  )
}
