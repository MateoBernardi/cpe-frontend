import { useState } from 'react'
import type { SectionGuideConfig } from '../../config/sectionCanvasConfig'

interface SectionGuideProps {
  guide: SectionGuideConfig
  displayName: string
}

/**
 * Panel de guía rápida para la sección. Muestra descripción, tips,
 * recomendaciones de imagen y colores.
 */
export default function SectionGuide({ guide, displayName }: SectionGuideProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-indigo-50"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <span className="text-sm font-semibold text-indigo-900">
            Guía rápida — {displayName}
          </span>
        </div>
        <svg
          className={`h-5 w-5 text-indigo-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-indigo-100 px-5 py-4 space-y-4">
          {/* Descripción */}
          <p className="text-sm leading-relaxed text-slate-700">{guide.description}</p>

          {/* Tips */}
          {guide.tips.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-700">
                Consejos
              </h4>
              <ul className="space-y-1.5">
                {guide.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Imagen recomendada */}
          {guide.imageTip && (
            <div className="flex items-start gap-2 rounded-lg bg-purple-50 p-3">
              <span className="text-base">🖼️</span>
              <p className="text-xs leading-relaxed text-purple-800">{guide.imageTip}</p>
            </div>
          )}

          {/* Color tip */}
          {guide.colorTip && (
            <div className="flex items-start gap-2 rounded-lg bg-teal-50 p-3">
              <span className="text-base">🎨</span>
              <p className="text-xs leading-relaxed text-teal-800">{guide.colorTip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
