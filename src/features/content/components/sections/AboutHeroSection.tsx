import { useNavigate } from 'react-router-dom'
import type { Section } from '../../models'
import { textByRole, textsByRole, mediaByRole, mediasByRole } from './sectionHelpers'
import { useSectionViewModel } from '@features/content/viewmodels'
import { useInView } from '@shared/hooks'
import AboutHeroServicesMatrix from './AboutHeroServicesMatrix'
import { colors, layout } from '../../../../theme'

interface Props { hero: Section; about: Section; infoPrimary: Section }

/**
 * Fallback idéntico al de `FORO_TEASER_FALLBACKS.cta` en
 * `src/apps/main/components/ForoPreviewSection.tsx` — se inlinea acá (en vez
 * de importarlo desde un componente de página) para no invertir la dirección
 * de dependencia entre un componente de página y uno de sección compartido.
 * Si ese texto cambia ahí, actualizar también acá.
 */
const FORO_CTA_FALLBACK = 'Explorar el foro completo →'

/**
 * Divide la línea de bio ("Nombre — Rol") en nombre y rol para darles
 * jerarquía tipográfica distinta. Si el body no tiene separador reconocible,
 * todo se renderiza como nombre — el layout nunca depende del formato exacto.
 */
function splitBio(body: string): { name: string; role: string | null } {
  const [name, ...rest] = body.split(/\r?\n|\s+[—–|·]\s+/)
  const role = rest.join(' ').trim()
  return { name: name.trim(), role: role.length > 0 ? role : null }
}

/**
 * Hero fusionado de la home: combina, solo a nivel de render, tres secciones
 * backend — `hero` (headline/descripción/CTAs del hero original, ahora oculto
 * como sección propia), `about` (eyebrow + bios del equipo) e `info_primary`
 * (foto de los fundadores, rol "diagram"). Las tres siguen siendo secciones
 * separadas en el backend; acá únicamente se mapean sus roles a un único
 * layout visual de 3 columnas: copy | foto centerpiece | perfiles + CTA foro.
 * Cierra con la matriz de servicios (AboutHeroServicesMatrix).
 */
export default function AboutHeroSection({ hero, about, infoPrimary }: Props) {
  const navigate = useNavigate()
  const { section: foroTeaser } = useSectionViewModel('foro_teaser')

  // Columna izquierda (copy de "hero" + eyebrow de "about")
  const eyebrow = textByRole(about.texts, 'heading')
  const headline = textByRole(hero.texts, 'headline')
  const subheading = textByRole(hero.texts, 'subheading')
  const ctaPrimary = textByRole(hero.texts, 'cta')
  const ctaSecondary = textByRole(hero.texts, 'cta_secondary')
  const trust = textByRole(hero.texts, 'trust')

  // Centro: foto de fundadores ("info_primary", rol diagram)
  const photo = mediaByRole(infoPrimary.media, 'diagram')
  // Logos de servicios ("info_primary", rol icon — uno por servicio, en orden)
  const serviceIcons = mediasByRole(infoPrimary.media, 'icon')

  // Columna derecha: perfiles de fundadores ("about"). Se itera SOLO sobre las
  // bios: un `paragraph` sin bio correspondiente (resto de datos del layout
  // anterior) nunca renderiza un bloque suelto/duplicado.
  const bios = textsByRole(about.texts, 'bio')
  const paragraphs = textsByRole(about.texts, 'paragraph')

  const foroCtaBody = foroTeaser?.texts.find((t) => t.role === 'cta')?.body?.trim()
  const foroCtaText = foroCtaBody ? foroCtaBody : FORO_CTA_FALLBACK

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  return (
    // En desktop (lg+) todo el hero — header fijo + grilla + matriz de servicios
    // + banda de scroll — ocupa un viewport: min-h-screen con columna flex donde
    // la grilla absorbe el espacio sobrante. Si el contenido dinámico crece, la
    // sección simplemente se extiende (nunca recorta). Mobile/tablet: flujo normal.
    <section
      ref={ref}
      className="relative overflow-hidden lg:flex lg:min-h-screen lg:flex-col"
      style={{ backgroundColor: colors.offWhite }}
    >
      {/* pt despeja el header fijo del sitio (~110px, ver headerOffset en MainLayout)
          para que nunca tape el contenido del hero */}
      <div className={`${layout.container} relative z-10 w-full pt-[110px] sm:pt-[120px] lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:justify-center`}>
        {/* Grilla hero: copy | foto | perfiles. Las tres columnas se estiran a la
            altura del contenido más alto — nada depende de alturas fijas. */}
        <div className="grid gap-[5vh] pb-[6vh] sm:pb-[8vh] lg:grid-cols-[minmax(0,29%)_minmax(0,1fr)_minmax(0,24%)] lg:gap-[3vw] lg:pb-[3vh]">
          {/* Izquierda: masthead editorial. id="about" mantiene el anchor /#about
              funcionando dentro del hero fusionado (el <section> exterior lleva
              id="hero", ver HomePage). */}
          <div id="about" className="flex min-w-0 flex-col justify-center py-[2vh]">
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

            {headline && (
              <h1
                className={`mt-[2.5vh] font-secondary text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl lg:text-[min(3.4rem,6vh)] transition-all duration-1000 delay-150 ${
                  isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                }`}
                style={{ color: colors.blueDark }}
              >
                {headline.body}
              </h1>
            )}

            {subheading && (
              <p
                className={`mt-[3vh] max-w-prose text-base leading-relaxed transition-all duration-1000 delay-300 ${
                  isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                }`}
                style={{ color: colors.blueMid }}
              >
                {subheading.body}
              </p>
            )}

            {(ctaPrimary || ctaSecondary) && (
              <div
                className={`mt-[4vh] flex flex-wrap items-center gap-x-6 gap-y-3 transition-all duration-1000 delay-500 ${
                  isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                }`}
              >
                {ctaPrimary && (
                  <a
                    href="/contact"
                    className="group inline-flex items-center gap-2 rounded-md px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-300"
                    style={{ backgroundColor: colors.blueDark }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.blueMid }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.blueDark }}
                  >
                    {/* Se recorta la flecha final del texto (si la trae) para animarla siempre aparte */}
                    {ctaPrimary.body.replace(/\s*→\s*$/, '')}
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </a>
                )}
                {ctaSecondary && (
                  <a
                    href="/servicios/seleccion-de-personal#postulaciones"
                    className="border-b pb-1 text-sm font-semibold transition-opacity duration-300 hover:opacity-70"
                    style={{ borderColor: colors.tealMid, color: colors.blueDark }}
                  >
                    {ctaSecondary.body}
                  </a>
                )}
              </div>
            )}

            {trust && (
              <p
                className={`mt-[4vh] font-mono text-xs uppercase tracking-[0.18em] transition-opacity duration-1000 delay-700 ${
                  isInView ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ color: colors.blueMid }}
              >
                {trust.body}
              </p>
            )}
          </div>

          {/* Centro: foto de los fundadores — pieza central, sin recorte agresivo.
              Bordes laterales fundidos al fondo vía mask para conectar visualmente
              el copy (izquierda) con los perfiles (derecha). */}
          {photo && (
            <div
              className={`relative min-h-[320px] transition-opacity duration-1000 delay-200 lg:min-h-0 ${
                isInView ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={photo.url}
                alt=""
                loading="eager"
                className="h-full w-full object-cover object-center"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)',
                }}
              />
            </div>
          )}

          {/* Derecha: perfiles de fundadores + CTA foro. min-w-0 en cada bloque —
              soporta N fundadores y credenciales de largo variable. La columna se
              renderiza siempre: el CTA al foro vive acá aunque no haya bios. */}
          <div className="flex min-w-0 flex-col justify-center py-[2vh]">
            {bios.map((bio, i) => {
              const paragraph = paragraphs[i]
              const parts = splitBio(bio.body)
              return (
                <div
                  key={i}
                  className={`min-w-0 transition-all duration-1000 ${
                    isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                  } ${i > 0 ? 'mt-[3vh] border-t pt-[3vh]' : ''}`}
                  style={{
                    transitionDelay: `${300 + i * 150}ms`,
                    ...(i > 0 ? { borderColor: `${colors.blueDark}1f` } : {}),
                  }}
                >
                  {parts && (
                    <h2 className="font-secondary text-xl font-medium tracking-tight sm:text-2xl lg:text-[min(1.5rem,3.1vh)]" style={{ color: colors.blueDark }}>
                      {parts.name}
                    </h2>
                  )}
                  {parts?.role && (
                    <div className="mt-1 text-sm font-semibold" style={{ color: colors.tealMid }}>
                      {parts.role}
                    </div>
                  )}
                  {paragraph && (
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: colors.blueMid }}>
                      {paragraph.body}
                    </p>
                  )}
                </div>
              )
            })}

            {/* CTA foro — debajo de los perfiles, navega a la preview embebida (#foro) */}
            <button
              type="button"
              onClick={() => navigate({ pathname: '/', hash: '#foro' })}
              className={`group mt-[4vh] inline-flex items-baseline gap-3 self-start text-left text-base font-semibold leading-snug transition-all duration-1000 delay-700 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{ color: colors.blueDark }}
            >
              <span className="underline-offset-4 group-hover:underline">{foroCtaText.replace(/\s*→\s*$/, '')}</span>
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" style={{ color: colors.tealMid }}>
                →
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Matriz de servicios — cierra la experiencia del hero. Los logos vienen
          de "info_primary" (rol icon), apareados por orden con SERVICE_LINKS. */}
      <AboutHeroServicesMatrix iconUrls={serviceIcons.map((m) => m.url)} />
    </section>
  )
}
