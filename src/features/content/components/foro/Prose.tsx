import { colors } from '../../../../theme'
import type { ContentFormat } from '@features/foro'

interface ProseProps {
  content: string
  size?: 'base' | 'lg'
  /** 'text' (default) preserves the original blank-line-split rendering unchanged — every
   *  publication written before docx import existed stays exactly as it renders today. 'html'
   *  renders `content` directly: it's only ever set from `Publication.contentFormat`, which is
   *  only 'html' for docx-imported/rich-text content, already sanitized SERVER-SIDE at write
   *  time (see D46 in cpe-foro-backend's DECISIONS.md) — this component does not re-sanitize. */
  format?: ContentFormat
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
export function Prose({ content, size = 'base', format = 'text' }: ProseProps) {
  const sizeClass = size === 'lg' ? 'text-lg' : 'text-base'

  if (format === 'html') {
    // El único `dangerouslySetInnerHTML` de todo el frontend — a propósito, ver el comentario de
    // `format` arriba: es seguro únicamente porque el backend sanitiza esto al escribir, nunca al
    // leer (D46). `prose` (plugin @tailwindcss/typography) le da estilo real a los tags que el
    // sanitizador del backend permite (h2-h4, listas, blockquote, tabla, a) sin tener que
    // reimplementarlos a mano acá — `prose-headings`/`prose-a` fijan esos dos al mismo azul/teal
    // de marca en vez del gris/violeta por default del plugin. El drop cap se aplica al primer
    // `<p>` vía `first-of-type` en lugar de al string (que ya es HTML real, no texto a partir).
    return (
      <div
        className={`prose max-w-none text-gray-700 ${sizeClass === 'text-lg' ? 'prose-lg' : ''} prose-headings:text-[${colors.blueDark}] prose-a:text-[${colors.tealDeep}] [&_p:first-of-type]:first-letter:float-left [&_p:first-of-type]:first-letter:mr-1 [&_p:first-of-type]:first-letter:font-primary [&_p:first-of-type]:first-letter:text-5xl [&_p:first-of-type]:first-letter:font-bold [&_p:first-of-type]:first-letter:leading-none [&_p:first-of-type]:first-letter:text-[${colors.tealDeep}]`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  const paragraphs = content.split(/\n{2,}/).filter((p) => p.trim().length > 0)
  const list = paragraphs.length > 0 ? paragraphs : [content]
  return (
    <div className={`space-y-5 leading-relaxed text-gray-700 ${sizeClass}`}>
      {list.map((p, i) => (
        <p key={i} className={i === 0 ? DROP_CAP_CLASS : undefined}>{p}</p>
      ))}
    </div>
  )
}
