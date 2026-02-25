import { useState, useEffect } from 'react'
import type { Section } from '../../models'
import { textByRole, mediasByRole } from './sectionHelpers'

interface Props { section: Section }

/**
 * Hero principal — Fórmula de 5 elementos:
 * 01 Headline · 02 Subheadline · 03 CTA primario · 04 CTA secundario · 05 Trust bar
 * Fondo: carrusel de imágenes con overlay gradiente.
 */
export default function HeroSection({ section }: Props) {
  const headline    = textByRole(section.texts, 'headline')
  const subheadline = textByRole(section.texts, 'subheading')
  const ctaPrimary  = textByRole(section.texts, 'cta')
  const ctaSecondary = textByRole(section.texts, 'cta_secondary')
  const trust       = textByRole(section.texts, 'trust')
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
    <section className="relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-200">
      {/* ── Carrusel de imágenes de fondo ── */}
      {backgrounds.length > 0 && (
        <div className="absolute inset-0 -z-10">
          {backgrounds.map((bg, i) => (
            <img
              key={`${bg.mediaUrl}-${i}`}
              src={bg.mediaUrl}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                opacity: i === current ? 1 : 0,
                transform: i === current ? 'scale(1.02)' : 'scale(1.08)',
                transition: 'opacity 1.2s ease, transform 6s ease-out',
              }}
            />
          ))}
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/20" />
        </div>
      )}

      {/* Fallback sin imágenes */}
      {backgrounds.length === 0 && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-teal-800 via-teal-700 to-slate-900" />
      )}

      {/* ── Contenido centrado ── */}
      <div className="relative z-20 mx-auto w-full max-w-4xl px-6 text-center">
        {/* 01 — Headline */}
        {headline && (
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
            {headline.body}
          </h1>
        )}

        {/* 02 — Subheadline */}
        {subheadline && (
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl drop-shadow">
            {subheadline.body}
          </p>
        )}

        {/* 03 & 04 — CTAs */}
        {(ctaPrimary || ctaSecondary) && (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            {ctaPrimary && (
              <a
                href="/contact"
                className="inline-block rounded-xl bg-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/30 transition-all hover:bg-teal-500 hover:shadow-teal-500/40 hover:-translate-y-0.5"
              >
                {ctaPrimary.body}
              </a>
            )}
            {ctaSecondary && (
              <a
                href="#about"
                className="inline-block rounded-xl border-2 border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20"
              >
                {ctaSecondary.body}
              </a>
            )}
          </div>
        )}

        {/* 05 — Trust bar */}
        {trust && (
          <div className="mt-10">
            <p className="text-sm font-medium tracking-wide text-white/60">
              {trust.body}
            </p>
          </div>
        )}
      </div>

      {/* ── Indicadores del carrusel ── */}
      {backgrounds.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
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
