import { useEffect } from 'react'
import { useContactFormViewModel } from '@features/contact/viewmodels/useContactFormViewModel'
import { useSectionViewModel } from '@features/content/viewmodels'
import { Link } from 'react-router-dom'
import { colors } from '../../../theme'

const NEXT_STEPS = [
  'Recibimos y revisamos tu solicitud.',
  'Coordinamos una reunión virtual sin costo.',
  'Conocemos tus necesidades y te acercamos una propuesta.',
]

/**
 * Página de Contacto — Formulario de contacto público.
 */
export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const { form, setField, handleSubmit, isSubmitting, error, success, setSuccess, privacyAccepted, setPrivacyAccepted } =
    useContactFormViewModel()
  const { section } = useSectionViewModel('contact_form')
  const infoText = section?.texts.find((t) => t.role === 'info')

  const inputClasses = 'w-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors outline-none'

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
    <div className="min-h-screen pt-[15vh]" style={{ backgroundColor: colors.lightGray }}>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] lg:min-h-[640px]">

            {/* Left: dark brand panel */}
            <div
              className="flex flex-col px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14"
              style={{ backgroundColor: colors.blueDark }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: colors.tealBright }}>
                Solicitar presupuesto
              </p>

              <h1 className="mt-4 font-secondary text-3xl font-medium leading-tight sm:text-4xl" style={{ color: colors.white }}>
                Solicitá tu presupuesto<span style={{ color: colors.tealBright }}>.</span>
              </h1>

              <p className="mt-4 max-w-[340px] text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {infoText?.body || 'Completá el formulario y nos pondremos en contacto a la brevedad.'}
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
              {success ? (
                <div className="flex h-full flex-col items-center justify-center py-[6vh] text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.tealBright}20` }}>
                    <svg className="h-8 w-8" style={{ color: colors.tealMid }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-secondary text-2xl font-medium" style={{ color: colors.blueDark }}>¡Mensaje enviado!</h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: colors.blueMid }}>
                    ¡Mensaje enviado con éxito! Nos comunicaremos pronto.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="mt-6 border px-6 py-2.5 text-sm font-semibold transition-colors"
                    style={{ borderColor: colors.blueDark, color: colors.blueDark }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${colors.blueDark}0d` }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form
                  id="contact-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    void handleSubmit()
                  }}
                  className="space-y-5"
                >
                  {/* Nombre */}
                  <div>
                    <label className={labelClasses} style={{ color: colors.blueDark }}>
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      required
                      className={inputClasses}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder="Juan Pérez"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className={labelClasses} style={{ color: colors.blueDark }}>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      required
                      className={inputClasses}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder="juan@ejemplo.com"
                    />
                  </div>

                  {/* Localidad */}
                  <div>
                    <label className={labelClasses} style={{ color: colors.blueDark }}>
                      Localidad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.town}
                      onChange={(e) => setField('town', e.target.value)}
                      required
                      className={inputClasses}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder="San Isidro"
                    />
                  </div>

                  {/* Dirección */}
                  <div>
                    <label className={labelClasses} style={{ color: colors.blueDark }}>
                      Dirección <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setField('address', e.target.value)}
                      required
                      className={inputClasses}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder="Av. Siempre Viva 742"
                    />
                  </div>

                  {/* Teléfono (opcional) */}
                  <div>
                    <label className={labelClasses} style={{ color: colors.blueDark }}>Teléfono</label>
                    <input
                      type="tel"
                      value={form.phone_number ?? ''}
                      onChange={(e) => setField('phone_number', e.target.value)}
                      className={inputClasses}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder="+54 11 5555-1234"
                    />
                  </div>

                  {/* Cantidad de personas */}
                  <div>
                    <label className={labelClasses} style={{ color: colors.blueDark }}>
                      Cantidad de personas <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.number_of_people}
                      onChange={(e) => setField('number_of_people', Number(e.target.value))}
                      required
                      className={inputClasses}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </div>

                  {/* Mensaje (opcional) */}
                  <div>
                    <label className={labelClasses} style={{ color: colors.blueDark }}>Mensaje</label>
                    <textarea
                      value={form.message ?? ''}
                      onChange={(e) => setField('message', e.target.value)}
                      rows={4}
                      className={`${inputClasses} resize-none`}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder="Contanos tu consulta…"
                    />
                  </div>

                  {/* Privacidad */}
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

                  {error && (
                    <div className="border border-red-200 bg-red-50 p-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                    style={{ backgroundColor: colors.blueDark }}
                    onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = colors.tealMid)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.blueDark)}
                  >
                    {isSubmitting ? 'Enviando…' : 'Enviar solicitud →'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
