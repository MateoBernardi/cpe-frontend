/**
 * Layouts de canvas para secciones de la página principal:
 * Hero, SecondaryHero, About.
 */

import { useState } from 'react'
import { matchMediaToSlot, matchTextToSlot } from '../../../config/sectionCanvasConfig'
import type { LayoutProps } from './canvasTypes'
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
                <img src={bgImages[0].url} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/20" />
            {/* Content */}
            <div className="relative z-10 flex h-full min-h-[320px] flex-col items-center justify-center p-6 text-center">
              {ctx.section && (() => {
                const h = matchTextToSlot(ctx.section.texts, headline)
                const sh = matchTextToSlot(ctx.section.texts, subheadline)
                const c1 = matchTextToSlot(ctx.section.texts, ctaPrimary)
                const c2 = matchTextToSlot(ctx.section.texts, ctaSecondary)
                const tr = matchTextToSlot(ctx.section.texts, trustBar)
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
