import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Section } from '../../models'
import { textByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'
import { colors, layout } from '../../../../theme'

interface Props { section: Section }

// ── Estimador de presupuesto (deshabilitado temporalmente) ──
// const PRICE_TIERS = [
//   { max: 10, rate: 15000 },
//   { max: 50, rate: 45000 },
//   { max: 200, rate: 88000 },
//   { max: Infinity, rate: 95000 },
// ]
//
// function calcBudget(employees: number): number {
//   const tier = PRICE_TIERS.find((t) => employees <= t.max)!
//   return employees * tier.rate
// }
//
// function formatARS(n: number): string {
//   return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
// }

export default function ContactFormSection({ section }: Props) {
  const info = textByRole(section.texts, 'info')

  // Los labels del formulario son fijos — el form se envía al backend directamente

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', employees: 25, message: '' })
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true) }

  const inputClasses =
    `w-full rounded-lg border bg-white px-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors`

  const inputStyle = {
    borderColor: colors.tealBright,
    color: colors.blueDark,
  }
  const inputFocusColor = colors.tealMid

  return (
    <section ref={ref} className={layout.sectionPadY} style={{ backgroundColor: colors.contactBg }}>
      <div className={layout.container}>


            {/* ── Estimador de presupuesto (deshabilitado temporalmente) ──
            <div
              className={`rounded-2xl border bg-white p-6 shadow-sm transition-all duration-1000 delay-300 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ borderColor: colors.tealBright }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${colors.tealBright}20`, color: colors.tealMid }}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold" style={{ color: colors.blueDark }}>
                  Estimador de presupuesto
                </h3>
              </div>

              <label className="mb-2 block text-sm" style={{ color: colors.blueMid }}>
                Número de personas en la empresa
              </label>
              <input
                type="range" min={1} max={500} value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="mb-2 w-full cursor-pointer"
                style={{ accentColor: colors.tealMid }}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium" style={{ color: colors.blueDark }}>
                  <span className="mr-1.5 inline-flex items-center">
                    <svg className="mr-1 h-4 w-4" style={{ color: colors.tealBright }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    {employees} empleados
                  </span>
                </span>
                <span className="text-xs" style={{ color: colors.blueMid }}>1 – 500</span>
              </div>

              <div className="group mt-[3vh] rounded-xl p-5 text-center transition-all duration-300"
                style={{ backgroundColor: `${colors.tealBright}10`, boxShadow: `inset 0 0 0 1px ${colors.tealBright}` }}
              >
                <p className="text-xs uppercase tracking-wider" style={{ color: colors.blueMid }}>
                  Presupuesto estimativo de la entrevista inicial
                </p>
                <p className="mt-1 text-2xl font-bold transition-transform duration-300 group-hover:scale-105 sm:text-3xl" style={{ color: colors.tealMid }}>
                  {formatARS(budget)}
                </p>
                <p className="mt-1 flex items-center justify-center gap-1 text-xs" style={{ color: colors.blueMid }}>
                  <svg className="h-3.5 w-3.5" style={{ color: colors.tealBright }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatARS(PRICE_TIERS.find((t) => employees <= t.max)!.rate)} por empleado
                </p>
              </div>
            </div>
            ── Fin estimador de presupuesto ── */}

          {/* Centered form */}
          <div
            className={`mx-auto max-w-3xl rounded-2xl border bg-white p-5 sm:p-6 md:p-8 shadow-sm transition-all duration-1000 delay-200 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ borderColor: colors.tealBright }}
          >
            {submitted ? (
              <div className="py-[6vh] text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.tealBright}20` }}>
                  <svg className="h-8 w-8" style={{ color: colors.tealMid }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold" style={{ color: colors.blueDark }}>¡Mensaje enviado!</h3>
                <p className="mt-2 text-sm" style={{ color: colors.blueMid }}>Nos pondremos en contacto pronto.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-lg font-semibold" style={{ color: colors.blueDark }}>Dejanos tu consulta</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Nombre</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputClasses} style={inputStyle} placeholder="Juan Pérez"
                      onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Email</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputClasses} style={inputStyle} placeholder="juan@empresa.com"
                      onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Localidad</label>
                    <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className={inputClasses} style={inputStyle} placeholder="San Basilio, Córdoba"
                      onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Teléfono</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={inputClasses} style={inputStyle} placeholder="+54 11 1234-5678"
                      onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>
                    Cantidad estimada de personas a intervenir:{' '}
                    <span className="font-semibold" style={{ color: colors.tealMid }}>{form.employees}</span>
                  </label>
                  <input
                    type="range" min={1} max={500} value={form.employees}
                    onChange={(e) => setForm({ ...form, employees: Number(e.target.value) })}
                    className="w-full cursor-pointer"
                    style={{ accentColor: colors.tealMid }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Mensaje</label>
                  <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={inputClasses} style={inputStyle} placeholder="Contanos sobre tu necesidad..."
                    onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                  />
                </div>

                {/* Privacidad */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 accent-teal-600"
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

                <button type="submit"
                  className="w-full rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: colors.tealMid, boxShadow: `0 4px 14px ${colors.ctaShadow}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.tealBright }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.tealMid }}
                >
                  Enviar consulta
                </button>
              </form>
            )}
          </div>

        {/* Info text */}
        {info && (
          <div
            className={`mt-[6vh] rounded-2xl border bg-white p-6 text-center transition-all duration-1000 delay-500 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
            style={{ borderColor: colors.tealBright }}
          >
            <div className="mx-auto flex max-w-2xl items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: colors.tealBright }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <p className="text-sm leading-relaxed" style={{ color: colors.blueMid }}>{info.body}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
