/**
 * GalleryPicker — modal overlay para seleccionar una imagen de la galería
 * y asignarla a un slot de media en el canvas editor.
 *
 * Se abre desde InlineMediaSlot cuando el usuario hace clic en "Galería".
 * Al seleccionar una imagen se llama onSelect con el mediaId.
 */

import { useState, useMemo } from 'react'
import { useGalleryList } from '../../viewmodels'
import type { GalleryMedia } from '../../viewmodels'

interface GalleryPickerProps {
  /** Llamado cuando el usuario selecciona una imagen */
  onSelect: (media: GalleryMedia) => void
  onClose: () => void
}

export default function GalleryPicker({ onSelect, onClose }: GalleryPickerProps) {
  const { data: gallery, isLoading } = useGalleryList()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    const items = gallery ?? []
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(
      (m) =>
        m.title?.toLowerCase().includes(q) ||
        m.mimeType?.toLowerCase().includes(q),
    )
  }, [gallery, search])

  const selected = filtered.find((m) => m.id === selectedId)

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Seleccionar de la galería</h3>
            <p className="text-xs text-gray-500">
              {filtered.length} imagen{filtered.length !== 1 ? 'es' : ''} disponible{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-100 px-5 py-3">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título o tipo…"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-400">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <p className="mt-2 text-sm">No hay imágenes disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filtered.map((m) => {
                const isSelected = m.id === selectedId
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedId(isSelected ? null : m.id)}
                    className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/30'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    {m.mimeType?.startsWith('image/') ? (
                      <img
                        src={m.url}
                        alt={m.title ?? ''}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-100 text-xs text-gray-400">
                        {m.mimeType?.split('/')[1]?.toUpperCase() ?? 'ARCHIVO'}
                      </div>
                    )}

                    {/* Selected check */}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-teal-600/20">
                        <div className="rounded-full bg-teal-600 p-1.5 shadow-lg">
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Hover title */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="truncate text-[10px] font-medium text-white">
                        {m.title ?? 'Sin título'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
          <p className="text-xs text-gray-500">
            {selectedId ? `Seleccionada: ${selected?.title ?? `ID ${selectedId}`}` : 'Ninguna seleccionada'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedId}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Usar imagen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
