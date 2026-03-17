/**
 * Layouts de canvas para secciones de servicio, información y formularios:
 * InfoPrimary, InfoSecondary, ContactForm, ServiceDetail, Recruitment.
 */

import { matchAllTextsForRole } from '../../../config/sectionCanvasConfig'
import type { LayoutProps, SlotContext } from './canvasTypes'
import type { TextSlotConfig } from '../../../config/sectionCanvasConfig'
import InlineTextSlot from './InlineTextSlot'
import { ConnectedTextSlot, ConnectedMediaSlot, MultipleTextSlots } from './ConnectedSlots'
import { colors } from '../../../../../theme'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// Info Primary
// ━━━━━━━━━━━━━━━━━━━━━━━━━━

export function InfoPrimaryLayout({ ctx, textSlots, mediaSlots }: LayoutProps) {
  const heading = textSlots.find((s) => s.role === 'heading')!
  const bulletConfig = textSlots.find((s) => s.role === 'bullet')!
  const diagram = mediaSlots.find((s) => s.role === 'diagram')!
  const iconConfig = mediaSlots.find((s) => s.role === 'icon')

  return (
    <div className="rounded-xl bg-slate-100 p-6 space-y-4">
      <div className="grid gap-6 lg:grid-cols-2">
        <ConnectedMediaSlot config={diagram} ctx={ctx} />
        <div className="space-y-4">
          <ConnectedTextSlot config={heading} ctx={ctx} />
          <MultipleTextSlots config={bulletConfig} ctx={ctx} addLabel="Agregar viñeta" />
        </div>
      </div>
      {iconConfig && (
        <div className="border-t border-slate-200 pt-4">
          <p className="mb-2 text-xs font-medium text-gray-500">Íconos (opcionales, uno por viñeta):</p>
          <ConnectedMediaSlot config={iconConfig} ctx={ctx} />
        </div>
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// Info Secondary (dona)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━

const DONA_COLORS = ['#0d9488', '#06b6d4', '#6366f1', '#4338ca', '#134e4a']

export function InfoSecondaryLayout({ ctx, textSlots }: { ctx: SlotContext; textSlots: TextSlotConfig[] }) {
  const heading = textSlots.find((s) => s.role === 'heading')!
  const paraConfig = textSlots.find((s) => s.role === 'paragraph')!
  const quoteConfig = textSlots.find((s) => s.role === 'quote')!

  const paragraphs = ctx.section ? matchAllTextsForRole(ctx.section.texts, 'paragraph') : []
  const quotes = ctx.section ? matchAllTextsForRole(ctx.section.texts, 'quote') : []

  /** Reordenar sección de la dona */
  const swapSections = (indexA: number, indexB: number) => {
    const pA = paragraphs[indexA]
    const pB = paragraphs[indexB]
    if (!pA || !pB) return
    ctx.swapTextOrder(pA, pB)
    // También reordenar las quotes asociadas si existen
    const qA = quotes[indexA]
    const qB = quotes[indexB]
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
            const quote = quotes[i]
            const pSlotId = `${paraConfig.id}-${i}`
            const qSlotId = `${quoteConfig.id}-${i}`
            return (
              <div key={p.id} className="group/dona rounded-xl border-l-4 bg-white shadow-sm" style={{ borderLeftColor: DONA_COLORS[i % DONA_COLORS.length] }}>
                <div className="px-4 py-3 flex items-center gap-2">
                  {/* Flechas reorden */}
                  {paragraphs.length > 1 && (
                    <div className="flex flex-col gap-0.5 opacity-0 transition-opacity group-hover/dona:opacity-100">
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
                  <span className="flex h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: DONA_COLORS[i % DONA_COLORS.length] }} />
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
                      config={{ ...quoteConfig, id: qSlotId, slotIndex: i, label: 'Descripción (click en dona)' }}
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
            Agregar sección en la dona
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
        {/* Dona preview */}
        <div className="flex items-center justify-center rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          {paragraphs.length > 0 ? (
            <DonutPreview count={paragraphs.length} />
          ) : (
            <div className="text-center text-gray-400">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              <p className="mt-2 text-xs">Agregá secciones para ver la dona</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Vista previa SVG del gráfico dona */
function DonutPreview({ count }: { count: number }) {
  const rad = (d: number) => (d * Math.PI) / 180
  return (
    <div className="text-center">
      <div className="relative mx-auto h-40 w-40">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {Array.from({ length: count }).map((_, i) => {
            const seg = 360 / count
            const start = -90 + i * seg + 1.5
            const end = -90 + (i + 1) * seg - 1.5
            const large = end - start > 180 ? 1 : 0
            const r = 40
            const ir = 22
            const os = { x: 50 + r * Math.cos(rad(start)), y: 50 + r * Math.sin(rad(start)) }
            const oe = { x: 50 + r * Math.cos(rad(end)), y: 50 + r * Math.sin(rad(end)) }
            const is_ = { x: 50 + ir * Math.cos(rad(end)), y: 50 + ir * Math.sin(rad(end)) }
            const ie = { x: 50 + ir * Math.cos(rad(start)), y: 50 + ir * Math.sin(rad(start)) }
            return (
              <path
                key={i}
                d={`M${os.x} ${os.y} A${r} ${r} 0 ${large} 1 ${oe.x} ${oe.y} L${is_.x} ${is_.y} A${ir} ${ir} 0 ${large} 0 ${ie.x} ${ie.y} Z`}
                fill={DONA_COLORS[i % DONA_COLORS.length]}
              />
            )
          })}
        </svg>
      </div>
      <p className="mt-2 text-xs text-gray-400">Vista previa de la dona ({count} secciones)</p>
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// Teaser Layout (para teasers de la home)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━

export function TeaserLayout({ ctx, textSlots }: { ctx: SlotContext; textSlots: TextSlotConfig[] }) {
  const heading = textSlots.find((s) => s.role === 'heading')
  const subtitle = textSlots.find((s) => s.role === 'subtitle')
  const cta = textSlots.find((s) => s.role === 'cta')

  return (
    <div className="rounded-xl bg-gradient-to-br from-teal-50 to-white p-6 space-y-4">
      <div className="grid gap-4 lg:grid-cols-2 items-center">
        {/* Left: illustration placeholder */}
        <div className="flex items-center justify-center rounded-xl bg-teal-100/50 p-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-200/50">
            <svg className="h-12 w-12 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
          <p className="ml-3 text-[10px] text-teal-600">Ilustración autogenerada</p>
        </div>
        {/* Right: editable text slots */}
        <div className="space-y-3">
          {heading && <ConnectedTextSlot config={heading} ctx={ctx} />}
          {subtitle && <ConnectedTextSlot config={subtitle} ctx={ctx} />}
          {cta && <ConnectedTextSlot config={cta} ctx={ctx} />}
        </div>
      </div>
    </div>
  )
}
