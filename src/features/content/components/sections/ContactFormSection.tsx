import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Section } from '../../models'
import { textByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'
import { colors, layout } from '../../../../theme'

interface Props { section: Section }

export default function ContactFormSection({ section }: Props) {
  const info = textByRole(section.texts, 'info')

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  const [form, setForm] = useState({ name: '', email: '', company: '', address: '', phone: '', employees: 25, message: '' })
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

        {/* Info text — above form */}
        {info && (
          <div
            className={`mx-auto max-w-3xl mb-[4vh] rounded-2xl border bg-white p-6 text-center transition-all duration-1000 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
            style={{ borderColor: colors.tealBright }}
          >
            <p className="text-sm leading-relaxed" style={{ color: colors.blueMid }}>{info.body}</p>
          </div>
        )}

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
              <h3 className="text-lg font-semibold" style={{ color: colors.blueDark }}>Solicitá tu presupuesto</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Nombre</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClasses} style={inputStyle} placeholder="Juan Pérez"
                    onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                  />
                </div>
                {/* Email */}
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
                {/* Location */}
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Localidad</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className={inputClasses} style={inputStyle} placeholder="San Basilio, Córdoba"
                    onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                  />
                </div>
                {/* Address */}
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Dirección</label>
                  <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className={inputClasses} style={inputStyle} placeholder="Av. Siempre Viva 742"
                    onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Phone */}
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Teléfono</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputClasses} style={inputStyle} placeholder="+54 11 1234-5678"
                    onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                  />
                </div>
                {/* Employees */}
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>
                    Cantidad de personas: <span className="font-semibold" style={{ color: colors.tealMid }}>{form.employees}</span>
                  </label>
                  <input
                    type="range" min={1} max={500} value={form.employees}
                    onChange={(e) => setForm({ ...form, employees: Number(e.target.value) })}
                    className="w-full cursor-pointer mt-2"
                    style={{ accentColor: colors.tealMid }}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Mensaje</label>
                <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={inputClasses} style={inputStyle} placeholder="Contanos sobre tu necesidad..."
                  onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                />
              </div>

              {/* Privacy */}
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
      </div>
    </section>
  )
}
