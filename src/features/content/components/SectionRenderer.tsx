import type { Section } from '../models'
import TextBlock from './TextBlock'
import MediaBlock from './MediaBlock'

interface SectionRendererProps {
  section: Section
}

/**
 * Renderiza una sección completa: textos y media ordenados.
 * Reutilizable en main y admin (previsualización).
 */
export default function SectionRenderer({ section }: SectionRendererProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold capitalize text-gray-900">{section.name}</h2>

      {section.media.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {section.media.map((m, i) => (
            <MediaBlock key={`${m.mediaUrl}-${i}`} media={m} />
          ))}
        </div>
      )}

      {section.texts.length > 0 && (
        <div className="space-y-4">
          {section.texts.map((t, i) => (
            <TextBlock key={`${t.body.slice(0, 20)}-${i}`} text={t} />
          ))}
        </div>
      )}
    </div>
  )
}
