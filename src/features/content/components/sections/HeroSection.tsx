import { useState, useEffect } from 'react'
import type { Section } from '../../models'
import { textByRole, mediasByRole } from './sectionHelpers'
import { colors, layout, fontSizes } from '../../../../theme'

interface Props { section: Section }

export default function HeroSection({ section }: Props) {
  const headline    = textByRole(section.texts, 'headline')
  const subheadline = textByRole(section.texts, 'subheading')
  const ctaPrimary  = textByRole(section.texts, 'cta')
  const ctaSecondary = textByRole(section.texts, 'cta_secondary')
  const trust       = textByRole(section.texts, 'trust')
  const backgrounds = mediasByRole(section.media, 'background')
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (backgrounds.length <= 1) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % backgrounds.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [backgrounds.length])

  return (
    <section className={`relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-hidden`} style={{ backgroundColor: colors.lightGray }}>
      {backgrounds.length > 0 && (
        <div className="absolute inset-0 -z-10">
          {backgrounds.map((bg, i) => (
            <img key={`${bg.url}-${i}`} src={bg.url} alt="" loading={i === 0 ? 'eager' : 'lazy'}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                opacity: i === current ? 1 : 0,
                transform: i === current ? 'scale(1.02)' : 'scale(1.08)',
                transition: 'opacity 1.2s ease, transform 6s ease-out',
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/20" />
        </div>
      )}
      {backgrounds.length === 0 && (
        <div className="absolute inset-0 -z-10"
          style={{ background: `linear-gradient(135deg, ${colors.tealDeep}, ${colors.tealMid}, ${colors.blueDark})` }}
        />
      )}
      <div className={`relative z-20 w-full text-center ${layout.containerNarrow}`}>
        {headline && (
          <h1
            className="text-[length:var(--hero-title-mobile-size)] font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg font-primary"
            style={{ '--hero-title-mobile-size': fontSizes['3xl'] } as React.CSSProperties}
          >
            {headline.body}
          </h1>
        )}
        {subheadline && (
          <p
            className="mx-auto mt-[2vh] max-w-2xl text-[length:var(--hero-subtitle-mobile-size)] leading-relaxed text-white/80 sm:text-xl drop-shadow"
            style={{ '--hero-subtitle-mobile-size': fontSizes.base } as React.CSSProperties}
          >
            {subheadline.body}
          </p>
        )}
        {(ctaPrimary || ctaSecondary) && (
          <div className="mt-[4vh] flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            {ctaPrimary && (
              <a href="/contact"
                className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 sm:px-8 sm:py-3.5"
                style={{ backgroundColor: colors.ctaPrimary, boxShadow: `0 10px 25px -5px ${colors.ctaShadow}` }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.ctaPrimaryHover }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.ctaPrimary }}
              >
                {ctaPrimary.body}
              </a>
            )}
            {ctaSecondary && (
              <a href="/servicios/seleccion-de-personal#postulaciones"
                className="inline-block rounded-xl border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20 sm:px-8 sm:py-3.5"
                style={{ backgroundColor: colors.ctaGhost }}
              >
                {ctaSecondary.body}
              </a>
            )}
          </div>
        )}
        {trust && (
          <div className="mt-[5vh]">
            <p className="text-sm font-medium tracking-wide text-white/60">{trust.body}</p>
          </div>
        )}
      </div>
      {backgrounds.length > 1 && (
        <div className="absolute bottom-[4vh] left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {backgrounds.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
              aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
    </section>
  )
}
