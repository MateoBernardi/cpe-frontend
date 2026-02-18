import { useState, useEffect } from 'react'
import type { Section } from '../../models'
import { textByRole, mediasByRole } from './sectionHelpers'

interface Props { section: Section }

/**
 * Hero principal — 100vh, carrusel de imágenes, texto abajo-izquierda.
 * Roles: heading, subheading | background
 */
export default function HeroSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const subheading = textByRole(section.texts, 'subheading')
  const backgrounds = mediasByRole(section.media, 'background')
  const [current, setCurrent] = useState(0)

  // Auto-play del carrusel
  useEffect(() => {
    if (backgrounds.length <= 1) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % backgrounds.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [backgrounds.length])

  return (
    <section className="relative isolate h-screen w-full overflow-hidden bg-slate-950">
      {/* Carrusel de imágenes de fondo */}
      {backgrounds.length > 0 && (
        <div className="absolute inset-0 -z-10">
          {backgrounds.map((bg, i) => (
            <img
              key={`${bg.mediaUrl}-${i}`}
              src={bg.mediaUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover hero-slide"
              style={{
                opacity: i === current ? 1 : 0,
                transform: i === current ? 'scale(1.02)' : 'scale(1.08)',
                transition: 'opacity 1.2s ease, transform 6s ease-out',
              }}
            />
          ))}
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
      )}

      {/* Si no hay imágenes, gradiente teal fallback */}
      {backgrounds.length === 0 && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900" />
      )}

      {/* Texto — abajo-izquierda */}
      <div className="flex h-full items-end pb-24 sm:pb-32">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="max-w-2xl">
            {heading && (
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
                {heading.body}
              </h1>
            )}
            {subheading && (
              <p className="mt-4 text-lg leading-relaxed text-white/80 sm:text-xl drop-shadow">
                {subheading.body}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Indicadores del carrusel */}
      {backgrounds.length > 1 && (
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
          {backgrounds.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-white' : 'w-2 bg-white/40'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
