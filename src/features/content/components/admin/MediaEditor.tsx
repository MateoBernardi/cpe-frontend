import type { CreateMediaInput } from '../../dtos'

interface MediaEditorProps {
  media: CreateMediaInput[]
  onChange: (media: CreateMediaInput[]) => void
}

const emptyMedia: CreateMediaInput = {
  title: '',
  media_url: '',
  mime_type: '',
  role: '',
  order: 0,
  origin: 'ADMIN',
}

export default function MediaEditor({ media, onChange }: MediaEditorProps) {
  const addMedia = () => {
    onChange([...media, { ...emptyMedia, order: media.length }])
  }

  const updateMedia = (index: number, field: keyof CreateMediaInput, value: string | number) => {
    const updated = media.map((m, i) =>
      i === index ? { ...m, [field]: value } : m,
    )
    onChange(updated)
  }

  const removeMedia = (index: number) => {
    onChange(media.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Media</h3>
        <button
          type="button"
          onClick={addMedia}
          className="rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
        >
          + Agregar media
        </button>
      </div>

      {media.map((item, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Media #{index + 1}</span>
            <button
              type="button"
              onClick={() => removeMedia(index)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Eliminar
            </button>
          </div>

          <input
            type="text"
            placeholder="Título (opcional)"
            value={item.title ?? ''}
            onChange={(e) => updateMedia(index, 'title', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <input
            type="url"
            placeholder="URL del media *"
            value={item.media_url}
            onChange={(e) => updateMedia(index, 'media_url', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="MIME type (ej: image/jpeg)"
              value={item.mime_type ?? ''}
              onChange={(e) => updateMedia(index, 'mime_type', e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Rol (ej: background)"
              value={item.role ?? ''}
              onChange={(e) => updateMedia(index, 'role', e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Orden"
              value={item.order ?? 0}
              onChange={(e) => updateMedia(index, 'order', parseInt(e.target.value, 10) || 0)}
              className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      ))}

      {media.length === 0 && (
        <p className="text-center text-sm text-gray-400">No hay media agregado</p>
      )}
    </div>
  )
}
