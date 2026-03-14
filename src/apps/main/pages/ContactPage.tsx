import { useEffect } from 'react'
import { useContactFormViewModel } from '@features/contact/viewmodels/useContactFormViewModel'
import { useSectionViewModel } from '@features/content/viewmodels'
import { Link } from 'react-router-dom'
import { colors } from '../../../theme'

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

  return (
    <div className="min-h-screen pt-[15vh]" style={{ backgroundColor: colors.lightGray }}>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold" style={{ color: colors.blueDark }}>
          Solicitá tu presupuesto
        </h1>
        <p className="mb-8 text-gray-600">
          Completá el formulario y nos pondremos en contacto a la brevedad.
        </p>

        {infoText && (
          <div
            className="mb-6 rounded-2xl border bg-white p-6 text-center"
            style={{ borderColor: colors.tealBright }}
          >
            <p className="text-sm leading-relaxed" style={{ color: colors.blueMid }}>
              {infoText.body}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">
              ¡Mensaje enviado con éxito! Nos comunicaremos pronto.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-2 text-xs font-medium text-green-700 underline"
            >
              Enviar otro mensaje
            </button>
          </div>
        )}

        {!success && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void handleSubmit()
            }}
            className="space-y-5 rounded-xl bg-white p-6 shadow-md sm:p-8"
          >
            {/* Nombre */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                required
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: colors.inputBorder, color: colors.blueDark }}
                onFocus={(e) => (e.target.style.borderColor = colors.inputFocus)}
                onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                placeholder="Juan Pérez"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                required
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: colors.inputBorder, color: colors.blueDark }}
                onFocus={(e) => (e.target.style.borderColor = colors.inputFocus)}
                onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                placeholder="juan@ejemplo.com"
              />
            </div>

            {/* Localidad */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Localidad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.town}
                onChange={(e) => setField('town', e.target.value)}
                required
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: colors.inputBorder, color: colors.blueDark }}
                onFocus={(e) => (e.target.style.borderColor = colors.inputFocus)}
                onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                placeholder="San Isidro"
              />
            </div>

            {/* Dirección */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Dirección <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                required
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: colors.inputBorder, color: colors.blueDark }}
                onFocus={(e) => (e.target.style.borderColor = colors.inputFocus)}
                onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                placeholder="Av. Siempre Viva 742"
              />
            </div>

            {/* Teléfono (opcional) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                value={form.phone_number ?? ''}
                onChange={(e) => setField('phone_number', e.target.value)}
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: colors.inputBorder, color: colors.blueDark }}
                onFocus={(e) => (e.target.style.borderColor = colors.inputFocus)}
                onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                placeholder="+54 11 5555-1234"
              />
            </div>

            {/* Cantidad de personas */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Cantidad de personas <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.number_of_people}
                onChange={(e) => setField('number_of_people', Number(e.target.value))}
                required
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: colors.inputBorder, color: colors.blueDark }}
                onFocus={(e) => (e.target.style.borderColor = colors.inputFocus)}
                onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
              />
            </div>

            {/* Mensaje (opcional) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Mensaje</label>
              <textarea
                value={form.message ?? ''}
                onChange={(e) => setField('message', e.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: colors.inputBorder, color: colors.blueDark }}
                onFocus={(e) => (e.target.style.borderColor = colors.inputFocus)}
                onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                placeholder="Contanos tu consulta…"
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
              <span className="text-xs leading-relaxed text-gray-600">
                He leído y acepto la{' '}
                <Link to="/politica-de-privacidad" className="font-medium underline" style={{ color: colors.ctaPrimary }} target="_blank">
                  Política de Privacidad
                </Link>
                , y consiento el tratamiento de mis datos personales para los fines indicados.
              </span>
            </label>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg px-6 py-3 text-sm font-semibold text-white shadow transition-colors disabled:opacity-60"
              style={{ backgroundColor: colors.ctaPrimary }}
              onMouseEnter={(e) =>
                !isSubmitting && (e.currentTarget.style.backgroundColor = colors.ctaPrimaryHover)
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.ctaPrimary)}
            >
              {isSubmitting ? 'Enviando…' : 'Enviar mensaje'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
