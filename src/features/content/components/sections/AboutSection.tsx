import type { Section } from '../../models'
import { textByRole, textsByRole, mediasByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'
import { colors, layout } from '../../../../theme'

interface Props { section: Section }

export default function AboutSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const bios = textsByRole(section.texts, 'bio')
  const photos = mediasByRole(section.media, 'photo')
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 })
  const text0 = paragraphs[0]; const text1 = paragraphs[1]
  const bio0 = bios[0]; const bio1 = bios[1]
  const photo0 = photos[0]; const photo1 = photos[1]

  return (
    <section ref={ref} className="flex min-h-screen items-center pt-[8vh] sm:pt-[10vh] md:pt-[12vh] pb-[6vh] sm:pb-[8vh] md:pb-[10vh]" style={{ backgroundColor: colors.aboutBg }}>
      <div className={layout.container}>
        {heading && (
          <h2 className={`mb-[2vh] sm:mb-[3vh] md:mb-[4vh] text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl transition-all duration-700 font-primary ${
            isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`} style={{ color: colors.blueDark }}>{heading.body}</h2>
        )}
        {/* Mobile & Tablet: horizontal cards (< lg) */}
        <div className="flex flex-col gap-[3vh] sm:gap-[4vh] lg:hidden">
          <div className={`flex flex-row items-center gap-4 sm:gap-6 transition-all duration-1000 delay-200 ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            {photo0 && (
              <div className="group relative w-32 flex-shrink-0 sm:w-44 md:w-52">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200">
                  <img src={photo0.url} alt="" className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                </div>
              </div>
            )}
            <div className="min-w-0 flex-1">
              {bio0 && <h3 className="mb-2 text-base font-semibold sm:text-lg" style={{ color: colors.blueDark }}>{bio0.body}</h3>}
              {text0 && (
                <div className="rounded-xl border p-3 shadow-sm sm:p-4"
                  style={{
                    backgroundColor: colors.offWhite,
                    borderColor: colors.lightGray,
                  }}>
                  <p className="text-xs font-medium leading-relaxed sm:text-sm" style={{ color: colors.blueDark }}>{text0.body}</p>
                </div>
              )}
            </div>
          </div>
          <div className={`flex flex-row-reverse items-center gap-4 sm:gap-6 transition-all duration-1000 delay-400 ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            {photo1 && (
              <div className="group relative w-32 flex-shrink-0 sm:w-44 md:w-52">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200">
                  <img src={photo1.url} alt="" className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                </div>
              </div>
            )}
            <div className="min-w-0 flex-1">
              {bio1 && <h3 className="mb-2 text-base font-semibold sm:text-lg" style={{ color: colors.blueDark }}>{bio1.body}</h3>}
              {text1 && (
                <div className="rounded-xl border p-3 shadow-sm sm:p-4"
                  style={{
                    backgroundColor: colors.offWhite,
                    borderColor: colors.lightGray,
                  }}>
                  <p className="text-xs font-medium leading-relaxed sm:text-sm" style={{ color: colors.blueDark }}>{text1.body}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Desktop: 4-column × 2-row grid so both paragraphs align (lg+) */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-x-[3vw] xl:gap-x-[4vw] lg:gap-y-3">
          {/* Bio 0 – bottom of row 1 */}
          <div className={`self-end transition-all duration-1000 delay-200 ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
            style={{ gridColumn: '1', gridRow: '1' }}>
            {bio0 && <h3 className="mb-3 text-lg font-semibold xl:text-xl" style={{ color: colors.blueDark }}>{bio0.body}</h3>}
          </div>
          {/* Photo 0 – spans both rows */}
          <div className={`self-center transition-all duration-1000 delay-300 ${isInView ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}
            style={{ gridColumn: '2', gridRow: '1 / 3' }}>
            {photo0 && (
              <div className="group relative">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200">
                  <img src={photo0.url} alt="" className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                </div>
              </div>
            )}
          </div>
          {/* Bio 1 – bottom of row 1 */}
          <div className={`self-end transition-all duration-1000 delay-500 ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
            style={{ gridColumn: '3', gridRow: '1' }}>
            {bio1 && <h3 className="mb-3 text-lg font-semibold xl:text-xl" style={{ color: colors.blueDark }}>{bio1.body}</h3>}
          </div>
          {/* Photo 1 – spans both rows */}
          <div className={`self-center transition-all duration-1000 delay-300 ${isInView ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}
            style={{ gridColumn: '4', gridRow: '1 / 3' }}>
            {photo1 && (
              <div className="group relative">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200">
                  <img src={photo1.url} alt="" className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                </div>
              </div>
            )}
          </div>
          {/* Paragraph 0 – top of row 2 */}
          <div className={`self-start transition-all duration-1000 delay-200 ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
            style={{ gridColumn: '1', gridRow: '2' }}>
            {text0 && (
              <div className="rounded-xl border p-5 shadow-sm xl:p-6"
                style={{
                  backgroundColor: colors.offWhite,
                  borderColor: colors.lightGray,
                }}>
                <p className="text-sm font-medium leading-relaxed xl:text-base" style={{ color: colors.blueDark }}>{text0.body}</p>
              </div>
            )}
          </div>
          {/* Paragraph 1 – top of row 2 */}
          <div className={`self-start transition-all duration-1000 delay-500 ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
            style={{ gridColumn: '3', gridRow: '2' }}>
            {text1 && (
              <div className="rounded-xl border p-5 shadow-sm xl:p-6"
                style={{
                  backgroundColor: colors.offWhite,
                  borderColor: colors.lightGray,
                }}>
                <p className="text-sm font-medium leading-relaxed xl:text-base" style={{ color: colors.blueDark }}>{text1.body}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
