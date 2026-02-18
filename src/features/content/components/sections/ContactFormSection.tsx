import { useState, useMemo } from 'react'
import type { Section } from '../../models'
import { textByRole, textsByRole, mediaByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'

interface Props { section: Section }

/** Tiers de precio según cantidad de empleados */
const PRICE_TIERS = [
  { max: 10, rate: 8500 },
  { max: 50, rate: 6500 },
  { max: 200, rate: 4800 },
  { max: Infinity, rate: 3500 },
]

function calcBudget(employees: number): number {
  const tier = PRICE_TIERS.find((t) => employees <= t.max)!
  return employees * tier.rate
}

function formatARS(n: number): string {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

/**
 * Formulario de contacto + estimador de presupuesto.
 * Roles: heading, paragraph, cta | background
 */
export default function ContactFormSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const cta = textByRole(section.texts, 'cta')
  const bg = mediaByRole(section.media, 'background')

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  })
  const [employees, setEmployees] = useState(25)
  const [submitted, setSubmitted] = useState(false)

  const budget = useMemo(() => calcBudget(employees), [employees])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: integrar con endpoint de contacto
    setSubmitted(true)
  }

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-24 text-white"
    >
      {bg && (
        <img
          src={bg.mediaUrl}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-5"
        />
      )}

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
          {/* ── Columna izquierda: texto + estimador ── */}
          <div
            className={`space-y-8 transition-all duration-1000 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            {heading && (
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {heading.body}
              </h2>
            )}
            {paragraphs.map((p, i) => (
              <p key={i} className="leading-relaxed text-slate-300">{p.body}</p>
            ))}
            {cta && (
              <p className="text-lg font-semibold text-teal-400">{cta.body}</p>
            )}

            {/* ── Estimador de presupuesto ── */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Estimador de presupuesto
              </h3>
              <label className="mb-2 block text-sm text-slate-400">
                Número de personas en la empresa
              </label>
              <input
                type="range"
                min={1}
                max={500}
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="mb-2 w-full cursor-pointer accent-teal-500"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-white">{employees} empleados</span>
                <span className="text-xs text-slate-500">1 – 500</span>
              </div>

              <div className="mt-6 rounded-xl bg-teal-600/10 p-5 text-center">
                <p className="text-xs uppercase tracking-wider text-teal-400/70">
                  Presupuesto estimativo mensual
                </p>
                <p className="mt-1 text-3xl font-bold text-teal-400">
                  {formatARS(budget)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatARS(PRICE_TIERS.find((t) => employees <= t.max)!.rate)} por empleado
                </p>
              </div>
            </div>
          </div>

          {/* ── Columna derecha: formulario ── */}
          <div
            className={`rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-1000 delay-200 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/20">
                  <svg className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">¡Mensaje enviado!</h3>
                <p className="mt-2 text-sm text-slate-400">Nos pondremos en contacto pronto.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-lg font-semibold text-white">Dejanos tu consulta</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">Nombre</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="juan@empresa.com"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">Empresa</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="Acme S.A."
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">Teléfono</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="+54 11 1234-5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    N.º de empleados: <span className="font-semibold text-teal-400">{employees}</span>
                  </label>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-400">Mensaje</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="Contanos sobre tu necesidad..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition-all hover:bg-teal-500 hover:shadow-teal-500/30"
                >
                  Enviar consulta
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
