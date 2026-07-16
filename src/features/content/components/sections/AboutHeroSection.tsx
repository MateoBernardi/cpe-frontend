import type { Section } from '../../models'
import { textByRole, textsByRole, mediaByRole, mediasByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'
import { colors, layout } from '../../../../theme'

interface Props { about: Section; infoPrimary: Section }

/**
 * Hero fusionado "Quiénes somos": combina, solo a nivel de render, las
 * secciones backend `about` (equipo/bio) e `info_primary` (título + lista de
 * viñetas + diagrama). Ambas siguen siendo secciones separadas en el backend;
 * acá únicamente se mapean sus roles a un único layout visual.
 */
export default function AboutHeroSection({ about, infoPrimary }: Props) {
  const eyebrow = textByRole(about.texts, 'heading')
  const title = textByRole(infoPrimary.texts, 'heading')
  const bullets = textsByRole(infoPrimary.texts, 'bullet')
  const diagram = mediaByRole(infoPrimary.media, 'diagram')
  const photos = mediasByRole(about.media, 'photo')
  const bios = textsByRole(about.texts, 'bio')
  const paragraphs = textsByRole(about.texts, 'paragraph')
  // Un integrante del equipo = una foto (ancla visual del chip). Nos basamos en
  // `photos` y no en el máximo con `bios`, porque los bios/paragraphs del CMS
  // pueden traer entradas duplicadas de más (p. ej. un bio/paragraph repetido)
  // que si no, generarían una tarjeta fantasma sin foto debajo de las reales.
  const memberCount = photos.length
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 })

  return (
    <section ref={ref} className="relative overflow-hidden" style={{ backgroundColor: colors.offWhite }}>
      {/* Grilla decorativa tipo "papel cuadriculado" — solo desktop */}
      <div
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{
          backgroundImage: `linear-gradient(${colors.tealMid}0d 1px, transparent 1px), linear-gradient(90deg, ${colors.tealMid}0d 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
        }}
      />
      {/* Dial decorativo rotante — solo desktop grande */}
      <div
        className="pointer-events-none absolute right-[-190px] top-1/2 hidden h-[520px] w-[520px] -translate-y-1/2 rounded-full border border-dashed lg:block"
        style={{ borderColor: `${colors.tealMid}4d`, animation: 'aboutHeroDialSpin 90s linear infinite' }}
      >
        <div className="absolute inset-16 rounded-full border" style={{ borderColor: `${colors.tealMid}24` }} />
        <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full" style={{ backgroundColor: colors.tealMid }} />
      </div>

      <div className={`${layout.container} ${layout.sectionPadY} relative z-10 grid gap-[5vh] lg:grid-cols-[42%_1fr] lg:items-center lg:gap-[5vw]`}>
        {/* Izquierda: foto grande */}
        {diagram && (
          <div
            className={`relative mx-auto w-full max-w-md transition-all duration-1000 ${
              isInView ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'
            }`}
          >
            <div className="relative aspect-[4/5]">
              <div className="absolute left-[-14px] top-[14px] h-full w-full border" style={{ borderColor: colors.tealDeep }} />
              <img
                src={diagram.url}
                alt=""
                className="relative z-10 h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* Derecha: copy */}
        <div>
          {eyebrow && (
            <div
              className={`font-mono text-xs uppercase tracking-[0.24em] transition-opacity duration-700 ${
                isInView ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ color: colors.tealMid }}
            >
              {eyebrow.body}
            </div>
          )}

          {title && (
            <h1
              className={`mt-[2vh] font-secondary text-3xl font-medium leading-[1.05] tracking-tight sm:text-4xl md:text-5xl transition-all duration-1000 delay-150 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{ color: colors.blueDark }}
            >
              {title.body}
            </h1>
          )}

          {bullets.length > 0 && (
            <ul
              className={`mt-[4vh] flex max-w-xl flex-col transition-all duration-1000 delay-300 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              {bullets.map((b, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[34px_1fr] items-baseline gap-3 border-t py-3 text-sm leading-relaxed last:border-b sm:text-base"
                  style={{ borderColor: `${colors.blueDark}24`, color: colors.blueMid }}
                >
                  <span className="font-mono text-xs" style={{ color: colors.tealMid }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {b.body}
                </li>
              ))}
            </ul>
          )}

          {memberCount > 0 && (
            <div
              className={`mt-[4vh] flex flex-wrap gap-8 transition-all duration-1000 delay-500 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              {Array.from({ length: memberCount }).map((_, i) => {
                const photo = photos[i]
                const bio = bios[i]
                const paragraph = paragraphs[i]
                if (!photo && !bio) return null
                return (
                  <div key={i} className="flex items-start gap-4">
                    {photo && (
                      <div className="relative h-14 w-14 flex-shrink-0">
                        <div className="absolute -left-1 top-1 h-full w-full border" style={{ borderColor: colors.tealDeep }} />
                        <img src={photo.url} alt="" className="relative z-10 h-full w-full object-cover" loading="lazy" />
                      </div>
                    )}
                    <div className="min-w-0 max-w-[220px]">
                      {bio && (
                        <div className="font-secondary text-sm font-semibold leading-snug" style={{ color: colors.blueDark }}>
                          {bio.body}
                        </div>
                      )}
                      {paragraph && (
                        <p className="mt-1 text-xs leading-relaxed" style={{ color: colors.blueMid }}>
                          {paragraph.body}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
