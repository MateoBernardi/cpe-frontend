/**
 * Slots conectados al contexto de edición del canvas.
 * - ConnectedTextSlot: enlaza un TextSlotConfig con el texto existente.
 * - ConnectedMediaSlot: enlaza un MediaSlotConfig con los media existentes.
 * - MultipleTextSlots: maneja N textos con el mismo rol + reorden.
 */

import type { TextSlotConfig, MediaSlotConfig } from '../../../config/sectionCanvasConfig'
import { matchTextToSlot, matchAllTextsForRole, matchMediaToSlot } from '../../../config/sectionCanvasConfig'
import type { SlotContext } from './canvasTypes'
import InlineTextSlot from './InlineTextSlot'
import InlineMediaSlot from './InlineMediaSlot'

// ── Arrow icons SVGs ──

function ArrowUpIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  )
}

function ArrowDownIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

// ── Connected Text Slot ──

export function ConnectedTextSlot({
  config,
  ctx,
  className,
}: {
  config: TextSlotConfig
  ctx: SlotContext
  className?: string
}) {
  const text = ctx.section ? matchTextToSlot(ctx.section.texts, config) : undefined
  return (
    <InlineTextSlot
      config={config}
      text={text}
      isEditing={ctx.editingSlotId === config.id}
      editValue={ctx.editValue}
      onStartEdit={() => ctx.startEdit(config.id, text)}
      onSaveEdit={() => ctx.saveEdit(config)}
      onCancelEdit={ctx.cancelEdit}
      onChangeValue={ctx.setEditValue}
      onDelete={text ? () => ctx.deleteText(text.blockId, text.id) : undefined}
      onPublish={text && ctx.publishText ? () => ctx.publishText!(text.id, text.blockId) : undefined}
      isPublishing={ctx.isPublishingText}
      className={className}
    />
  )
}

// ── Connected Media Slot ──

export function ConnectedMediaSlot({
  config,
  ctx,
  className,
}: {
  config: MediaSlotConfig
  ctx: SlotContext
  className?: string
}) {
  const items = ctx.section ? matchMediaToSlot(ctx.section.media, config) : []

  if (!config.multiple) {
    // Para slots NO múltiples, mostrar normalmente
    return (
      <InlineMediaSlot
        config={config}
        mediaItems={items}
        onUpload={(file) => ctx.uploadToSlot(config, file)}
        onDelete={(mediaId) => {
          const media = items.find((m) => m.id === mediaId)
          if (media) ctx.deleteMedia(media.blockId)
        }}
        onPublish={ctx.publishMedia
          ? (mediaId, blockId) => ctx.publishMedia!(mediaId, blockId)
          : undefined
        }
        isPublishing={ctx.isPublishingMedia}
        onPickFromGallery={ctx.pickFromGallery ? () => ctx.pickFromGallery!(config) : undefined}
        className={className}
      />
    )
  }

  // Para slots múltiples: mostrar con flechas de reorden
  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    const curr = items[index]
    const prev = items[index - 1]
    ctx.swapMediaOrder(curr.blockId, curr.order, prev.blockId, prev.order)
  }

  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return
    const curr = items[index]
    const next = items[index + 1]
    ctx.swapMediaOrder(curr.blockId, curr.order, next.blockId, next.order)
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        {items.map((media, i) => (
          <div key={media.id} className="group/item relative">
            {/* Flechas de reorden */}
            {items.length > 1 && (
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 transition-opacity group-hover/item:opacity-100">
                <button
                  type="button"
                  onClick={() => handleMoveUp(i)}
                  disabled={i === 0}
                  className="rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:invisible"
                  title="Mover arriba"
                >
                  <ArrowUpIcon />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(i)}
                  disabled={i === items.length - 1}
                  className="rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:invisible"
                  title="Mover abajo"
                >
                  <ArrowDownIcon />
                </button>
              </div>
            )}
            {/* Imagen con controles */}
            <div className="relative inline-block">
              <InlineMediaSlot
                config={config}
                mediaItems={[media]}
                onUpload={() => {}} // No se usa en este contexto
                onDelete={(mediaId) => {
                  if (mediaId === media.id) ctx.deleteMedia(media.blockId)
                }}
                onPublish={ctx.publishMedia
                  ? (mediaId, blockId) => ctx.publishMedia!(mediaId, blockId)
                  : undefined
                }
                isPublishing={ctx.isPublishingMedia}
                onPickFromGallery={undefined}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Zona de upload para agregar nuevos items */}
      <div className="mt-3">
        <InlineMediaSlot
          config={config}
          mediaItems={[]}
          onUpload={(file) => ctx.uploadToSlot(config, file)}
          onDelete={() => {}}
          onPublish={undefined}
          isPublishing={false}
          onPickFromGallery={ctx.pickFromGallery ? () => ctx.pickFromGallery!(config) : undefined}
        />
      </div>
    </div>
  )
}

// ── Multiple Text Slots (con reorden) ──

export function MultipleTextSlots({
  config,
  ctx,
  className,
  addLabel,
}: {
  config: TextSlotConfig
  ctx: SlotContext
  className?: string
  addLabel?: string
}) {
  const texts = ctx.section ? matchAllTextsForRole(ctx.section.texts, config.role) : []

  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    const curr = texts[index]
    const prev = texts[index - 1]
    ctx.swapTextOrder(curr.blockId, curr.order, prev.blockId, prev.order)
  }

  const handleMoveDown = (index: number) => {
    if (index >= texts.length - 1) return
    const curr = texts[index]
    const next = texts[index + 1]
    ctx.swapTextOrder(curr.blockId, curr.order, next.blockId, next.order)
  }

  return (
    <div className={className}>
      {texts.map((t, i) => {
        const slotId = `${config.id}-${i}`
        return (
          <div key={t.id} className="group/item mb-2 flex items-start gap-1">
            {/* Flechas de reorden */}
            {texts.length > 1 && (
              <div className="flex flex-col gap-0.5 pt-1 opacity-0 transition-opacity group-hover/item:opacity-100">
                <button
                  type="button"
                  onClick={() => handleMoveUp(i)}
                  disabled={i === 0}
                  className="rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:invisible"
                  title="Mover arriba"
                >
                  <ArrowUpIcon />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(i)}
                  disabled={i === texts.length - 1}
                  className="rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:invisible"
                  title="Mover abajo"
                >
                  <ArrowDownIcon />
                </button>
              </div>
            )}
            {config.display === 'bullet' && (
              <span className="mt-2.5 flex h-2 w-2 flex-shrink-0 rounded-full bg-teal-600" />
            )}
            <div className="flex-1">
              <InlineTextSlot
                config={{ ...config, id: slotId, slotIndex: i }}
                text={t}
                isEditing={ctx.editingSlotId === slotId}
                editValue={ctx.editValue}
                onStartEdit={() => ctx.startEdit(slotId, t)}
                onSaveEdit={() => ctx.saveEdit({ ...config, id: slotId, slotIndex: i })}
                onCancelEdit={ctx.cancelEdit}
                onChangeValue={ctx.setEditValue}
                onDelete={() => ctx.deleteText(t.blockId, t.id)}
                onPublish={ctx.publishText ? () => ctx.publishText!(t.id, t.blockId) : undefined}
                isPublishing={ctx.isPublishingText}
              />
            </div>
          </div>
        )
      })}
      {/* Botón agregar nuevo */}
      <button
        type="button"
        onClick={() => ctx.startEdit(`${config.id}-new`, undefined)}
        className="mt-1 flex items-center gap-1 rounded-md border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {addLabel ?? `Agregar ${config.label.toLowerCase()}`}
      </button>
      {/* Editor inline para nuevo item */}
      {ctx.editingSlotId === `${config.id}-new` && (
        <div className="mt-2">
          <InlineTextSlot
            config={{ ...config, id: `${config.id}-new`, slotIndex: texts.length }}
            text={undefined}
            isEditing={true}
            editValue={ctx.editValue}
            onStartEdit={() => {}}
            onSaveEdit={() => ctx.saveEdit({ ...config, slotIndex: texts.length })}
            onCancelEdit={ctx.cancelEdit}
            onChangeValue={ctx.setEditValue}
          />
        </div>
      )}
    </div>
  )
}
