interface TagListProps {
  tags: string[]
}

/** `.tags-row` — renders 0-N tag pills, hides the row entirely when empty. */
export function TagList({ tags }: TagListProps) {
  if (!tags || tags.length === 0) return null
  return (
    <div className="foro-tags-row">
      {tags.map((tag) => (
        <span key={tag}>#{tag}</span>
      ))}
    </div>
  )
}
