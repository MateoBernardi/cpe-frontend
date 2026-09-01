/**
 * Layouts de canvas para secciones de servicio, información y formularios:
 * InfoSecondary, ContactForm, ServiceDetail, Recruitment.
 */

import { matchAllTextsForRole } from '../../../config/sectionCanvasConfig'
import type { LayoutProps, SlotContext } from './canvasTypes'
import type { TextSlotConfig } from '../../../config/sectionCanvasConfig'
import InlineTextSlot from './InlineTextSlot'
import { ConnectedTextSlot, ConnectedMediaSlot, MultipleTextSlots } from './ConnectedSlots'
import { colors } from '../../../../../theme'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// Info Secondary (acordeones + diagrama del circuito)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━

const SEGMENT_ACCENT_COLORS = ['#0d9488', '#06b6d4', '#6366f1', '#4338ca', '#134e4a']

export function InfoSecondaryLayout({ ctx, textSlots }: { ctx: SlotContext; textSlots: TextSlotConfig[] }) {
  const heading = textSlots.find((s) => s.role === 'heading')!
  const paraConfig = textSlots.find((s) => s.role === 'paragraph')!
  const quoteConfig = textSlots.find((s) => s.role === 'quote')!

  const paragraphs = ctx.section ? matchAllTextsForRole(ctx.section.texts, 'paragraph') : []
  const quotes = ctx.section ? matchAllTextsForRole(ctx.section.texts, 'quote') : []
  const quotesByOrder = new Map(quotes.map((q) => [q.order, q] as const))

  /** Reordenar sección del acordeón */
  const swapSections = (indexA: number, indexB: number) => {
    const pA = paragraphs[indexA]
    const pB = paragraphs[indexB]
    if (!pA || !pB) return
    ctx.swapTextOrder(pA, pB)
    // También reordenar las quotes asociadas por posición (order) si existen
    const qA = quotesByOrder.get(pA.order)
    const qB = quotesByOrder.get(pB.order)
    if (qA && qB) {
      ctx.swapTextOrder(qA, qB)
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 ring-1 ring-slate-200 space-y-6">
      <ConnectedTextSlot config={heading} ctx={ctx} className="text-center" />
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Collapsibles (izq) */}
        <div className="space-y-3">
          {paragraphs.map((p, i) => {
            const quote = quotesByOrder.get(p.order)
            const pSlotId = `${paraConfig.id}-${i}`
            const qSlotId = `${quoteConfig.id}-${i}`
            return (
              <div key={p.id} className="group/segment rounded-xl border-l-4 bg-white shadow-sm" style={{ borderLeftColor: SEGMENT_ACCENT_COLORS[i % SEGMENT_ACCENT_COLORS.length] }}>
                <div className="px-4 py-3 flex items-center gap-2">
                  {/* Flechas reorden */}
                  {paragraphs.length > 1 && (
                    <div className="flex flex-col gap-0.5 opacity-0 transition-opacity group-hover/segment:opacity-100">
                      <button
                        type="button"
                        onClick={() => swapSections(i, i - 1)}
                        disabled={i === 0}
                        className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:invisible"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => swapSections(i, i + 1)}
                        disabled={i === paragraphs.length - 1}
                        className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:invisible"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <span className="flex h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: SEGMENT_ACCENT_COLORS[i % SEGMENT_ACCENT_COLORS.length] }} />
                  <div className="flex-1">
                    <InlineTextSlot
                      config={{ ...paraConfig, id: pSlotId, slotIndex: i }}
                      text={p}
                      isEditing={ctx.editingSlotId === pSlotId}
                      editValue={ctx.editValue}
                      onStartEdit={() => ctx.startEdit(pSlotId, p)}
                      onSaveEdit={() => ctx.saveEdit({ ...paraConfig, id: pSlotId, slotIndex: i })}
                      onCancelEdit={ctx.cancelEdit}
                      onChangeValue={ctx.setEditValue}
                      onDelete={() => ctx.deleteText(p.blockId, p.id)}
                    />
                  </div>
                </div>
                <div className="px-4 pb-3">
                  {quote ? (
                    <InlineTextSlot
                      config={{ ...quoteConfig, id: qSlotId, slotIndex: i, label: 'Descripción (click en el acordeón)' }}
                      text={quote}
                      isEditing={ctx.editingSlotId === qSlotId}
                      editValue={ctx.editValue}
                      onStartEdit={() => ctx.startEdit(qSlotId, quote)}
                      onSaveEdit={() => ctx.saveEdit({ ...quoteConfig, id: qSlotId, slotIndex: i })}
                      onCancelEdit={ctx.cancelEdit}
                      onChangeValue={ctx.setEditValue}
                      onDelete={() => ctx.deleteText(quote.blockId, quote.id)}
                    />
                  ) : (
                    <InlineTextSlot
                      config={{ ...quoteConfig, id: qSlotId, slotIndex: i, label: `Agregar descripción para "${p.body.slice(0, 30)}..."` }}
                      text={undefined}
                      isEditing={ctx.editingSlotId === qSlotId}
                      editValue={ctx.editValue}
                      onStartEdit={() => ctx.startEdit(qSlotId, undefined)}
                      onSaveEdit={() => ctx.saveEdit({ ...quoteConfig, slotIndex: i })}
                      onCancelEdit={ctx.cancelEdit}
                      onChangeValue={ctx.setEditValue}
                    />
                  )}
                </div>
              </div>
            )
          })}
          {/* Add new section */}
          <button
            type="button"
            onClick={() => ctx.startEdit(`${paraConfig.id}-new`, undefined)}
            className="flex w-full items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 py-3 text-xs text-gray-400 transition-colors hover:border-teal-400 hover:bg-teal-50 hover:text-teal-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Agregar sección al acordeón
          </button>
          {ctx.editingSlotId === `${paraConfig.id}-new` && (
            <div className="rounded-lg border border-blue-200 bg-white p-3">
              <InlineTextSlot
                config={{ ...paraConfig, id: `${paraConfig.id}-new`, slotIndex: paragraphs.length }}
                text={undefined}
                isEditing={true}
                editValue={ctx.editValue}
                onStartEdit={() => {}}
                onSaveEdit={() => ctx.saveEdit({ ...paraConfig, slotIndex: paragraphs.length })}
                onCancelEdit={ctx.cancelEdit}
                onChangeValue={ctx.setEditValue}
              />
            </div>
          )}
        </div>
        {/* Diagrama del circuito — imagen fija, no editable desde el panel */}
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 p-6 ring-1 ring-slate-200 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100/60">
            <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15M4.5 9h15M4.5 15h15" />
            </svg>
          </div>
          <p className="text-xs text-gray-400">
            Diagrama del circuito de intervención.<br />
            Imagen fija — no se sube ni se edita desde el panel.
          </p>
        </div>
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// Contact Form
// ━━━━━━━━━━━━━━━━━━━━━━━━━━

export function ContactFormLayout({ ctx, textSlots }: { ctx: SlotContext; textSlots: TextSlotConfig[] }) {
  const info = textSlots.find((s) => s.role === 'info')!

  return (
    <div className="rounded-xl bg-teal-50 p-6 space-y-6">
      {/* Formulario (solo lectura — se envía al backend) */}
      <div className="mx-auto max-w-lg rounded-xl bg-white p-5 ring-1 ring-teal-200 space-y-3">
        <p className="text-sm font-semibold text-slate-700">Formulario de contacto</p>
        <p className="text-[10px] text-gray-400 mb-3">
          Los campos del formulario no son editables desde el panel de administración.<br />
          Los datos se envían directamente a la base de datos.
        </p>
        {['Nombre', 'Email', 'Localidad', 'Dirección', 'Teléfono', 'N.º de empleados', 'Mensaje'].map((field) => (
          <div key={field} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded bg-teal-300 flex-shrink-0" />
            <span className="text-xs text-gray-400">{field}</span>
          </div>
        ))}
      </div>
      {/* Info adicional */}
      <div className="rounded-xl bg-white p-4 ring-1 ring-teal-200">
        <div className="flex items-start gap-2">
          <span className="text-base">ℹ️</span>
          <ConnectedTextSlot config={info} ctx={ctx} className="flex-1" />
        </div>
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// Service Detail
// ━━━━━━━━━━━━━━━━━━━━━━━━━━

export function ServiceDetailLayout({ ctx, textSlots, mediaSlots }: LayoutProps) {
  const heading = textSlots.find((s) => s.role === 'heading')!
  const subtitle = textSlots.find((s) => s.role === 'subtitle')!
  const paraConfig = textSlots.find((s) => s.role === 'paragraph')!
  const bulletConfig = textSlots.find((s) => s.role === 'bullet')!
  const ctaHeading = textSlots.find((s) => s.role === 'cta_heading')
  const cta = textSlots.find((s) => s.role === 'cta')
  const photo = mediaSlots.find((s) => s.role === 'photo')!

  return (
    <div className="rounded-xl bg-white p-6 ring-1 ring-slate-200 space-y-4">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-slate-200/60 space-y-4">
          <ConnectedTextSlot config={heading} ctx={ctx} />
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 mb-1">Objetivo</p>
            <ConnectedTextSlot config={subtitle} ctx={ctx} />
          </div>
          <MultipleTextSlots config={paraConfig} ctx={ctx} addLabel="Agregar párrafo" />
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Ejes de trabajo</p>
            <MultipleTextSlots config={bulletConfig} ctx={ctx} addLabel="Agregar eje" />
          </div>
        </div>
        <div>
          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl bg-teal-100/50" />
            <div className="relative">
              <ConnectedMediaSlot config={photo} ctx={ctx} />
            </div>
          </div>
        </div>
      </div>
      {/* CTA */}
      {(ctaHeading || cta) && (
        <div className="rounded-2xl p-6 text-center space-y-3" style={{ backgroundColor: colors.secondaryHeroBg }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: colors.tealBright }}>Bloque CTA</p>
          {ctaHeading && <ConnectedTextSlot config={ctaHeading} ctx={ctx} />}
          {cta && <ConnectedTextSlot config={cta} ctx={ctx} />}
        </div>
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// Recruitment (servicio + formulario)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━

export function RecruitmentLayout({ ctx, textSlots, mediaSlots }: LayoutProps) {
  const heading = textSlots.find((s) => s.role === 'heading')!
  const subtitle = textSlots.find((s) => s.role === 'subtitle')!
  const paraConfig = textSlots.find((s) => s.role === 'paragraph')!
  const bulletConfig = textSlots.find((s) => s.role === 'bullet')!
  const formHeading = textSlots.find((s) => s.role === 'form_heading')!
  const formParagraph = textSlots.find((s) => s.role === 'form_paragraph')!
  const ctaHeading = textSlots.find((s) => s.role === 'cta_heading')
  const cta = textSlots.find((s) => s.role === 'cta')
  const photo = mediaSlots.find((s) => s.role === 'photo')!

  return (
    <div className="space-y-6">
      {/* Detalle del servicio (editable) */}
      <div className="rounded-xl bg-white p-6 ring-1 ring-slate-200">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-slate-200/60 space-y-4">
            <ConnectedTextSlot config={heading} ctx={ctx} />
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 mb-1">Objetivo</p>
              <ConnectedTextSlot config={subtitle} ctx={ctx} />
            </div>
            <MultipleTextSlots config={paraConfig} ctx={ctx} addLabel="Agregar párrafo" />
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Ejes de trabajo</p>
              <MultipleTextSlots config={bulletConfig} ctx={ctx} addLabel="Agregar eje" />
            </div>
          </div>
          <div>
            <div className="relative">
              <div className="absolute -inset-2 rounded-2xl bg-teal-100/50" />
              <div className="relative">
                <ConnectedMediaSlot config={photo} ctx={ctx} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Título y párrafo editables sobre el formulario */}
      <div className="rounded-xl bg-white p-6 ring-1 ring-slate-200 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Título y párrafo del formulario</p>
        <ConnectedTextSlot config={formHeading} ctx={ctx} />
        <ConnectedTextSlot config={formParagraph} ctx={ctx} />
      </div>

      {/* Formulario de postulación (solo lectura — se envía al backend) */}
      <div className="rounded-xl bg-teal-50 p-6 ring-1 ring-teal-200">
        <p className="mb-3 text-sm font-semibold text-slate-800">Formulario de postulación</p>
        <p className="mb-4 text-[10px] text-gray-500">
          Los campos del formulario no son editables desde el panel de administración.<br />
          Los datos se envían directamente a la base de datos. Para agregar o quitar puestos ir a pestaña Postulaciones.  
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {['¿En qué área te gustaría trabajar?', 'Años de experiencia (0 / 1 a 3 / 3 o más)', '¿Qué modalidad de trabajo preferís?', '¿Cuándo podrías incorporarte?'].map((field) => (
            <div key={field} className="rounded-lg bg-white p-3 ring-1 ring-teal-100">
              <span className="text-xs text-gray-400">{field}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {(ctaHeading || cta) && (
        <div className="rounded-2xl p-6 text-center space-y-3" style={{ backgroundColor: colors.secondaryHeroBg }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: colors.tealBright }}>Bloque CTA</p>
          {ctaHeading && <ConnectedTextSlot config={ctaHeading} ctx={ctx} />}
          {cta && <ConnectedTextSlot config={cta} ctx={ctx} />}
        </div>
      )}
    </div>
  )
}
