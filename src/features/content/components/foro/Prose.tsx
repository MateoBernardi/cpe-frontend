import { colors } from '../../../../theme'

interface ProseProps {
  content: string
  size?: 'base' | 'lg'
}

/**
 * Drop-cap classes for a body's opening paragraph only — never applied to
 * every paragraph. Built from `colors.tealDeep` the same way `theme.ts`'s own
 * `tw.*` helpers embed a brand token into a Tailwind arbitrary value (no
 * bare hex literal here). `::first-letter` is a CSS pseudo-element, so this
 * degrades gracefully on its own: a body that starts with punctuation/a
 * digit, or is very short (even empty), never throws — the browser simply
 * picks whatever the "first letter" resolves to (or nothing at all).
 */
const DROP_CAP_CLASS = `first-letter:float-left first-letter:mr-1 first-letter:font-primary first-letter:text-5xl first-letter:font-bold first-letter:leading-none first-letter:text-[${colors.tealDeep}]`

/**
 * Article body copy — paragraphs split on blank lines, standard reading type
 * scale, drop cap on the first paragraph's first letter. Shared by
 * `PublicationDetail` (paper/podcast/novedad) and `DiscussionDetail` (the
 * discusión's opening post) so every prose body in the Foro gets the same
 * treatment.
 */
export function Prose({ content, size = 'base' }: ProseProps) {
  const paragraphs = content.split(/\n{2,}/).filter((p) => p.trim().length > 0)
  const list = paragraphs.length > 0 ? paragraphs : [content]
  return (
    <div className={`space-y-5 leading-relaxed text-gray-700 ${size === 'lg' ? 'text-lg' : 'text-base'}`}>
      {list.map((p, i) => (
        <p key={i} className={i === 0 ? DROP_CAP_CLASS : undefined}>{p}</p>
      ))}
    </div>
  )
}
