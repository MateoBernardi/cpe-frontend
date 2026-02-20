import { useState, useRef } from 'react'
import type { Section } from '../../models'
import { textByRole, textsByRole, mediaByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'

interface Props { section: Section }

/**
 * Sección "Selección de Personal" — detalle del servicio + formulario de CV.
 * Roles: heading, subtitle (objetivo), paragraph, bullet, label_* (preguntas editables) | photo
 */
export default function RecruitmentFormSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const subtitle = textByRole(section.texts, 'subtitle')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const bullets = textsByRole(section.texts, 'bullet')
  const photo = mediaByRole(section.media, 'photo')

  // Editable form questions
  const qArea = textByRole(section.texts, 'label_area')
  const qExperience = textByRole(section.texts, 'label_experience')
  const qModality = textByRole(section.texts, 'label_modality')
  const qAvailability = textByRole(section.texts, 'label_availability')

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    area: '',
    experience: '',
    modality: '',
    availability: '',
    message: '',
  })
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) setCvFile(file)
  }

  const inputClasses =
    'w-full rounded-lg border border-teal-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors'

  return (
    <section ref={ref}>
      {/* ── Top: service detail ── */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            {/* Left text (floating card) */}
            <div
              className={`rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-lg ring-1 ring-slate-200/60 space-y-6 transition-all duration-1000 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              {heading && (
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {heading.body}
                </h2>
              )}

              {subtitle && (
                <div className="rounded-xl border border-teal-200 bg-teal-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
                    Objetivo
                  </p>
                  <p className="mt-2 leading-relaxed text-slate-700">{subtitle.body}</p>
                </div>
              )}

              {paragraphs.map((p, i) => (
                <p key={i} className="leading-relaxed text-slate-600">{p.body}</p>
              ))}

              {bullets.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Ejes de trabajo
                  </p>
                  <ul className="space-y-2">
                    {bullets.map((b, i) => (
                      <li
                        key={i}
                        className={`flex items-start gap-3 transition-all duration-500 ${
                          isInView ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                        }`}
                        style={{ transitionDelay: `${400 + i * 80}ms` }}
                      >
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
                        <span className="text-slate-600">{b.body}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right floating image */}
            {photo && (
              <div
                className={`transition-all duration-1000 delay-300 ${
                  isInView ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
                }`}
              >
                <div className="group relative">
                  <div className="absolute -inset-4 rounded-3xl bg-teal-100/50" />
                  <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200">
                    <img
                      src={photo.mediaUrl}
                      alt=""
                      className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom: CV form ── */}
      <div className="bg-teal-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            {/* Left: form */}
            <div
              className={`rounded-2xl border border-teal-200 bg-white p-8 shadow-sm transition-all duration-1000 delay-200 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                    <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">¡Postulación recibida!</h3>
                  <p className="mt-2 text-sm text-slate-500">Gracias por tu interés. Nos pondremos en contacto pronto.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-lg font-semibold text-slate-900">Dejanos tu postulación</h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-600">Nombre completo</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={inputClasses}
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-600">Email</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputClasses}
                        placeholder="juan@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-600">Teléfono</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={inputClasses}
                      placeholder="+54 11 1234-5678"
                    />
                  </div>

                  {/* Editable questions */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-600">
                      {qArea?.body ?? '¿En qué área te gustaría trabajar?'}
                    </label>
                    <input
                      type="text"
                      value={form.area}
                      onChange={(e) => setForm({ ...form, area: e.target.value })}
                      className={inputClasses}
                      placeholder="Ej: Administración, RRHH, IT..."
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-600">
                      {qExperience?.body ?? '¿Cuántos años de experiencia tenés?'}
                    </label>
                    <input
                      type="text"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                      className={inputClasses}
                      placeholder="Ej: 3 años"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-600">
                      {qModality?.body ?? '¿Qué modalidad de trabajo preferís?'}
                    </label>
                    <select
                      value={form.modality}
                      onChange={(e) => setForm({ ...form, modality: e.target.value })}
                      className={inputClasses}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="presencial">Presencial</option>
                      <option value="remoto">Remoto</option>
                      <option value="hibrido">Híbrido</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-600">
                      {qAvailability?.body ?? '¿Cuándo podrías incorporarte?'}
                    </label>
                    <input
                      type="text"
                      value={form.availability}
                      onChange={(e) => setForm({ ...form, availability: e.target.value })}
                      className={inputClasses}
                      placeholder="Ej: Inmediata, en 15 días..."
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-600">Mensaje adicional</label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={inputClasses}
                      placeholder="Contanos algo más sobre vos..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition-all hover:-translate-y-0.5 hover:bg-teal-500"
                  >
                    Enviar postulación
                  </button>
                </form>
              )}
            </div>

            {/* Right: CV upload zone */}
            <div
              className={`transition-all duration-1000 delay-400 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Adjuntá tu CV</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Arrastrá el archivo o hacé clic para seleccionarlo.
                  </p>
                </div>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="cv-upload-zone group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-teal-300 bg-white p-12 transition-all hover:border-teal-500 hover:bg-teal-50/50"
                >
                  {/* Animated ring */}
                  <div className="cv-pulse-ring absolute inset-0 rounded-2xl" />

                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 transition-transform group-hover:scale-110">
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>

                  {cvFile ? (
                    <div className="text-center">
                      <p className="font-medium text-teal-700">{cvFile.name}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {(cvFile.size / 1024).toFixed(0)} KB — Clic para cambiar
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="font-medium text-slate-600">
                        Subí tu CV
                      </p>
                      <p className="mt-1 text-xs text-slate-400">PDF, DOC o DOCX (máx. 5 MB)</p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setCvFile(file)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
