import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { ShareIcon, LinkedInIcon, XIcon, WhatsAppIcon, EmailIcon, CopyIcon, CheckIcon } from './ForoIcons'
import { hexToRgba } from './foroHelpers'
import { colors } from '../../../../theme'

function buildShareTargets(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  return {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
  }
}

/** Writes `url` to the clipboard, with a `document.execCommand` fallback for browsers/contexts without the async Clipboard API. */
async function copyToClipboard(url: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
      return true
    }
  } catch {
    // fall through to the legacy fallback below
  }
  try {
    const textarea = document.createElement('textarea')
    textarea.value = url
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

const iconButtonClass =
  'inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-500 ring-1 ring-slate-200 transition-colors duration-200 hover:text-white'

function useHoverAccent(accent: string) {
  return {
    onMouseEnter: (e: ReactMouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = accent },
    onMouseLeave: (e: ReactMouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = '' },
  }
}

interface ShareIconRowProps {
  url: string
  title: string
  accent?: string
}

/** Row of circular icon buttons: LinkedIn, X, WhatsApp, email, copy-link. Used inside the "Compartir esta <formato>" card. */
export function ShareIconRow({ url, title, accent = colors.tealDeep }: ShareIconRowProps) {
  const [copied, setCopied] = useState(false)
  const hoverProps = useHoverAccent(accent)
  const targets = buildShareTargets(url, title)

  const handleCopy = async () => {
    const ok = await copyToClipboard(url)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <a href={targets.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Compartir en LinkedIn" className={iconButtonClass} {...hoverProps}>
        <LinkedInIcon />
      </a>
      <a href={targets.x} target="_blank" rel="noopener noreferrer" aria-label="Compartir en X" className={iconButtonClass} {...hoverProps}>
        <XIcon />
      </a>
      <a href={targets.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Compartir por WhatsApp" className={iconButtonClass} {...hoverProps}>
        <WhatsAppIcon />
      </a>
      <a href={targets.email} aria-label="Compartir por correo electrónico" className={iconButtonClass} {...hoverProps}>
        <EmailIcon />
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Enlace copiado' : 'Copiar enlace'}
        className={iconButtonClass}
        {...hoverProps}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
      {copied && <span className="text-xs font-medium" style={{ color: accent }}>¡Copiado!</span>}
    </div>
  )
}

interface ShareButtonProps {
  url: string
  title: string
  /** Format accent — the glass border color, matching `<CategoryTag variant="glass">`'s hairline. */
  accent: string
}

/**
 * Hero pill button ("Compartir") that reveals a small popover with
 * `<ShareIconRow>` on click. Closes on outside click / Escape. Sits over the
 * cover image, so it uses the same glass treatment as the hero's format
 * badge (`<CategoryTag variant="glass">`): translucent navy scrim,
 * `backdrop-blur`, an accent-colored hairline border, white label — one
 * visual system across the hero's overlaid controls.
 */
export function ShareButton({ url, title, accent }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const glassStyle = { backgroundColor: hexToRgba(colors.blueDark, 0.45), border: `1px solid ${hexToRgba(accent, 0.85)}` }

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        style={glassStyle}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors duration-200 hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <ShareIcon size={16} />
        Compartir
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-max rounded-xl bg-white p-3 shadow-xl ring-1 ring-slate-200">
          <ShareIconRow url={url} title={title} />
        </div>
      )}
    </div>
  )
}
