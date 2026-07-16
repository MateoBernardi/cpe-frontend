import { Link } from 'react-router-dom'
import { useAdminSectionViewModel, usePublishSection } from '../../viewmodels'
import { getSectionDisplayName } from '../../config/sectionRoles'
import SectionCanvasEditor from './SectionCanvasEditor'
import AboutHeroEditor from './AboutHeroEditor'
import { LoadingSpinner, ErrorMessage } from '@shared/components'

/** Secciones que se editan juntas en un único editor combinado (ver AboutHeroEditor). */
const MERGED_HERO_SECTIONS = new Set(['about', 'info_primary'])

interface SectionEditorProps {
  sectionId: number
}

export default function SectionEditor({ sectionId }: SectionEditorProps) {
  const {
    section,
    isLoading,
    error,
    submitError,
    uploadFile,
    isUploading,
    publishMedia,
    isPublishingMedia,
    publishText,
    isPublishingText,
    createSlotText,
    patchSlotText,
    removeText,
    removeMedia,
    // removeBlock — unused for now
    swapTextOrder,
    swapMediaOrder,
    uploadR2File,
    isUploadingR2,
    downloadFile,
    removeFile,
    assignFromGallery,
    swapError,
    clearSwapError,
    draftedBlockCount,
    refetch,
  } = useAdminSectionViewModel(sectionId)

  const publishMut = usePublishSection()

  if (isLoading) return <LoadingSpinner className="py-12" />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />

  const sectionName = section?.name ?? ''
  const displayName = getSectionDisplayName(sectionName)

  // "about" e "info_primary" se editan juntas en un único hero fusionado —
  // ver AboutHeroEditor. Ambos ids de /sections/:id siguen funcionando y
  // llevan al mismo editor combinado (con su propio header/publish).
  if (MERGED_HERO_SECTIONS.has(sectionName)) {
    return <AboutHeroEditor />
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">
            Editar: {displayName}
          </h2>
          {draftedBlockCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              {draftedBlockCount} borrador{draftedBlockCount > 1 ? 'es' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => publishMut.mutate(sectionId)}
            disabled={publishMut.isPending || draftedBlockCount === 0}
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
      {submitError && <ErrorMessage message={submitError} />}
      {swapError && <ErrorMessage message={swapError} onRetry={clearSwapError} />}
      {publishMut.isError && <ErrorMessage message="Error al publicar la sección" />}

      {/* ── Canvas visual del editor ── */}
      <SectionCanvasEditor
        section={section}
        sectionName={sectionName}
        sectionId={sectionId}
        onCreateText={createSlotText}
        onPatchText={patchSlotText}
        onUploadMedia={uploadFile}
        onDeleteText={(blockId, textId) => { if (confirm('¿Eliminar este texto?')) removeText(blockId, textId) }}
        onDeleteMedia={(blockId) => { if (confirm('¿Eliminar este archivo?')) removeMedia(blockId) }}
        onSwapTextOrder={swapTextOrder}
        onSwapMediaOrder={swapMediaOrder}
        isUploading={isUploading}
        onPublishMedia={publishMedia}
        isPublishingMedia={isPublishingMedia}
        onPublishText={publishText}
        isPublishingText={isPublishingText}
        onUploadR2File={uploadR2File}
        isUploadingR2={isUploadingR2}
        onDownloadFile={downloadFile}
        onRemoveFile={(id) => { if (confirm('¿Eliminar este archivo?')) removeFile(id) }}
        onAssignFromGallery={assignFromGallery}
      />
    </div>
  )
}
