/**
 * Slot inline de texto — permite editar un texto haciendo clic.
 * Muestra el texto existente, un editor inline al editar, o un placeholder vacío.
 */

import type { TextSlotProps } from './canvasTypes'

const DISPLAY_STYLES: Record<string, string> = {
  heading: 'text-xl font-bold text-slate-900',
  subheading: 'text-base font-medium text-slate-600',
  body: 'text-sm leading-relaxed text-slate-700',
  label: 'text-sm font-medium text-slate-600',
  cta: 'text-sm font-semibold text-teal-700',
  bullet: 'text-sm text-slate-700',
}

export default function InlineTextSlot({
  config,
  text,
  isEditing,
  editValue,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onChangeValue,
  onDelete,
  className = '',
}: TextSlotProps) {
  const textStyle = DISPLAY_STYLES[config.display] || DISPLAY_STYLES.body

  // ── Character limit helpers ──
  const charPct = config.maxLength ? (editValue.length / config.maxLength) * 100 : 0
  const charColor =
    charPct >= 100 ? 'bg-red-500' :
    charPct >= 90  ? 'bg-amber-500' :
    charPct >= 70  ? 'bg-yellow-400' :
                     'bg-emerald-500'
  const charTextColor =
    charPct >= 100 ? 'text-red-600 font-semibold' :
    charPct >= 90  ? 'text-amber-600 font-medium' :
                     'text-slate-400'

  // ── Modo edición ──
  if (isEditing) {
    return (
      <div className={`relative ${className}`}>
        <div className="rounded-xl border-2 border-blue-400 bg-white shadow-xl ring-4 ring-blue-100/50">
          {/* Editor header */}
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-1.5 rounded-t-[10px]">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{config.label}</span>
            {config.display === 'heading' && (
              <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-medium text-indigo-600">Título principal</span>
            )}
            {config.display === 'cta' && (
              <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[9px] font-medium text-teal-600">Botón CTA</span>
            )}
          </div>

          {/* Textarea */}
          <div className="p-2">
            <textarea
              value={editValue}
              onChange={(e) => onChangeValue(e.target.value)}
              className="w-full resize-none rounded-lg border-0 px-2 py-1.5 text-sm focus:outline-none focus:ring-0"
              rows={config.display === 'heading' ? 2 : config.display === 'bullet' || config.display === 'label' ? 1 : 3}
              autoFocus
              placeholder={config.placeholder}
              maxLength={config.maxLength}
            />
          </div>

          {/* Character limit progress bar */}
          {config.maxLength && (
            <div className="px-3 pb-1">
              <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${charColor}`}
                  style={{ width: `${Math.min(100, charPct)}%` }}
                />
              </div>
              <div className="mt-0.5 flex items-center justify-between">
                <span className={`text-[10px] ${charTextColor}`}>
                  {editValue.length}/{config.maxLength}
                </span>
                {charPct >= 90 && charPct < 100 && (
                  <span className="text-[10px] text-amber-500">⚠ Cerca del límite</span>
                )}
                {charPct >= 100 && (
                  <span className="text-[10px] text-red-500">⛔ Límite alcanzado</span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 bg-slate-50/50 rounded-b-[10px]">
            <div className="flex items-center gap-2">
              {config.display === 'heading' && (
                <span className="text-[10px] text-slate-400">💡 Usá frases cortas e impactantes</span>
              )}
              {config.display === 'body' && (
                <span className="text-[10px] text-slate-400">💡 Sé conciso, evitá párrafos largos</span>
              )}
              {config.display === 'cta' && (
                <span className="text-[10px] text-slate-400">💡 2-4 palabras de acción (ej. "Contactanos")</span>
              )}
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onSaveEdit}
                disabled={!editValue.trim()}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-40"
              >
                ✓ Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Texto existente ──
  if (text) {
    return (
      <div
        className={`group relative cursor-pointer rounded-md px-2 py-1 transition-all hover:bg-blue-50 hover:ring-2 hover:ring-blue-200 ${className}`}
        onClick={onStartEdit}
        title="Clic para editar"
      >
        <span className={textStyle}>{text.body}</span>
        {text.status === 'DRAFTED' && (
          <span className="ml-2 inline-flex rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
            Borrador
          </span>
        )}
        <span className="absolute -right-1 -top-1 hidden rounded-full bg-blue-600 p-1 shadow-sm group-hover:inline-flex">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </span>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); if (confirm('¿Eliminar este texto?')) onDelete() }}
            className="absolute -bottom-1 -right-1 hidden rounded-full bg-red-500 p-1 shadow-sm group-hover:inline-flex"
          >
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    )
  }

  // ── Placeholder vacío ──
  // Para labels de formulario, mostramos el valor por defecto que el sitio usa
  const isFormLabel = config.role.startsWith('label_')

  return (
    <div
      className={`cursor-pointer rounded-lg border-2 border-dashed px-3 py-2.5 transition-all hover:border-blue-400 hover:bg-blue-50/40 ${
        isFormLabel ? 'border-teal-300 bg-teal-50/30' : 'border-gray-300'
      } ${className}`}
      onClick={onStartEdit}
      title={`Clic para agregar: ${config.label}`}
    >
      {isFormLabel ? (
        <div className="text-center">
          <span className="text-sm font-medium text-teal-700">{config.placeholder}</span>
          <span className="ml-1.5 text-[10px] text-teal-500">(por defecto)</span>
          <p className="mt-0.5 text-[10px] text-gray-400 italic">Clic para personalizar</p>
        </div>
      ) : (
        <span className="text-xs text-gray-400 italic">{config.label}</span>
      )}
    </div>
  )
}
