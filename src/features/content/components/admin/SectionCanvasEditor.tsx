/**
 * SectionCanvasEditor — editor visual tipo "diapositiva" (PowerPoint-like).
 *
 * Cada sección se presenta como un slide individual con:
 * - Toolbar superior con acciones contextuales
 * - Slide frame con borde redondeado que simula una diapositiva
 * - Guía de layout colapsable integrada
 * - Barra de estado inferior con advertencias y contadores
 * - Panel de archivos R2 (si la sección tiene archivos)
 */

import { useState, useMemo } from 'react'
import { getCanvasConfig } from '../../config/sectionCanvasConfig'
import SectionGuide from './SectionGuide'
import GalleryPicker from './GalleryPicker'
import { useSlotEditing } from './useSlotEditing'
import {
  ConnectedTextSlot,
  ConnectedMediaSlot,
  MultipleTextSlots,
  HeroLayout,
  SecondaryHeroLayout,
  AboutLayout,
  InfoPrimaryLayout,
  InfoSecondaryLayout,
  ContactFormLayout,
  ServiceDetailLayout,
  RecruitmentLayout,
  TeaserLayout,
} from './canvas'
import type { SectionCanvasEditorProps, LayoutProps } from './canvas'

const LAYOUT_MAP: Record<string, React.ComponentType<LayoutProps>> = {
  hero: HeroLayout,
  secondary_hero: SecondaryHeroLayout,
  about: AboutLayout,
  info_primary: InfoPrimaryLayout,
  info_secondary: InfoSecondaryLayout as unknown as React.ComponentType<LayoutProps>,
  contact_form: ContactFormLayout as unknown as React.ComponentType<LayoutProps>,
  service_intervencion: ServiceDetailLayout,
  service_seleccion: RecruitmentLayout,
  service_acompanamiento: ServiceDetailLayout,
  traspaso_generacional: ServiceDetailLayout,
  service_clinica_empresarios: ServiceDetailLayout,
  teaser_circuit: TeaserLayout as unknown as React.ComponentType<LayoutProps>,
  teaser_clinica: TeaserLayout as unknown as React.ComponentType<LayoutProps>,
  teaser_traspaso: TeaserLayout as unknown as React.ComponentType<LayoutProps>,
}

// ── Layout description map — explica cómo se arma la diapositiva ──
const LAYOUT_DESCRIPTIONS: Record<string, string> = {
  hero: '5 elementos de texto + carrusel de fondo. El título y botones se superponen sobre las imágenes con degradado oscuro.',
  secondary_hero: '3 textos centrados + 1 imagen destacada. Diseño simétrico con tarjeta CTA.',
  about: 'Se combina con "Información Principal" en un único hero fusionado ("Quiénes somos"). Grilla de 4 columnas: bio + párrafo + foto × 2 perfiles. Fondo con puntos decorativos.',
  info_primary: 'Se combina con "Nosotros" en un único hero fusionado ("Quiénes somos"). 2 columnas: diagrama/imagen (izq) + título con lista de viñetas (der). Íconos opcionales.',
  info_secondary: '2 columnas: acordeones con secciones (izq) + gráfico dona interactivo (der). Sin imágenes.',
  contact_form: '1 columna: formulario de contacto centrado + texto informativo abajo. Los campos del formulario no son editables.',
  service_intervencion: '2 columnas: tarjeta de texto con objetivo/párrafos/ejes (izq) + imagen (der).',
  service_seleccion: '2 bloques: detalle del servicio (arriba) + formulario de postulación CV (abajo).',
  service_acompanamiento: '2 columnas: tarjeta de texto con objetivo/párrafos/ejes (izq) + imagen (der).',
  traspaso_generacional: '2 columnas: tarjeta de texto con objetivo/párrafos/ejes (izq) + imagen (der).',
  service_clinica_empresarios: '2 columnas: tarjeta de texto con objetivo/párrafos/ejes (izq) + imagen (der).',
  teaser_circuit: '1 columna: título editable. La animación del circuito se genera automáticamente.',
  teaser_clinica: '2 columnas: ilustración (izq) + título, subtítulo y CTA (der).',
  teaser_traspaso: '2 columnas: título, subtítulo y CTA (izq) + ilustración (der).',
}

// ── Content status calculations ──

function computeSlideStats(section: SectionCanvasEditorProps['section'], config: ReturnType<typeof getCanvasConfig>) {
  if (!section || !config) return null

  const totalTextSlots = config.textSlots.length
  const filledTextSlots = config.textSlots.filter((slot) => {
    if (slot.multiple) {
      return section.texts.some((t) => t.role === slot.role)
    }
    const matching = section.texts.filter((t) => t.role === slot.role)
    return matching.length > slot.slotIndex
  }).length

  const totalMediaSlots = config.mediaSlots.length
  const filledMediaSlots = config.mediaSlots.filter((slot) => {
    return section.media.some((m) => m.role === slot.role)
  }).length

  const draftTexts = section.texts.filter((t) => t.status === 'DRAFTED').length
  const draftMedia = section.media.filter((m) => m.status === 'DRAFTED').length
  const filesCount = section.files.length

  // Check for text length warnings
  const textWarnings: string[] = []
  config.textSlots.forEach((slot) => {
    if (!slot.maxLength) return
    const matching = section.texts.filter((t) => t.role === slot.role)
    matching.forEach((t) => {
      if (t.body.length > slot.maxLength! * 0.9) {
        const pct = Math.round((t.body.length / slot.maxLength!) * 100)
        textWarnings.push(`${slot.label}: ${pct}% del límite (${t.body.length}/${slot.maxLength})`)
      }
    })
  })

  const completionPct = totalTextSlots + totalMediaSlots > 0
    ? Math.round(((filledTextSlots + filledMediaSlots) / (totalTextSlots + totalMediaSlots)) * 100)
    : 100

  return { totalTextSlots, filledTextSlots, totalMediaSlots, filledMediaSlots, draftTexts, draftMedia, filesCount, textWarnings, completionPct }
}

export default function SectionCanvasEditor({
  section,
  sectionName,
  sectionId,
  onCreateText,
  onPatchText,
  onUploadMedia,
  onDeleteText,
  onDeleteMedia,
  onSwapTextOrder,
  onSwapMediaOrder,
  isUploading,
  onPublishMedia,
  isPublishingMedia,
  onPublishText,
  isPublishingText,
  onUploadR2File,
  isUploadingR2,
  onDownloadFile,
  onRemoveFile,
  onAssignFromGallery,
}: SectionCanvasEditorProps) {
  const config = getCanvasConfig(sectionName)

  const [showGuide, setShowGuide] = useState(false)
  const [showFiles, setShowFiles] = useState(false)

  // ── Estado de edición inline + SlotContext (extraído a useSlotEditing) ──
  const { ctx, galleryTarget, setGalleryTarget, handleGallerySelect } = useSlotEditing({
    section,
    sectionId,
    onCreateText,
    onPatchText,
    onUploadMedia,
    onDeleteText,
    onDeleteMedia,
    onSwapTextOrder,
    onSwapMediaOrder,
    isUploading,
    onPublishMedia,
    isPublishingMedia,
    onPublishText,
    isPublishingText,
    onUploadR2File,
    isUploadingR2,
    onDownloadFile,
    onRemoveFile,
    onAssignFromGallery,
  })

  // Stats
  const stats = useMemo(() => computeSlideStats(section, config), [section, config])

  if (!config) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
        No hay configuración de canvas para la sección "{sectionName}".
      </div>
    )
  }

  const LayoutComponent = LAYOUT_MAP[sectionName]
  const layoutDesc = LAYOUT_DESCRIPTIONS[sectionName]
  const files = section?.files ?? []
  const hasFiles = files.length > 0

  return (
    <div className="space-y-4">
      {/* ━━━ TOOLBAR ━━━ */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg">
        {/* Slide indicator */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 shadow-inner">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <span className="hidden sm:inline text-sm font-semibold text-white">{config.displayName}</span>
          <span className="sm:hidden text-xs font-semibold text-white">{config.displayName}</span>
        </div>

        <div className="hidden sm:block mx-2 h-4 w-px bg-slate-600" />

        {/* Completion */}
        {stats && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.completionPct === 100 ? 'bg-emerald-500' : stats.completionPct > 50 ? 'bg-teal-500' : 'bg-amber-500'
                }`}
                style={{ width: `${stats.completionPct}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400">{stats.completionPct}%</span>
          </div>
        )}

        <div className="flex-1" />

        {/* Actions */}
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            showGuide ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
          }`}
          title="Guía y consejos"
        >
          <span className="mr-1">📋</span> Guía
        </button>

        {sectionName === 'news' && (onUploadR2File || hasFiles) && (
          <button
            type="button"
            onClick={() => setShowFiles(!showFiles)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              showFiles ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
            title="Archivos adjuntos"
          >
            <span className="mr-1">📎</span> Archivos{hasFiles ? ` (${files.length})` : ''}
          </button>
        )}
      </div>

      {/* ━━━ GUIDE PANEL (collapsible) ━━━ */}
      {showGuide && (
        <SectionGuide guide={config.guide} displayName={config.displayName} />
      )}

      {/* ━━━ LAYOUT EXPLANATION ━━━ */}
      {layoutDesc && (
        <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
          <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-slate-200 text-[10px]">
            <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Composición del layout</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{layoutDesc}</p>
          </div>
        </div>
      )}

      {/* ━━━ UPLOAD INDICATORS ━━━ */}
      {(isUploading || isUploadingR2) && (
        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2.5 text-sm text-purple-700 shadow-sm">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {isUploading && 'Subiendo imagen...'}
          {isUploadingR2 && 'Subiendo archivo a R2...'}
        </div>
      )}

      {/* ━━━ SLIDE FRAME ━━━ */}
      <div className="group/slide relative">
        {/* Slide shadow (mimics PPT) */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-slate-200/60 via-slate-100/40 to-slate-200/60 blur-sm" />

        {/* Slide itself */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl">
          {/* Slide top edge (decorative) */}
          <div className="h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500" />

          {/* Slide header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-xs font-medium text-slate-500">{config.displayName}</p>
            </div>
            <p className="text-[10px] text-slate-400">Hacé clic en cualquier elemento para editar</p>
          </div>

          {/* Slide content */}
          <div className="p-5">
            {LayoutComponent ? (
              <LayoutComponent ctx={ctx} textSlots={config.textSlots} mediaSlots={config.mediaSlots} />
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-medium text-gray-500">Textos:</p>
                  {config.textSlots.map((slot) =>
                    slot.multiple ? (
                      <MultipleTextSlots key={slot.id} config={slot} ctx={ctx} className="mb-2" />
                    ) : (
                      <ConnectedTextSlot key={slot.id} config={slot} ctx={ctx} className="mb-2" />
                    ),
                  )}
                </div>
                {config.mediaSlots.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-gray-500">Media:</p>
                    {config.mediaSlots.map((slot) => (
                      <ConnectedMediaSlot key={slot.id} config={slot} ctx={ctx} className="mb-2" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ━━━ STATUS BAR ━━━ */}
      {stats && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
          {/* Content counters */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Contenido</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              stats.filledTextSlots === stats.totalTextSlots ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
            }`}>
              {stats.filledTextSlots}/{stats.totalTextSlots} textos
            </span>
            {stats.totalMediaSlots > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                stats.filledMediaSlots === stats.totalMediaSlots ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {stats.filledMediaSlots}/{stats.totalMediaSlots} imágenes
              </span>
            )}
            {stats.filesCount > 0 && (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                {stats.filesCount} archivos
              </span>
            )}
          </div>

          {/* Draft indicators */}
          {(stats.draftTexts > 0 || stats.draftMedia > 0) && (
            <>
              <div className="h-3 w-px bg-slate-300" />
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] text-amber-700">
                  {stats.draftTexts > 0 && `${stats.draftTexts} texto${stats.draftTexts > 1 ? 's' : ''} en borrador`}
                  {stats.draftTexts > 0 && stats.draftMedia > 0 && ' · '}
                  {stats.draftMedia > 0 && `${stats.draftMedia} imagen${stats.draftMedia > 1 ? 'es' : ''} en borrador`}
                </span>
              </div>
            </>
          )}

          {/* Text warnings */}
          {stats.textWarnings.length > 0 && (
            <>
              <div className="h-3 w-px bg-slate-300" />
              <div className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span className="text-[10px] text-amber-700">{stats.textWarnings[0]}</span>
                {stats.textWarnings.length > 1 && (
                  <span className="text-[10px] text-amber-500">+{stats.textWarnings.length - 1} más</span>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ━━━ FILES PANEL (R2) — Solo para novedades ━━━ */}
      {showFiles && sectionName === 'news' && (
        <FilesPanel
          files={files}
          sectionId={sectionId}
          onUpload={onUploadR2File}
          onDownload={onDownloadFile}
          onRemove={onRemoveFile}
          isUploading={isUploadingR2}
        />
      )}

      {/* ━━━ GALLERY PICKER MODAL ━━━ */}
      {galleryTarget && (
        <GalleryPicker
          onSelect={handleGallerySelect}
          onClose={() => setGalleryTarget(null)}
        />
      )}
    </div>
  )
}

// ── Files Panel Component ──

function FilesPanel({
  files,
  sectionId,
  onUpload,
  onDownload,
  onRemove,
  isUploading,
}: {
  files: import('../../models').FileContent[]
  sectionId: number
  onUpload?: (file: File, sectionId: number, role: string, order: number) => void
  onDownload?: (fileId: number) => void
  onRemove?: (fileId: number) => void
  isUploading?: boolean
}) {
  const formatSize = (bytes: number | null) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50/50 to-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100">
            <svg className="h-3.5 w-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-purple-900">Archivos adjuntos</h3>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">
            Subida directa a R2
          </span>
        </div>
        {onUpload && (
          <button
            type="button"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) onUpload(file, sectionId, 'attachment', files.length + 1)
              }
              input.click()
            }}
            disabled={isUploading}
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-purple-700 disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Subir archivo
          </button>
        )}
      </div>

      {/* Rate limit warning */}
      <div className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
        <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <span>Límite: 3 subidas cada 24 horas por IP. Los archivos se suben directamente a Cloudflare R2 (máx. 5 MB).</span>
      </div>

      {files.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/30 p-6 text-center">
          <svg className="mx-auto h-8 w-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="mt-2 text-xs text-purple-400">No hay archivos adjuntos en esta sección</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-lg border border-purple-100 bg-white p-3 transition-all hover:shadow-sm"
            >
              {/* Icon */}
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                f.state === 'UPLOADED' ? 'bg-emerald-100' : 'bg-amber-100'
              }`}>
                <svg className={`h-4 w-4 ${f.state === 'UPLOADED' ? 'text-emerald-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{f.title ?? `Archivo #${f.id}`}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>{formatSize(f.size)}</span>
                  <span className={`rounded-full px-1.5 py-0.5 font-medium ${
                    f.state === 'UPLOADED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {f.state === 'UPLOADED' ? 'Subido' : 'Pendiente'}
                  </span>
                  {f.role && <span className="text-slate-400">rol: {f.role}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1">
                {f.state === 'UPLOADED' && onDownload && (
                  <button
                    type="button"
                    onClick={() => onDownload(f.id)}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    title="Descargar"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </button>
                )}
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(f.id)}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Eliminar"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
