import { useCallback, useRef, useState, type DragEvent } from 'react'
import { getSectionRoles } from '../../config/sectionRoles'

interface MediaUploadItem {
  file: File
  preview: string
  order: number
  role: string
}

interface MediaEditorProps {
  sectionName: string
  sectionId: number
  onUpload: (file: File, sectionId: number, role: string, order: number) => void
  isUploading: boolean
}

/**
 * Editor de media con drag & drop y file picker.
 * Extrae mime_type automáticamente del File.
 * Título auto-generado: fecha + ID random.
 * El usuario sólo elige orden (y opcionalmente rol).
 */
export default function MediaEditor({ sectionName, sectionId, onUpload, isUploading }: MediaEditorProps) {
  const roles = getSectionRoles(sectionName)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<MediaUploadItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: MediaUploadItem[] = Array.from(files).map((file, i) => ({
      file,
      preview: URL.createObjectURL(file),
      order: items.length + i,
      role: roles.defaultMediaRole,
    }))
    setItems((prev) => [...prev, ...newItems])
  }, [items.length, roles.defaultMediaRole])

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragOver(true) }
  const handleDragLeave = () => setIsDragOver(false)

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ''
  }

  const removeItem = (index: number) => {
    setItems((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const updateItem = (index: number, field: 'order' | 'role', value: string | number) => {
    setItems((prev) => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    ))
  }

  const uploadAll = () => {
    for (const item of items) {
      onUpload(item.file, sectionId, item.role, item.order)
    }
    // Limpiar previews
    items.forEach((item) => URL.revokeObjectURL(item.preview))
    setItems([])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Media</h3>
        {items.length > 0 && (
          <button
            type="button"
            onClick={uploadAll}
            disabled={isUploading}
            className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {isUploading ? 'Subiendo...' : `Subir ${items.length} archivo(s)`}
          </button>
        )}
      </div>

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="mt-2 text-sm text-gray-500">
          Arrastrá archivos acá o <span className="font-medium text-blue-600">hacé clic para seleccionar</span>
        </p>
        <p className="mt-1 text-xs text-gray-400">Imágenes, videos y otros archivos multimedia</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Items pendientes de subida */}
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          {/* Preview */}
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
            {item.file.type.startsWith('image/') ? (
              <img src={item.preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                {item.file.type.split('/')[1]?.toUpperCase() ?? 'FILE'}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-1">
            <p className="text-xs text-gray-500 truncate">{item.file.name} ({(item.file.size / 1024).toFixed(0)} KB)</p>
            <p className="text-xs text-gray-400">Tipo: {item.file.type}</p>
            <div className="flex gap-2">
              <select
                value={item.role}
                onChange={(e) => updateItem(index, 'role', e.target.value)}
                className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
              >
                {roles.mediaRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <input
                type="number"
                value={item.order}
                onChange={(e) => updateItem(index, 'order', parseInt(e.target.value, 10) || 0)}
                className="w-16 rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                placeholder="Orden"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeItem(index)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      ))}

      {items.length === 0 && (
        <p className="text-center text-sm text-gray-400">No hay media pendiente</p>
      )}
    </div>
  )
}
