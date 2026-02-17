import type { CreateTextInput } from '../../dtos'
import { getSectionRoles } from '../../config/sectionRoles'

interface TextEditorProps {
  texts: CreateTextInput[]
  onChange: (texts: CreateTextInput[]) => void
  sectionName: string
}

export default function TextEditor({ texts, onChange, sectionName }: TextEditorProps) {
  const roles = getSectionRoles(sectionName)

  const addText = () => {
    onChange([...texts, {
      body: '',
      title: '',
      role: roles.defaultTextRole,
      order: texts.length,
      status: 'PUBLISHED',
    }])
  }

  const updateText = (index: number, field: keyof CreateTextInput, value: string | number) => {
    const updated = texts.map((t, i) =>
      i === index ? { ...t, [field]: value } : t,
    )
    onChange(updated)
  }

  const removeText = (index: number) => {
    onChange(texts.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Textos</h3>
        <button
          type="button"
          onClick={addText}
          className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
        >
          + Agregar texto
        </button>
      </div>

      {texts.map((text, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Texto #{index + 1}</span>
            <button
              type="button"
              onClick={() => removeText(index)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Eliminar
            </button>
          </div>

          <textarea
            placeholder="Cuerpo del texto *"
            value={text.body}
            onChange={(e) => updateText(index, 'body', e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <div className="flex gap-2">
            <select
              value={text.role ?? roles.defaultTextRole}
              onChange={(e) => updateText(index, 'role', e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {roles.textRoles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Orden"
              value={text.order ?? 0}
              onChange={(e) => updateText(index, 'order', parseInt(e.target.value, 10) || 0)}
              className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      ))}

      {texts.length === 0 && (
        <p className="text-center text-sm text-gray-400">No hay textos agregados</p>
      )}
    </div>
  )
}
