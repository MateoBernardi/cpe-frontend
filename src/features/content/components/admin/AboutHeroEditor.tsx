/**
 * AboutHeroEditor — editor combinado para el hero fusionado "Quiénes somos".
 *
 * El hero público (`AboutHeroSection`) mezcla, solo a nivel de render, dos
 * secciones backend separadas: `about` (eyebrow + equipo) e `info_primary`
 * (diagrama + título + viñetas). Acá se editan ambas en una única diapositiva
 * para que el equipo de contenido no tenga que saltar entre dos pantallas.
 *
 * Se resuelven ambos ids con `useSectionsList`, se cargan ambas secciones con
 * `useAdminSectionViewModel` (dos llamadas de hook fijas — no condicionales) y
 * se arma un `ctx` por sección con `useSlotEditing`. `AboutHeroLayout` conecta
 * cada slot al `ctx` de SU sección dueña.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useSectionsList,
  useAdminSectionViewModel,
  usePublishChanges,
} from '../../viewmodels'
import { getCanvasConfig } from '../../config/sectionCanvasConfig'
import { LoadingSpinner, ErrorMessage } from '@shared/components'
import SectionGuide from './SectionGuide'
import GalleryPicker from './GalleryPicker'
import { useSlotEditing } from './useSlotEditing'
import { AboutHeroLayout } from './canvas'

export default function AboutHeroEditor() {
  const { data: sectionsList, isLoading: listLoading, error: listError } = useSectionsList()

  const aboutId = sectionsList?.find((s) => s.name === 'about')?.id ?? 0
  const infoId = sectionsList?.find((s) => s.name === 'info_primary')?.id ?? 0

  // ── Dos llamadas fijas al viewmodel — una por sección ──
  const about = useAdminSectionViewModel(aboutId)
  const info = useAdminSectionViewModel(infoId)

  const aboutEditing = useSlotEditing({
    section: about.section,
    sectionId: aboutId,
    onCreateText: about.createSlotText,
    onPatchText: about.patchSlotText,
    onUploadMedia: about.uploadFile,
    onDeleteText: (blockId, textId) => { if (confirm('¿Eliminar este texto?')) about.removeText(blockId, textId) },
    onDeleteMedia: (blockId) => { if (confirm('¿Eliminar este archivo?')) about.removeMedia(blockId) },
    onSwapTextOrder: about.swapTextOrder,
    onSwapMediaOrder: about.swapMediaOrder,
    isUploading: about.isUploading,
    onPublishMedia: about.publishMedia,
    isPublishingMedia: about.isPublishingMedia,
    onPublishText: about.publishText,
    isPublishingText: about.isPublishingText,
    onUploadR2File: about.uploadR2File,
    isUploadingR2: about.isUploadingR2,
    onDownloadFile: about.downloadFile,
    onRemoveFile: (id) => { if (confirm('¿Eliminar este archivo?')) about.removeFile(id) },
    onAssignFromGallery: about.assignFromGallery,
  })

  const infoEditing = useSlotEditing({
    section: info.section,
    sectionId: infoId,
    onCreateText: info.createSlotText,
    onPatchText: info.patchSlotText,
    onUploadMedia: info.uploadFile,
    onDeleteText: (blockId, textId) => { if (confirm('¿Eliminar este texto?')) info.removeText(blockId, textId) },
    onDeleteMedia: (blockId) => { if (confirm('¿Eliminar este archivo?')) info.removeMedia(blockId) },
    onSwapTextOrder: info.swapTextOrder,
    onSwapMediaOrder: info.swapMediaOrder,
    isUploading: info.isUploading,
    onPublishMedia: info.publishMedia,
    isPublishingMedia: info.isPublishingMedia,
    onPublishText: info.publishText,
    isPublishingText: info.isPublishingText,
    onUploadR2File: info.uploadR2File,
    isUploadingR2: info.isUploadingR2,
    onDownloadFile: info.downloadFile,
    onRemoveFile: (id) => { if (confirm('¿Eliminar este archivo?')) info.removeFile(id) },
    onAssignFromGallery: info.assignFromGallery,
  })

  const publishMut = usePublishChanges()
  const [showGuide, setShowGuide] = useState<'about' | 'info_primary' | null>(null)

  if (listLoading) return <LoadingSpinner className="py-12" />
  if (listError) return <ErrorMessage message="Error cargando secciones" />
  if (aboutId === 0 || infoId === 0) {
    return <ErrorMessage message='No se encontraron las secciones "about" / "info_primary".' />
  }
  if (about.error) return <ErrorMessage message={about.error} onRetry={about.refetch} />
  if (info.error) return <ErrorMessage message={info.error} onRetry={info.refetch} />
  // Todavía no llegaron los datos de alguna de las dos secciones
  if (!about.section || !info.section) return <LoadingSpinner className="py-12" />

  const aboutConfig = getCanvasConfig('about')
  const infoConfig = getCanvasConfig('info_primary')
  if (!aboutConfig || !infoConfig) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
        No hay configuración de canvas para "about" / "info_primary".
      </div>
    )
  }

  const draftedTotal = about.draftedBlockCount + info.draftedBlockCount

  const handlePublish = () => {
    const idsToPublish = [
      about.draftedBlockCount > 0 ? aboutId : null,
      info.draftedBlockCount > 0 ? infoId : null,
    ].filter((id): id is number => id != null)
    if (idsToPublish.length > 0) publishMut.mutate(idsToPublish)
  }

  // Solo puede haber un gallery target activo entre las dos secciones a la vez
  const activeGallery = aboutEditing.galleryTarget
    ? { editing: aboutEditing }
    : infoEditing.galleryTarget
      ? { editing: infoEditing }
      : null

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">
            Editar: Portada — Quiénes somos
          </h2>
          {draftedTotal > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              {draftedTotal} borrador{draftedTotal > 1 ? 'es' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishMut.isPending || draftedTotal === 0}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {publishMut.isPending ? 'Publicando…' : 'Publicar cambios'}
          </button>
          <Link
            to="/preview"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Previsualizar sitio →
          </Link>
        </div>
      </div>

      {about.submitError && <ErrorMessage message={about.submitError} />}
      {info.submitError && <ErrorMessage message={info.submitError} />}
      {about.swapError && <ErrorMessage message={about.swapError} onRetry={about.clearSwapError} />}
      {info.swapError && <ErrorMessage message={info.swapError} onRetry={info.clearSwapError} />}
      {publishMut.isError && <ErrorMessage message="Error al publicar la sección" />}

      {/* ── Nota: esta pantalla combina 2 secciones backend ── */}
      <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
        <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-slate-200 text-[10px]">
          <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Composición del layout</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            Este hero fusiona dos secciones del backend: "Nosotros" (eyebrow + equipo) e "Información
            Principal" (diagrama + título + viñetas). Se editan y publican juntas desde esta pantalla.
          </p>
        </div>
      </div>

      {/* ── Guías de cada sección ── */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowGuide(showGuide === 'about' ? null : 'about')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            showGuide === 'about' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          📋 Guía: Nosotros
        </button>
        <button
          type="button"
          onClick={() => setShowGuide(showGuide === 'info_primary' ? null : 'info_primary')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            showGuide === 'info_primary' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          📋 Guía: Información Principal
        </button>
      </div>
      {showGuide === 'about' && <SectionGuide guide={aboutConfig.guide} displayName={aboutConfig.displayName} />}
      {showGuide === 'info_primary' && <SectionGuide guide={infoConfig.guide} displayName={infoConfig.displayName} />}

      {/* ━━━ SLIDE FRAME ━━━ */}
      <div className="group/slide relative">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-slate-200/60 via-slate-100/40 to-slate-200/60 blur-sm" />
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl">
          <div className="h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500" />
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-xs font-medium text-slate-500">Portada — Quiénes somos</p>
            </div>
            <p className="text-[10px] text-slate-400">Hacé clic en cualquier elemento para editar</p>
          </div>
          <div className="p-5">
            <AboutHeroLayout
              aboutCtx={aboutEditing.ctx}
              aboutTextSlots={aboutConfig.textSlots}
              aboutMediaSlots={aboutConfig.mediaSlots}
              infoCtx={infoEditing.ctx}
              infoTextSlots={infoConfig.textSlots}
              infoMediaSlots={infoConfig.mediaSlots}
            />
          </div>
        </div>
      </div>

      {/* ━━━ GALLERY PICKER MODAL — solo una activa a la vez ━━━ */}
      {activeGallery && (
        <GalleryPicker
          onSelect={activeGallery.editing.handleGallerySelect}
          onClose={() => activeGallery.editing.setGalleryTarget(null)}
        />
      )}
    </div>
  )
}
