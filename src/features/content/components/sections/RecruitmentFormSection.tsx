import { useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Section } from '../../models'
import { textByRole, textsByRole, mediaByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'
import { colors, layout } from '../../../../theme'
import { useCandidateFormViewModel } from '@features/contact/viewmodels/useCandidateFormViewModel'

interface Props { section: Section }

export default function RecruitmentFormSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const subtitle = textByRole(section.texts, 'subtitle')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const bullets = textsByRole(section.texts, 'bullet')
  const formHeading = textByRole(section.texts, 'form_heading')
  const formParagraph = textByRole(section.texts, 'form_paragraph')
  const photo = mediaByRole(section.media, 'photo')

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  const vm = useCandidateFormViewModel()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) vm.selectFile(file)
  }

  const inputClasses = 'w-full rounded-lg border bg-white px-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors'
  const inputStyle = { borderColor: colors.tealBright, color: colors.blueDark }
  const inputFocusColor = colors.tealMid

  return (
    <section ref={ref}>
      {/* Top: service detail */}
      <div className={layout.sectionPadYCompact} style={{ backgroundColor: colors.lightGray }}>
        <div className={layout.container}>
          <div className="grid gap-[4vh] lg:grid-cols-2 lg:items-start">
            {/* Left text (floating card) */}
            <div
              className={`rounded-2xl bg-white/90 backdrop-blur-sm p-5 sm:p-6 md:p-8 shadow-lg ring-1 ring-slate-200/60 space-y-[3vh] transition-all duration-1000 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              {heading && (
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl font-primary" style={{ color: colors.blueDark }}>
                  {heading.body}
                </h2>
              )}

              {subtitle && (
                <div className="rounded-xl border p-5" style={{ borderColor: colors.tealBright, backgroundColor: `${colors.tealBright}10` }}>
                  <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: colors.tealMid }}>Objetivo</p>
                  <p className="mt-2 leading-relaxed" style={{ color: colors.blueMid }}>{subtitle.body}</p>
                </div>
              )}

              {paragraphs.map((p, i) => (
                <p key={i} className="leading-relaxed" style={{ color: colors.blueMid }}>{p.body}</p>
              ))}

              {bullets.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.blueDark }}>Ejes de trabajo</p>
                  <ul className="space-y-2">
                    {bullets.map((b, i) => (
                      <li key={i}
                        className={`flex items-start gap-3 transition-all duration-500 ${isInView ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                        style={{ transitionDelay: `${400 + i * 80}ms` }}
                      >
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: colors.secondary.attention }} />
                        <span style={{ color: colors.blueMid }}>{b.body}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right floating image */}
            {photo && (
              <div className={`transition-all duration-1000 delay-300 ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
                <div className="group relative">
                  <div className="absolute -inset-4 rounded-3xl" style={{ backgroundColor: `${colors.tealBright}15` }} />
                  <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200">
                    <img src={photo.url} alt="" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: CV form */}
      <div className={layout.sectionPadY} style={{ backgroundColor: colors.lightGray }}>
        <div className={layout.container}>
          {/* Editable title + paragraph above form grid */}
          {(formHeading || formParagraph) && (
            <div
              className={`mb-[4vh] max-w-none space-y-2 transition-all duration-1000 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              {formHeading && (
                <h3 className="text-xl font-bold sm:text-2xl font-primary" style={{ color: colors.blueDark }}>
                  {formHeading.body}
                </h3>
              )}
              {formParagraph && (
                <p className="leading-relaxed" style={{ color: colors.blueMid }}>{formParagraph.body}</p>
              )}
            </div>
          )}

          <div className="grid gap-[6vh] lg:grid-cols-2 lg:items-start">
            {/* Left: form */}
            <div
              className={`rounded-2xl border bg-white p-5 sm:p-6 md:p-8 shadow-sm transition-all duration-1000 delay-200 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ borderColor: colors.tealBright }}
            >
              {vm.success ? (
                <div className="py-[6vh] text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.tealBright}20` }}>
                    <svg className="h-8 w-8" style={{ color: colors.tealMid }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: colors.blueDark }}>¡Postulación recibida!</h3>
                  <p className="mt-2 text-sm" style={{ color: colors.blueMid }}>Gracias por tu interés. Nos pondremos en contacto pronto.</p>
                  <button
                    onClick={() => vm.setSuccess(false)}
                    className="mt-4 text-sm font-medium underline"
                    style={{ color: colors.tealMid }}
                  >
                    Enviar otra postulación
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); void vm.handleSubmit() }} className="space-y-5">
                  <h3 className="text-lg font-semibold" style={{ color: colors.blueDark }}>Dejanos tu postulación</h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Nombre <span className="text-red-500">*</span></label>
                      <input type="text" required value={vm.form.name} onChange={(e) => vm.setField('name', e.target.value)}
                        className={inputClasses} style={inputStyle} placeholder="Juan"
                        onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Apellido <span className="text-red-500">*</span></label>
                      <input type="text" required value={vm.form.surname} onChange={(e) => vm.setField('surname', e.target.value)}
                        className={inputClasses} style={inputStyle} placeholder="Pérez"
                        onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Email <span className="text-red-500">*</span></label>
                      <input type="email" required value={vm.form.email} onChange={(e) => vm.setField('email', e.target.value)}
                        className={inputClasses} style={inputStyle} placeholder="juan@email.com"
                        onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Teléfono</label>
                      <input type="tel" value={vm.form.phone_number} onChange={(e) => vm.setField('phone_number', e.target.value)}
                        className={inputClasses} style={inputStyle} placeholder="+54 11 1234-5678"
                        onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Puesto de interés <span className="text-red-500">*</span></label>
                    <select value={vm.form.id_interest ?? ''} onChange={(e) => vm.setField('id_interest', Number(e.target.value) || null)}
                      required
                      className={inputClasses} style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                    >
                      <option value="">{vm.isLoadingInterests ? 'Cargando puestos…' : 'Seleccionar…'}</option>
                      {vm.interests.map((i) => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Años de experiencia <span className="text-red-500">*</span></label>
                    <select required value={vm.form.experience} onChange={(e) => vm.setField('experience', e.target.value)}
                      className={inputClasses} style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="0">0</option>
                      <option value="De 0 a 3">De 0 a 3</option>
                      <option value="3 o más">3 o más</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>¿Qué modalidad de trabajo preferís? <span className="text-red-500">*</span></label>
                    <select value={vm.form.modality} onChange={(e) => vm.setField('modality', e.target.value)}
                      required
                      className={inputClasses} style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Presencial">Presencial</option>
                      <option value="Remoto">Remoto</option>
                      <option value="Híbrido">Híbrido</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>¿Cuándo podrías incorporarte? <span className="text-red-500">*</span></label>
                    <input type="text" required value={vm.form.incorporation_time} onChange={(e) => vm.setField('incorporation_time', e.target.value)}
                      className={inputClasses} style={inputStyle} placeholder="Ej: Inmediata, en 15 días..."
                      onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: colors.blueMid }}>Mensaje adicional</label>
                    <textarea rows={3} value={vm.form.message} onChange={(e) => vm.setField('message', e.target.value)}
                      className={inputClasses} style={inputStyle} placeholder="Contanos algo más sobre vos..."
                      onFocus={(e) => { e.currentTarget.style.borderColor = inputFocusColor }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = colors.tealBright }}
                    />
                  </div>

                  {vm.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-sm text-red-700">{vm.error}</p>
                    </div>
                  )}

                  {vm.step && (
                    <p className="text-sm font-medium" style={{ color: colors.tealMid }}>{vm.step}</p>
                  )}

                  {/* Privacidad */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vm.privacyAccepted}
                      onChange={(e) => vm.setPrivacyAccepted(e.target.checked)}
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
                    disabled={vm.isSubmitting}
                    className="w-full rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                    style={{ backgroundColor: colors.tealMid, boxShadow: `0 4px 14px ${colors.ctaShadow}` }}
                    onMouseEnter={(e) => { if (!vm.isSubmitting) e.currentTarget.style.backgroundColor = colors.tealBright }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.tealMid }}
                  >
                    {vm.isSubmitting ? 'Enviando…' : 'Enviar postulación'}
                  </button>
                </form>
              )}
            </div>

            {/* Right: CV upload zone */}
            <div className={`transition-all duration-1000 delay-400 ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="space-y-[3vh]">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: colors.blueDark }}>Adjuntá tu CV</h3>
                  <p className="mt-2 text-sm" style={{ color: colors.blueMid }}>
                    {vm.isFormComplete
                      ? 'Arrastrá el archivo o hacé clic para seleccionarlo.'
                      : 'Completá los campos obligatorios del formulario para habilitar la subida.'}
                  </p>
                </div>

                <div
                  onDragOver={(e) => { if (vm.isFormComplete) e.preventDefault() }}
                  onDrop={(e) => { if (vm.isFormComplete) handleFileDrop(e); else e.preventDefault() }}
                  onClick={() => { if (vm.isFormComplete) fileInputRef.current?.click() }}
                  className={`cv-upload-zone group relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-white p-6 sm:p-8 md:p-12 transition-all ${
                    vm.isFormComplete ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                  style={{ borderColor: colors.tealBright }}
                  onMouseEnter={(e) => { if (vm.isFormComplete) { e.currentTarget.style.borderColor = colors.tealMid; e.currentTarget.style.backgroundColor = `${colors.tealBright}08` } }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.tealBright; e.currentTarget.style.backgroundColor = colors.white }}
                >
                  {vm.isFormComplete && <div className="cv-pulse-ring absolute inset-0 rounded-2xl" />}

                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${colors.tealBright}20`, color: colors.tealMid }}
                  >
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>

                  {vm.file ? (
                    <div className="text-center">
                      <p className="font-medium" style={{ color: colors.tealMid }}>{vm.file.name}</p>
                      <p className="mt-1 text-xs" style={{ color: colors.blueMid }}>{(vm.file.size / 1024).toFixed(0)} KB — Clic para cambiar</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="font-medium" style={{ color: colors.blueMid }}>Subí tu CV</p>
                      <p className="mt-1 text-xs" style={{ color: colors.blueMid }}>Solo PDF (máx. 5 MB)</p>
                    </div>
                  )}

                  <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden"
                    disabled={!vm.isFormComplete}
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) vm.selectFile(file) }}
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
