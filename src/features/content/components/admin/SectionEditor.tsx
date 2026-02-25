import { Link } from 'react-router-dom'
import { useAdminSectionViewModel } from '../../viewmodels'
import { getSectionDisplayName } from '../../config/sectionRoles'
import SectionCanvasEditor from './SectionCanvasEditor'
import { LoadingSpinner, ErrorMessage } from '@shared/components'

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
    editText,
    createSlotText,
    removeText,
    removeMedia,
    swapTextOrder,
    swapMediaOrder,
    uploadR2File,
    isUploadingR2,
    downloadFile,
    removeFile,
    refetch,
  } = useAdminSectionViewModel(sectionId)

  if (isLoading) return <LoadingSpinner className="py-12" />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />

  const sectionName = section?.name ?? ''
  const displayName = getSectionDisplayName(sectionName)

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          Editar: {displayName}
        </h2>
        <Link
          to="/preview"
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Previsualizar sitio →
        </Link>
      </div>

      {submitError && <ErrorMessage message={submitError} />}

      {/* ── Canvas visual del editor ── */}
      <SectionCanvasEditor
        section={section}
        sectionName={sectionName}
        sectionId={sectionId}
        onEditText={editText}
        onCreateText={createSlotText}
        onUploadMedia={uploadFile}
        onDeleteText={(id) => { if (confirm('¿Eliminar este texto?')) removeText(id) }}
        onDeleteMedia={(id) => { if (confirm('¿Eliminar este archivo?')) removeMedia(id) }}
        onSwapTextOrder={swapTextOrder}
        onSwapMediaOrder={swapMediaOrder}
        isUploading={isUploading}
        onPublishMedia={publishMedia}
        isPublishingMedia={isPublishingMedia}
        onUploadR2File={uploadR2File}
        isUploadingR2={isUploadingR2}
        onDownloadFile={downloadFile}
        onRemoveFile={(id) => { if (confirm('¿Eliminar este archivo?')) removeFile(id) }}
      />
    </div>
  )
}
