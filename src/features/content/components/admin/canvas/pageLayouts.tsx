/**
 * Layouts de canvas para secciones de la página principal:
 * Hero, SecondaryHero, About, News.
 */

import { useState } from 'react'
import { matchAllTextsForRole, matchMediaToSlot } from '../../../config/sectionCanvasConfig'
import type { LayoutProps } from './canvasTypes'
import InlineTextSlot from './InlineTextSlot'
import { ConnectedTextSlot, ConnectedMediaSlot } from './ConnectedSlots'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// Hero (Fórmula de 5 elementos)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━

type HeroTab = 'textos' | 'imagenes' | 'preview'

export function HeroLayout({ ctx, textSlots, mediaSlots }: LayoutProps) {
  const [activeTab, setActiveTab] = useState<HeroTab>('textos')

  const headline     = textSlots.find((s) => s.role === 'headline')!
  const subheadline  = textSlots.find((s) => s.role === 'subheading')!
  const ctaPrimary   = textSlots.find((s) => s.role === 'cta')!
  const ctaSecondary = textSlots.find((s) => s.role === 'cta_secondary')!
  const trustBar     = textSlots.find((s) => s.role === 'trust')!

  const bgSlot = mediaSlots[0]
  const bgImages = ctx.section ? matchMediaToSlot(ctx.section.media, bgSlot) : []

  const tabs: { key: HeroTab; label: string; icon: string }[] = [
    { key: 'textos',   label: 'Textos',          icon: '✏️' },
    { key: 'imagenes', label: `Imágenes (${bgImages.length})`, icon: '🖼️' },
    { key: 'preview',  label: 'Vista previa',    icon: '👁️' },
  ]

  return (
    <div className="space-y-3">
      {/* ── Pestañas ── */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Pestaña: Textos ── */}
      {activeTab === 'textos' && (
        <div className="space-y-3">
          {/* 01 — Headline */}
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-100 text-[10px] font-bold text-teal-700">01</span>
              <span className="text-xs font-semibold text-gray-600">Título principal</span>
            </div>
            <ConnectedTextSlot config={headline} ctx={ctx} />
          </div>

          {/* 02 — Subheadline */}
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-100 text-[10px] font-bold text-teal-700">02</span>
              <span className="text-xs font-semibold text-gray-600">Subtítulo</span>
            </div>
            <ConnectedTextSlot config={subheadline} ctx={ctx} />
          </div>

          {/* 03 — CTA Primario */}
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-100 text-[10px] font-bold text-teal-700">03</span>
              <span className="text-xs font-semibold text-gray-600">Botón principal</span>
            </div>
            <ConnectedTextSlot config={ctaPrimary} ctx={ctx} />
          </div>

          {/* 04 — CTA Secundario */}
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-[10px] font-bold text-blue-700">04</span>
              <span className="text-xs font-semibold text-gray-600">Botón secundario</span>
            </div>
            <ConnectedTextSlot config={ctaSecondary} ctx={ctx} />
          </div>

          {/* 05 — Trust bar */}
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 text-[10px] font-bold text-indigo-700">05</span>
              <span className="text-xs font-semibold text-gray-600">Barra de confianza</span>
            </div>
            <ConnectedTextSlot config={trustBar} ctx={ctx} />
          </div>

          {/* Referencia rápida */}
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3">
            <div className="flex flex-col gap-0.5 text-[11px] text-slate-600">
              <span>→ ¿Qué hace esta empresa?</span>
              <span>→ ¿Por qué me debería importar?</span>
              <span>→ ¿Qué hago ahora?</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Pestaña: Imágenes ── */}
      {activeTab === 'imagenes' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700">Carrusel de fondo</p>
            <p className="mt-0.5 text-[11px] text-gray-400">
              Las imágenes rotan automáticamente cada 5 segundos. Arrastrá o hacé clic para subir.
            </p>
          </div>
          <ConnectedMediaSlot config={bgSlot} ctx={ctx} />
          {bgImages.length > 0 && (
            <div className="mt-3 rounded-lg bg-gray-50 p-2">
              <p className="text-[10px] text-gray-500">
                💡 Resolución recomendada: 1920×1080 px (16:9). Formato: JPG o WebP.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Pestaña: Vista previa ── */}
      {activeTab === 'preview' && (
        <div className="space-y-2">
          <p className="text-[10px] text-gray-400 text-center">
            Así se ve la portada en el sitio (aproximado)
          </p>
          <div className="relative rounded-xl overflow-hidden bg-slate-800 min-h-[320px]">
            {/* Background image */}
            {bgImages.length > 0 && (
              <div className="absolute inset-0">
                <img src={bgImages[0].mediaUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/20" />
            {/* Content */}
            <div className="relative z-10 flex h-full min-h-[320px] flex-col items-center justify-center p-6 text-center">
              {ctx.section && (() => {
                const h  = ctx.section.texts.find((t) => t.role === 'headline')
                const sh = ctx.section.texts.find((t) => t.role === 'subheading')
                const c1 = ctx.section.texts.find((t) => t.role === 'cta')
                const c2 = ctx.section.texts.find((t) => t.role === 'cta_secondary')
                const tr = ctx.section.texts.find((t) => t.role === 'trust')
                return (
                  <>
                    {h  && <h2 className="text-2xl font-extrabold text-white drop-shadow-lg">{h.body}</h2>}
                    {sh && <p className="mt-2 max-w-lg text-base text-white/80 drop-shadow">{sh.body}</p>}
                    <div className="mt-5 flex items-center gap-3">
                      {c1 && <span className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg">{c1.body}</span>}
                      {c2 && <span className="rounded-xl border-2 border-white/30 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur-sm">{c2.body}</span>}
                    </div>
                    {tr && <p className="mt-6 text-xs tracking-wide text-white/50">{tr.body}</p>}
                    {!h && !sh && !c1 && !c2 && !tr && (
                      <p className="text-sm text-white/40 italic">Aún no hay textos — Agregá contenido en la pestaña "Textos"</p>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// Secondary Hero
// ━━━━━━━━━━━━━━━━━━━━━━━━━━

export function SecondaryHeroLayout({ ctx, textSlots, mediaSlots }: LayoutProps) {
  const [heading, subtitle, cta] = textSlots
  return (
    <div className="rounded-xl bg-slate-50 p-6 space-y-6">
      <div className="text-center space-y-2">
        <ConnectedTextSlot config={heading} ctx={ctx} />
        <ConnectedTextSlot config={subtitle} ctx={ctx} />
      </div>
      <ConnectedMediaSlot config={mediaSlots[0]} ctx={ctx} className="mx-auto max-w-md" />
      <div className="mx-auto max-w-sm rounded-xl bg-blue-50 p-4 ring-1 ring-blue-100 text-center">
        <ConnectedTextSlot config={cta} ctx={ctx} />
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// About
// ━━━━━━━━━━━━━━━━━━━━━━━━━━

export function AboutLayout({ ctx, textSlots, mediaSlots }: LayoutProps) {
  const heading = textSlots.find((s) => s.role === 'heading')!
  const bio1 = textSlots.find((s) => s.role === 'bio' && s.slotIndex === 0)!
  const para1 = textSlots.find((s) => s.role === 'paragraph' && s.slotIndex === 0)!
  const bio2 = textSlots.find((s) => s.role === 'bio' && s.slotIndex === 1)!
  const para2 = textSlots.find((s) => s.role === 'paragraph' && s.slotIndex === 1)!
  const photo1 = mediaSlots.find((s) => s.slotIndex === 0)!
  const photo2 = mediaSlots.find((s) => s.slotIndex === 1)!

  return (
    <div className="rounded-xl bg-gray-50 p-6 space-y-6">
      <ConnectedTextSlot config={heading} ctx={ctx} className="text-center" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <ConnectedTextSlot config={bio1} ctx={ctx} />
          <div className="rounded-xl border border-slate-200 p-3" style={{ backgroundImage: 'radial-gradient(circle, rgb(13 148 136 / 0.15) 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
            <ConnectedTextSlot config={para1} ctx={ctx} />
          </div>
        </div>
        <ConnectedMediaSlot config={photo1} ctx={ctx} />
        <div className="space-y-2">
          <ConnectedTextSlot config={bio2} ctx={ctx} />
          <div className="rounded-xl border border-slate-200 p-3" style={{ backgroundImage: 'radial-gradient(circle, rgb(13 148 136 / 0.15) 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
            <ConnectedTextSlot config={para2} ctx={ctx} />
          </div>
        </div>
        <ConnectedMediaSlot config={photo2} ctx={ctx} />
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// News (con reorden de tarjetas)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━

function ArrowLeftIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function NewsLayout({ ctx, textSlots, mediaSlots }: LayoutProps) {
  const heading = textSlots.find((s) => s.role === 'heading')!
  const paraConfig = textSlots.find((s) => s.role === 'paragraph')!
  const thumbConfig = mediaSlots.find((s) => s.role === 'thumbnail')!

  const paragraphs = ctx.section ? matchAllTextsForRole(ctx.section.texts, 'paragraph') : []
  const thumbnails = ctx.section ? matchMediaToSlot(ctx.section.media, thumbConfig) : []

  /** Intercambia el orden de dos tarjetas (texto + imagen asociada) */
  const swapCards = (indexA: number, indexB: number) => {
    const pA = paragraphs[indexA]
    const pB = paragraphs[indexB]
    if (!pA || !pB) return
    // Intercambiar textos
    ctx.swapTextOrder(pA.pivotId, pA.order, pB.pivotId, pB.order)
    // Intercambiar thumbnails si ambos existen
    const tA = thumbnails[indexA]
    const tB = thumbnails[indexB]
    if (tA && tB) {
      ctx.swapMediaOrder(tA.pivotId, tA.order, tB.pivotId, tB.order)
    }
  }

  return (
    <div className="rounded-xl bg-teal-50 p-6 space-y-4">
      <ConnectedTextSlot config={heading} ctx={ctx} />
      <div className="flex gap-4 overflow-x-auto pb-2">
        {paragraphs.map((p, i) => {
          const thumb = thumbnails[i]
          const slotId = `${paraConfig.id}-${i}`
          const uploadThumb = (file: File) => ctx.uploadToSlot({ ...thumbConfig, slotIndex: i }, file)

          return (
            <div key={p.id} className="group/card relative flex-shrink-0 w-64 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              {/* Flechas de reorden de tarjeta */}
              {paragraphs.length > 1 && (
                <div className="absolute top-1 left-1 z-10 flex gap-0.5 opacity-0 transition-opacity group-hover/card:opacity-100">
                  <button
                    type="button"
                    onClick={() => swapCards(i, i - 1)}
                    disabled={i === 0}
                    className="rounded-full bg-white/90 p-1 text-gray-500 shadow ring-1 ring-gray-200 hover:bg-gray-100 disabled:invisible"
                    title="Mover a la izquierda"
                  >
                    <ArrowLeftIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => swapCards(i, i + 1)}
                    disabled={i === paragraphs.length - 1}
                    className="rounded-full bg-white/90 p-1 text-gray-500 shadow ring-1 ring-gray-200 hover:bg-gray-100 disabled:invisible"
                    title="Mover a la derecha"
                  >
                    <ArrowRightIcon />
                  </button>
                </div>
              )}
              {/* Thumbnail */}
              {thumb ? (
                <div className="group/thumb relative aspect-[16/10] bg-slate-100">
                  <img
                    src={thumb.mediaUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <div className="absolute right-1 top-1 hidden gap-1 group-hover/thumb:flex">
                    {/* Cambiar imagen */}
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) {
                            ctx.deleteMedia(thumb.id)
                            uploadThumb(file)
                          }
                        }
                        input.click()
                      }}
                      className="rounded-full bg-blue-500 p-1"
                      title="Cambiar imagen"
                    >
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                      </svg>
                    </button>
                    {/* Eliminar */}
                    <button
                      type="button"
                      onClick={() => { if (confirm('¿Eliminar imagen?')) ctx.deleteMedia(thumb.id) }}
                      className="rounded-full bg-red-500 p-1"
                    >
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="aspect-[16/10] flex items-center justify-center bg-slate-100/50 border-b border-dashed border-gray-200 cursor-pointer hover:bg-purple-50"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) uploadThumb(file)
                    }
                    input.click()
                  }}
                >
                  <span className="text-[10px] text-gray-400">+ Imagen</span>
                </div>
              )}
              {/* Text */}
              <div className="p-3">
                <InlineTextSlot
                  config={{ ...paraConfig, id: slotId, slotIndex: i }}
                  text={p}
                  isEditing={ctx.editingSlotId === slotId}
                  editValue={ctx.editValue}
                  onStartEdit={() => ctx.startEdit(slotId, p)}
                  onSaveEdit={() => ctx.saveEdit({ ...paraConfig, id: slotId, slotIndex: i })}
                  onCancelEdit={ctx.cancelEdit}
                  onChangeValue={ctx.setEditValue}
                  onDelete={() => ctx.deleteText(p.id)}
                />
              </div>
            </div>
          )
        })}
        {/* Add new card */}
        <div
          className="flex-shrink-0 w-64 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white/50 p-6 cursor-pointer transition-colors hover:border-teal-400 hover:bg-teal-50/30"
          onClick={() => ctx.startEdit(`${paraConfig.id}-new`, undefined)}
        >
          <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="mt-2 text-xs text-gray-400">Agregar novedad</span>
        </div>
      </div>
      {/* Editor para nueva tarjeta */}
      {ctx.editingSlotId === `${paraConfig.id}-new` && (
        <div className="rounded-lg border border-blue-200 bg-white p-3">
          <p className="mb-2 text-xs font-medium text-gray-500">Nueva novedad:</p>
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
  )
}
