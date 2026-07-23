import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Section } from '../../models'
import { textByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'
import { colors, layout } from '../../../../theme'

interface Props { section: Section }

const NEXT_STEPS = [
  'Recibimos y revisamos tu solicitud.',
  'Coordinamos una reunión virtual sin costo.',
  'Conocemos tus necesidades y te acercamos una propuesta.',
]

const EMPTY_FORM = { name: '', email: '', company: '', address: '', phone: '', employees: 25, message: '' }

export default function ContactFormSection({ section }: Props) {
  const info = textByRole(section.texts, 'info')

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  const [form, setForm] = useState(EMPTY_FORM)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true) }
  const handleReset = () => { setForm(EMPTY_FORM); setPrivacyAccepted(false); setSubmitted(false) }

  const inputClasses =
    'w-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:outline-none'

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = colors.tealMid
    e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.tealMid}1a`
  }
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = ''
    e.currentTarget.style.boxShadow = 'none'
  }

  const labelClasses = 'mb-1.5 block text-sm font-semibold'

  return (
    <section ref={ref} className={layout.sectionPadY} style={{ backgroundColor: colors.contactBg }}>
      <div className={layout.container}>
        <div className="mx-auto max-w-6xl">
          <div
            className={`overflow-hidden shadow-sm transition-all duration-1000 delay-200 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] lg:min-h-[640px]">

              {/* Left: dark brand panel */}
              <div
                className="flex flex-col px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14"
                style={{ backgroundColor: colors.blueDark }}
              >
                <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: colors.tealBright }}>
                  Solicitar presupuesto
                </p>

                <h3 className="mt-4 font-secondary text-3xl font-medium leading-tight sm:text-4xl" style={{ color: colors.white }}>
                  Solicitá tu presupuesto<span style={{ color: colors.tealBright }}>.</span>
                </h3>

                <p className="mt-4 max-w-[340px] text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {info?.body || 'Completá el formulario y nos pondremos en contacto a la brevedad.'}
                </p>

                <div className="mt-10 border-t pt-8" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                  <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: colors.tealBright }}>
                    Qué sucede después
                  </p>
                  <ol className="mt-5 space-y-4">
                    {NEXT_STEPS.map((step, i) => (
                      <li key={i} className="flex gap-4">
                        <span className="font-secondary text-lg leading-none" style={{ color: colors.tealBright }}>
                          {i + 1}
                        </span>
                        <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <p className="mt-auto pt-10 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Reunión virtual{' '}
                  <strong className="font-semibold" style={{ color: colors.white }}>sin costo</strong>{' '}
                  para conocer mejor tus necesidades.
                </p>
              </div>

              {/* Right: form panel */}
              <div className="px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14" style={{ backgroundColor: colors.offWhite }}>
                {submitted ? (
                  <div className="flex h-full flex-col items-center justify-center py-[6vh] text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.tealBright}20` }}>
                      <svg className="h-8 w-8" style={{ color: colors.tealMid }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-secondary text-2xl font-medium" style={{ color: colors.blueDark }}>¡Solicitud enviada!</h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: colors.blueMid }}>
                      Gracias por escribirnos. Nos pondremos en contacto a la brevedad para coordinar los próximos pasos.
                    </p>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="mt-6 border px-6 py-2.5 text-sm font-semibold transition-colors"
                      style={{ borderColor: colors.blueDark, color: colors.blueDark }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${colors.blueDark}0d` }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      Enviar otra solicitud
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Name */}
                      <div>
                        <label className={labelClasses} style={{ color: colors.blueDark }}>
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className={inputClasses} placeholder="Juan Pérez"
                          onFocus={handleFocus} onBlur={handleBlur}
                        />
                      </div>
                      {/* Email */}
                      <div>
                        <label className={labelClasses} style={{ color: colors.blueDark }}>
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className={inputClasses} placeholder="juan@empresa.com"
                          onFocus={handleFocus} onBlur={handleBlur}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Location */}
                      <div>
                        <label className={labelClasses} style={{ color: colors.blueDark }}>Localidad</label>
                        <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                          className={inputClasses} placeholder="San Basilio, Córdoba"
                          onFocus={handleFocus} onBlur={handleBlur}
                        />
                      </div>
                      {/* Address */}
                      <div>
                        <label className={labelClasses} style={{ color: colors.blueDark }}>Dirección</label>
                        <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                          className={inputClasses} placeholder="Av. Siempre Viva 742"
                          onFocus={handleFocus} onBlur={handleBlur}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Phone */}
                      <div>
                        <label className={labelClasses} style={{ color: colors.blueDark }}>Teléfono</label>
                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className={inputClasses} placeholder="+54 11 1234-5678"
                          onFocus={handleFocus} onBlur={handleBlur}
                        />
                      </div>
                      {/* Employees */}
                      <div>
                        <label className={labelClasses} style={{ color: colors.blueDark }}>
                          Cantidad de personas: <span className="font-semibold" style={{ color: colors.tealMid }}>{form.employees}</span>
                        </label>
                        <input
                          type="range" min={1} max={500} value={form.employees}
                          onChange={(e) => setForm({ ...form, employees: Number(e.target.value) })}
                          className="mt-3 w-full cursor-pointer"
                          style={{ accentColor: colors.tealMid }}
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className={labelClasses} style={{ color: colors.blueDark }}>
                        Mensaje <span className="text-red-500">*</span>
                      </label>
                      <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className={inputClasses} placeholder="Contanos sobre tu necesidad..."
                        onFocus={handleFocus} onBlur={handleBlur}
                      />
                    </div>

                    {/* Privacy */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 border-gray-300 accent-teal-600"
                        required
                      />
                      <span className="text-xs leading-relaxed" style={{ color: colors.blueMid }}>
                        He leído y acepto la{' '}
                        <Link to="/politica-de-privacidad" className="font-medium underline" style={{ color: colors.tealMid }} target="_blank">
                          Política de Privacidad
                        </Link>
                        , y consiento el tratamiento de mis datos personales para los fines indicados.
                      </span>
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button type="submit"
                        className="order-2 px-6 py-3 text-sm font-semibold text-white transition-colors sm:order-1 sm:w-auto"
                        style={{ backgroundColor: colors.blueDark }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.tealMid }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.blueDark }}
                      >
                        Enviar solicitud →
                      </button>
                      <p className="order-1 text-xs sm:order-2" style={{ color: colors.blueMid }}>
                        Los campos con * son obligatorios.
                      </p>
                    </div>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
