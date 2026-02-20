import type { CreateTextInput } from '../../dtos'
import { getSectionRoles, getRoleDisplayName } from '../../config/sectionRoles'

interface TextEditorProps {
  texts: CreateTextInput[]
  onChange: (texts: CreateTextInput[]) => void
  sectionName: string
  /** Cantidad de textos ya existentes en la sección (para calcular orden) */
  existingCount?: number
}

export default function TextEditor({ texts, onChange, sectionName, existingCount = 0 }: TextEditorProps) {
  const roles = getSectionRoles(sectionName)

  const addText = () => {
    const nextOrder = existingCount + texts.length + 1
    onChange([...texts, {
      body: '',
      role: roles.textRoles[0],
      order: nextOrder,
      status: 'DRAFT',
    }])
  }

  const updateText = (index: number, field: keyof CreateTextInput, value: string | number) => {
    const updated = texts.map((t, i) =>
      i === index ? { ...t, [field]: value } : t,
    )
    onChange(updated)
  }

  const removeText = (index: number) => {
    // Re-calcular órdenes después de eliminar
    const filtered = texts.filter((_, i) => i !== index)
    const reordered = filtered.map((t, i) => ({
      ...t,
      order: existingCount + i + 1,
    }))
    onChange(reordered)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {texts.length > 0 ? `${texts.length} texto(s) por crear` : 'Sin textos nuevos'}
        </span>
        <button
          type="button"
          onClick={addText}
          className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
        >
          + Agregar texto
        </button>
      </div>

      {texts.map((text, index) => (
        <div key={index} className="space-y-3 rounded-lg border border-blue-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Nuevo texto #{index + 1}</span>
            <button
              type="button"
              onClick={() => removeText(index)}
              className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
            >
              Eliminar
            </button>
          </div>

          <textarea
            placeholder="Escribí el contenido del texto..."
            value={text.body}
            onChange={(e) => updateText(index, 'body', e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={text.role ?? roles.textRoles[0]}
              onChange={(e) => updateText(index, 'role', e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {roles.textRoles.map((r) => (
                <option key={r} value={r}>{getRoleDisplayName(r)}</option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              placeholder="Orden"
              value={text.order ?? existingCount + index + 1}
              onChange={(e) => updateText(index, 'order', parseInt(e.target.value, 10) || 1)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-24"
            />
          </div>
        </div>
      ))}

      {texts.length === 0 && (
        <p className="text-center text-sm text-gray-400">Presioná "+ Agregar texto" para crear uno nuevo</p>
      )}
    </div>
  )
}
