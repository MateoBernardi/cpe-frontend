import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FORO_CONTENT_REJECTED_EVENT, type ForoApiError } from '../api/foroApiRequest'
import { colors, fonts, foroPalette } from '../../../theme'

/** Deriva un label humano por categoría. Dos categorías del modelo pueden compartir label
 *  (`hate`/`hate/threatening`, `violence`/`violence/graphic`) — se deduplican al renderizar. */
const CATEGORY_LABELS: Record<string, string> = {
  slur: 'Lenguaje ofensivo o discriminatorio',
  doxxing: 'Datos personales o de contacto',
  spam: 'Spam: demasiados enlaces, acortadores o billeteras de cripto',
  hate: 'Discurso de odio',
  'hate/threatening': 'Discurso de odio',
  'harassment/threatening': 'Acoso o amenazas',
  sexual: 'Contenido sexual',
  'sexual/minors': 'Contenido sexual con menores',
  violence: 'Violencia',
  'violence/graphic': 'Violencia',
  'self-harm/instructions': 'Autolesiones',
  'illicit/violent': 'Actividad ilícita o violenta',
}

const GENERIC_LABEL = 'Contenido que infringe las normas de la comunidad'

/** Nunca vacío y nunca un slug crudo en pantalla: categorías vacías o no mapeadas caen al genérico. */
function labelsFor(categories: string[]): string[] {
  const labels = categories
    .map((category) => CATEGORY_LABELS[category])
    .filter((label): label is string => label !== undefined)
  const unique = Array.from(new Set(labels))
  return unique.length > 0 ? unique : [GENERIC_LABEL]
}

function readCategories(details: unknown): string[] {
  if (!details || typeof details !== 'object') return []
  const categories = (details as { categories?: unknown }).categories
  if (!Array.isArray(categories)) return []
  return categories.filter((category): category is string => typeof category === 'string')
}

interface RejectionNotice {
  message: string
  categories: string[]
}

/**
 * Modal global para el 422 de moderación automática. Comentarios, publicaciones e imágenes
 * comparten el mismo `code: 'CONTENT_REJECTED'`, así que un único diálogo alcanza para las tres
 * superficies sin cablear cada mutación — mismo idiom que `<ExternalLinkGuardProvider>` /
 * `<ForoAuthDialog>`: una sola instancia montada en `App.tsx`, escuchando el evento global de
 * `foroApiRequest.ts` en vez de recibir props.
 */
export function ModerationNoticeDialog() {
  const [notice, setNotice] = useState<RejectionNotice | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const error = (e as CustomEvent<ForoApiError>).detail
      setNotice({ message: error.message, categories: readCategories(error.data.details) })
    }
    window.addEventListener(FORO_CONTENT_REJECTED_EVENT, handler)
    return () => window.removeEventListener(FORO_CONTENT_REJECTED_EVENT, handler)
  }, [])

  useEffect(() => {
    if (!notice) return
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setNotice(null) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [notice])

  if (!notice) return null

  const labels = labelsFor(notice.categories)
  const close = () => setNotice(null)

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-5 backdrop-blur-[2px]"
      style={{ backgroundColor: foroPalette.scrim, fontFamily: fonts.primary }}
      onClick={close}
      role="presentation"
    >
      <div
        className="relative w-full max-w-[420px] rounded-2xl bg-white px-5 pb-6 pt-7 shadow-2xl sm:px-7"
        style={{ color: foroPalette.ink }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="moderation-notice-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="moderation-notice-title" className="text-lg font-bold" style={{ color: colors.blueDark }}>
          Contenido rechazado por moderación
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed" style={{ color: foroPalette.muted }}>
          {notice.message}
        </p>

        <div className="mt-3 rounded-lg px-3 py-2" style={{ backgroundColor: colors.lightGray }}>
          <p className="text-xs font-semibold" style={{ color: colors.blueDark }}>
            Qué detectamos:
          </p>
          <ul className="mt-1 list-disc pl-4 text-xs" style={{ color: foroPalette.muted }}>
            {labels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>

        <p className="mt-3 text-[13px]" style={{ color: foroPalette.muted }}>
          Editá el texto y volvé a intentar.
        </p>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={close}
            className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: colors.ctaPrimary }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.ctaPrimaryHover }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.ctaPrimary }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
