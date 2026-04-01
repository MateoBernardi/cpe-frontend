import type { Section } from '../../models'
import { textByRole, textsByRole, mediaByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'
import { colors, layout } from '../../../../theme'

interface Props { section: Section }

export default function InfoPrimarySection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const bullets = textsByRole(section.texts, 'bullet')
  const diagram = mediaByRole(section.media, 'diagram')
  const icons = section.media.filter((m) => m.role === 'icon').sort((a, b) => a.order - b.order)
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  return (
    <section ref={ref} className={layout.sectionPadY} style={{ backgroundColor: colors.infoPrimaryBg, color: colors.infoPrimaryText }}>
      <div className={layout.container}>
        <div className="grid gap-[5vh] lg:grid-cols-2 lg:items-center">
          {diagram && (
            <div className={`flex justify-center transition-all duration-1000 ${isInView ? 'translate-x-0 opacity-100' : '-translate-x-16 opacity-0'}`}>
              <div className="group relative">
                <img src={diagram.url} alt="" className="w-full max-w-lg rounded-2xl shadow-lg" />
              </div>
            </div>
          )}
          <div className={`space-y-[3vh] transition-all duration-1000 delay-200 ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {heading && <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl font-primary">{heading.body}</h2>}
            {bullets.length > 0 && (
              <ul className="space-y-[2vh] pt-2">
                {bullets.map((b, i) => (
                  <li key={i} className={`flex items-start gap-3 transition-all duration-700 ${isInView ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                    style={{ transitionDelay: `${400 + i * 100}ms` }}>
                    {icons[i]
                      ? <img src={icons[i].url} alt="" className="mt-0.5 h-5 w-5 flex-shrink-0 brightness-0 invert" />
                      : <span className="mt-1.5 flex h-2.5 w-2.5 flex-shrink-0 rounded-full shadow-sm" style={{ backgroundColor: colors.tealBright }} />
                    }
                    <span className="text-white/90">{b.body}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
