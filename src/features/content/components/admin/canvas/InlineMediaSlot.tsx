/**
 * Slot inline de media — muestra imágenes existentes, zona de upload,
 * y permite reemplazar/eliminar contenido.
 *
 * Mejoras:  
 * - Lazy loading en imágenes
 * - Skeleton de carga
 * - Fallback de error
 * - Botón "Cambiar" para slots no-múltiples con contenido existente
 */

import { useState, useRef, type DragEvent } from 'react'
import type { MediaSlotProps } from './canvasTypes'

export default function InlineMediaSlot({
  config,
  mediaItems,
  onUpload,
  onDelete,
  onPublish,
  isPublishing,
  onPickFromGallery,
  className = '',
}: MediaSlotProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const replaceRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set(mediaItems.map((m) => m.id)))
  const [errorImages, setErrorImages] = useState<Set<number>>(new Set())
  const [replacingId, setReplacingId] = useState<number | null>(null)

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    // Respetar maxItems
    if (config.maxItems && !config.multiple) return // slot único ya tiene contenido
    if (config.multiple) {
      const remaining = config.maxItems ? config.maxItems - mediaItems.length : files.length
      Array.from(files).slice(0, Math.max(0, remaining)).forEach((f) => onUpload(f))
    } else if (files[0]) {
      onUpload(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    if (config.multiple) {
      const remaining = config.maxItems ? config.maxItems - mediaItems.length : files.length
      Array.from(files).slice(0, Math.max(0, remaining)).forEach((f) => onUpload(f))
    } else if (files[0]) {
      onUpload(files[0])
    }
    e.target.value = ''
  }

  const handleReplaceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || replacingId === null) return
    // Eliminar la imagen vieja, luego subir la nueva
    onDelete(replacingId)
    onUpload(file)
    setReplacingId(null)
    e.target.value = ''
  }

  const startReplace = (mediaId: number) => {
    setReplacingId(mediaId)
    // Usar setTimeout para que React procese el setReplacingId antes de click
    setTimeout(() => replaceRef.current?.click(), 0)
  }

  const onImageLoad = (id: number) => {
    setLoadingImages((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const onImageError = (id: number) => {
    setLoadingImages((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setErrorImages((prev) => new Set(prev).add(id))
  }

  // ── Con contenido existente ──
  if (mediaItems.length > 0) {
    const atMaxItems = config.maxItems != null && mediaItems.length >= config.maxItems
    const canAddMore = config.multiple && !atMaxItems

    return (
      <div className={className}>
        <div className="flex flex-wrap gap-2">
          {mediaItems.map((m) => (
            <div key={m.id} className="group relative">
              {m.mimeType?.startsWith('image/') ? (
                <div className="relative">
                  {/* Skeleton de carga */}
                  {loadingImages.has(m.id) && (
                    <div
                      className="absolute inset-0 animate-pulse rounded-lg bg-slate-200"
                      style={config.aspect ? { aspectRatio: config.aspect } : { height: '6rem', width: '10rem' }}
                    />
                  )}
                  {/* Error fallback */}
                  {errorImages.has(m.id) ? (
                    <div
                      className="flex items-center justify-center rounded-lg bg-red-50 ring-1 ring-red-200"
                      style={config.aspect ? { aspectRatio: config.aspect, height: '6rem' } : { height: '6rem', width: '10rem' }}
                    >
                      <div className="text-center">
                        <svg className="mx-auto h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <p className="mt-1 text-[10px] text-red-500">Error al cargar</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={m.url}
                      alt=""
                      loading="lazy"
                      onLoad={() => onImageLoad(m.id)}
                      onError={() => onImageError(m.id)}
                      className={`h-24 w-auto max-w-[160px] rounded-lg object-cover ring-1 ring-slate-200 transition-opacity duration-300 ${
                        loadingImages.has(m.id) ? 'opacity-0' : 'opacity-100'
                      }`}
                      style={config.aspect ? { aspectRatio: config.aspect } : undefined}
                    />
                  )}
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-500 ring-1 ring-slate-200">
                  {m.mimeType?.split('/')[1]?.toUpperCase() ?? 'ARCHIVO'}
                </div>
              )}
              {/* Status badge */}
              {m.status && (
                <div className="absolute left-1 top-1">
                  {m.status === 'DRAFTED' ? (
                    <span className="flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      Borrador
                    </span>
                  ) : m.status === 'PUBLISHED' ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm">
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Publicada
                    </span>
                  ) : null}
                </div>
              )}

              {/* Controles de hover */}
              <div className="absolute -right-1.5 -top-1.5 hidden gap-1 group-hover:flex">
                {/* Botón publicar (solo para DRAFTED) */}
                {onPublish && m.status === 'DRAFTED' && (
                  <button
                    type="button"
                    onClick={() => onPublish(m.id, m.blockId)}
                    disabled={isPublishing}
                    className="rounded-full bg-emerald-500 p-1 shadow transition-colors hover:bg-emerald-600 disabled:opacity-50"
                    title="Publicar imagen"
                  >
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                )}
                {/* Botón cambiar (solo para slots no-múltiples, o siempre disponible) */}
                {!config.multiple && (
                  <button
                    type="button"
                    onClick={() => startReplace(m.id)}
                    className="rounded-full bg-blue-500 p-1 shadow"
                    title="Cambiar imagen"
                  >
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { if (confirm('¿Eliminar este archivo?')) onDelete(m.id) }}
                  className="rounded-full bg-red-500 p-1 shadow"
                  title="Eliminar"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {/* Botón agregar (para slots múltiples, si no se alcanzó el límite) */}
          {canAddMore && (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-purple-400 hover:bg-purple-50 hover:text-purple-500"
                title="Subir archivo"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
              {onPickFromGallery && (
                <button
                  type="button"
                  onClick={onPickFromGallery}
                  className="rounded-md bg-teal-50 px-2 py-1 text-[10px] font-medium text-teal-700 ring-1 ring-teal-200 transition-colors hover:bg-teal-100"
                >
                  Galería
                </button>
              )}
            </div>
          )}
        </div>
        {/* Info de límite + recomendación */}
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          {config.maxItems != null && (
            <p className={`text-[10px] font-medium ${atMaxItems ? 'text-amber-600' : 'text-gray-400'}`}>
              {atMaxItems
                ? `Límite alcanzado: esta sección admite ${config.maxItems === 1 ? 'solo 1 imagen' : `hasta ${config.maxItems} imágenes`}.`
                : `${mediaItems.length}/${config.maxItems} ${config.maxItems === 1 ? 'imagen' : 'imágenes'}`}
            </p>
          )}
          {config.recommendedSize && (
            <p className="text-[10px] text-gray-400">Tamaño recomendado: {config.recommendedSize}</p>
          )}
        </div>
        {/* File input para agregar */}
        <input ref={fileRef} type="file" accept="image/*,video/*" multiple={config.multiple} className="hidden" onChange={handleFileInput} />
        {/* File input para reemplazar */}
        <input ref={replaceRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleReplaceInput} />
      </div>
    )
  }

  // ── Vacío — zona de upload ──
  return (
    <div className={className}>
      <div
        className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all ${
          isDragOver
            ? 'border-purple-400 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/30'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
        </svg>
        <p className="mt-2 text-xs font-medium text-gray-500">{config.label}</p>
        {config.isBackground && <p className="text-[10px] text-gray-400">Imagen de fondo</p>}
        {config.maxItems != null && (
          <p className="mt-0.5 text-[10px] text-gray-400">
            {config.maxItems === 1 ? 'Esta sección admite solo 1 imagen' : `Esta sección admite hasta ${config.maxItems} imágenes`}
          </p>
        )}
        {config.recommendedSize && (
          <p className="mt-0.5 text-[10px] text-gray-400">Recomendado: {config.recommendedSize}</p>
        )}
        <input ref={fileRef} type="file" accept="image/*,video/*" multiple={config.multiple} className="hidden" onChange={handleFileInput} />
      </div>
      {onPickFromGallery && (
        <button
          type="button"
          onClick={onPickFromGallery}
          className="mt-2 w-full rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100"
        >
          O elegir de la galería
        </button>
      )}
    </div>
  )
}
