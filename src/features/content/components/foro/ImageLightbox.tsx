import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ForoImage } from '@features/foro'
import { foroPalette, fonts } from '../../../../theme'

const ZOOM_MIN = 1
const ZOOM_MAX = 4
/** Discrete stops a click/double-click cycles through — see `stepZoom` below. */
const ZOOM_STEPS = [1, 2, 4] as const
/** Pointer movement (px) below which a press+release still counts as a "click" (zoom step)
 *  rather than a pan drag — guards against a drag's final pointerup also firing a click. */
const DRAG_THRESHOLD = 4

function clampScale(value: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value))
}

/** Next stop in `ZOOM_STEPS`, cycling back to the first after the last. A value that doesn't
 *  land on a stop (e.g. mid-wheel-zoom) advances to the first stop above 1x. */
function stepZoom(current: number): number {
  const atIndex = ZOOM_STEPS.findIndex((stop) => Math.abs(stop - current) < 0.01)
  if (atIndex === -1) return ZOOM_STEPS[1]
  return ZOOM_STEPS[(atIndex + 1) % ZOOM_STEPS.length]
}

interface ImageLightboxProps {
  images: ForoImage[]
  /** `null` renders nothing — the parent owns `openIndex` and mounts this unconditionally. */
  index: number | null
  onClose: () => void
  onIndexChange: (index: number) => void
}

/**
 * Fullscreen zoomable viewer for a publication's `images[]`. Local to each call site
 * (`<Gallery>`, `<NovedadCollage>`) — driven entirely by the parent's `openIndex` state, no
 * provider/context. Follows the house dialog idiom (`ModerationNoticeDialog`, `ForoAuthDialog`):
 * portal to `document.body`, scrim + panel with `stopPropagation`, Escape via a
 * window keydown listener mounted only while open, `×` close button. Two departures, both
 * called out where they happen: background scroll gets locked (`.lenis-stopped`) since a
 * scrolling page behind a zoomed image is unusable, and the close/nav buttons sit on a
 * translucent dark chip instead of the dialogs' light-panel style, since here the backdrop is
 * the photo itself rather than a white card.
 */
export function ImageLightbox({ images, index, onClose, onIndexChange }: ImageLightboxProps) {
  const isOpen = index !== null
  const count = images.length
  const clampedIndex = isOpen ? Math.min(Math.max(index, 0), Math.max(count - 1, 0)) : 0
  const current = isOpen ? images[clampedIndex] : undefined

  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number; moved: boolean } | null>(null)
  /** Set from the drag gesture's own pointerup (before `dragRef` is cleared) so the click event
   *  that follows can tell a pan apart from a tap and skip the zoom step. */
  const justDraggedRef = useRef(false)

  // Reset zoom/pan whenever the visible image changes, and whenever the viewer closes
  // (`index` going to `null` is itself a change this reacts to). Adjusted directly during
  // render — the React-recommended pattern for "reset state when a prop changes" — rather
  // than in an effect, which would cost an extra commit+re-render for the same result.
  const [resetKey, setResetKey] = useState(index)
  if (resetKey !== index) {
    setResetKey(index)
    setScale(1)
    setPan({ x: 0, y: 0 })
  }

  // Lock background scroll while open. The app's Lenis smooth-scroll already defines
  // `.lenis.lenis-stopped { overflow: hidden }` in index.css but nothing toggles it yet —
  // reuse that instead of a bespoke `overflow:hidden` mechanism. `.lenis` itself is applied
  // to `<html>` for the lifetime of the app by the Lenis instance, so adding just the
  // `-stopped` modifier here is enough; always removed on close/unmount.
  useEffect(() => {
    if (!isOpen) return
    document.documentElement.classList.add('lenis-stopped')
    return () => { document.documentElement.classList.remove('lenis-stopped') }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft' && count > 1) onIndexChange((clampedIndex - 1 + count) % count)
      else if (e.key === 'ArrowRight' && count > 1) onIndexChange((clampedIndex + 1) % count)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, clampedIndex, count, onClose, onIndexChange])

  /** `object-contain`'s rendered box at scale 1, from the image's natural aspect ratio and the
   *  stage's current box — needed to know how much of a scaled-up image actually overflows the
   *  stage, so panning can be clamped to it instead of the stage's own (larger) box. */
  const getFittedSize = (): { w: number; h: number } | null => {
    const stage = stageRef.current
    const img = imgRef.current
    if (!stage || !img || !img.naturalWidth || !img.naturalHeight) return null
    const boxW = stage.clientWidth
    const boxH = stage.clientHeight
    const imgRatio = img.naturalWidth / img.naturalHeight
    const boxRatio = boxW / boxH
    return imgRatio > boxRatio ? { w: boxW, h: boxW / imgRatio } : { w: boxH * imgRatio, h: boxH }
  }

  const clampPan = (next: { x: number; y: number }, atScale: number): { x: number; y: number } => {
    const stage = stageRef.current
    const fitted = getFittedSize()
    if (!stage || !fitted) return { x: 0, y: 0 }
    const maxX = Math.max(0, (fitted.w * atScale - stage.clientWidth) / 2)
    const maxY = Math.max(0, (fitted.h * atScale - stage.clientHeight) / 2)
    return { x: Math.min(maxX, Math.max(-maxX, next.x)), y: Math.min(maxY, Math.max(-maxY, next.y)) }
  }

  const applyScale = (next: number) => {
    const clamped = clampScale(next)
    setScale(clamped)
    setPan((p) => clampPan(p, clamped))
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    applyScale(scale - e.deltaY * 0.0015)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y, moved: false }
    setIsDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) drag.moved = true
    setPan(clampPan({ x: drag.panX + dx, y: drag.panY + dy }, scale))
  }

  const endDrag = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    dragRef.current = null
    setIsDragging(false)
  }

  const handleImageClick = () => {
    // A drag's terminal pointerup still fires a click afterwards — swallow it so panning
    // doesn't also step the zoom.
    if (justDraggedRef.current) {
      justDraggedRef.current = false
      return
    }
    applyScale(stepZoom(scale))
  }

  if (!isOpen || !current) return null

  const go = (delta: number) => onIndexChange((clampedIndex + delta + count) % count)

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
      style={{ backgroundColor: foroPalette.scrim, fontFamily: fonts.primary }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-[94vw] flex-col items-center gap-3"
        role="dialog"
        aria-modal="true"
        aria-label={count > 1 ? `Imagen ${clampedIndex + 1} de ${count}` : 'Imagen'}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute -right-2 -top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border-none bg-black/60 text-xl leading-none text-white transition-colors hover:bg-black/80 sm:right-0 sm:top-0"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <div
          ref={stageRef}
          className="relative flex h-[75vh] w-full items-center justify-center overflow-hidden"
          onWheel={handleWheel}
        >
          {count > 1 && (
            <button
              type="button"
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-none bg-black/50 text-white transition-colors hover:bg-black/70"
              onClick={() => go(-1)}
              aria-label="Imagen anterior"
            >
              <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}

          <img
            ref={imgRef}
            src={current.url}
            alt={current.altText ?? ''}
            draggable={false}
            onClick={handleImageClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={(e) => { justDraggedRef.current = dragRef.current?.moved ?? false; endDrag(e) }}
            onPointerCancel={endDrag}
            className={[
              'max-h-full max-w-full select-none object-contain motion-reduce:transition-none',
              // No transition while actively dragging — animating each pointermove's target
              // would make panning trail the cursor. Click/wheel zoom steps still ease in.
              isDragging ? '' : 'transition-transform duration-150',
              scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in',
            ].join(' ')}
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
          />

          {count > 1 && (
            <button
              type="button"
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-none bg-black/50 text-white transition-colors hover:bg-black/70"
              onClick={() => go(1)}
              aria-label="Imagen siguiente"
            >
              <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
              </svg>
            </button>
          )}
        </div>

        {(count > 1 || current.altText) && (
          <div className="flex flex-col items-center gap-1 text-center">
            {count > 1 && <span className="text-xs font-medium text-white/70">{clampedIndex + 1} / {count}</span>}
            {current.altText && <p className="max-w-[70ch] text-sm text-white/90">{current.altText}</p>}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default ImageLightbox
