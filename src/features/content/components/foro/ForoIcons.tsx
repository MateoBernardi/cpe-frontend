// ── Shared inline icon set for the Foro screens ──
// Plain SVG paths (no icon font / external fetch), same convention as
// `<PlatformMarks>`'s `<YouTubeMark>`. Every icon is `aria-hidden` by
// default — callers that use one as a button's *only* content are
// responsible for putting an accessible name on the surrounding button.

interface IconProps {
  size?: number
  className?: string
}

export function CalendarIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path strokeLinecap="round" d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  )
}

export function ClockIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3.5 2" />
    </svg>
  )
}

export function BookmarkIcon({ size = 18, className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.6-6 3.6V4.5Z" />
    </svg>
  )
}

/**
 * Estrella del botón de favorito. Estrella y no corazón a propósito: el foro es un espacio
 * editorial/académico y un corazón lo hace leer como red social (ver DECISIONS D48).
 */
export function StarIcon({ size = 18, className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3.5 2.6 5.55 6.02.79-4.4 4.2 1.1 6-5.32-2.9-5.32 2.9 1.1-6-4.4-4.2 6.02-.79L12 3.5Z" />
    </svg>
  )
}

export function ShareIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden="true">
      <circle cx="18" cy="5" r="2.75" />
      <circle cx="6" cy="12" r="2.75" />
      <circle cx="18" cy="19" r="2.75" />
      <path strokeLinecap="round" d="m8.5 10.5 7-4M8.5 13.5l7 4" />
    </svg>
  )
}

export function ArrowRightIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

/**
 * Side-pointing chevron — the Foro's single navigation-affordance glyph,
 * used in place of every literal text arrow character and (for consistency)
 * the fuller `<ArrowRightIcon>` on "go to detail" links. Callers that animate
 * a hover slide pass a `className` with the `translate-x` transition; the
 * icon itself stays static.
 */
export function ChevronRight({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function PlayIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 5.14v13.72c0 .8.87 1.29 1.55.86l10.79-6.86a1 1 0 0 0 0-1.72L9.55 4.28C8.87 3.85 8 4.34 8 5.14Z" />
    </svg>
  )
}

export function ChatBubbleIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

export function DocumentIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  )
}

export function AnnouncementIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11v2a2 2 0 0 0 2 2h1l3.5 4v-4H13l7-4V7l-7-4H9.5v4H6a2 2 0 0 0-2 2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 15v4" />
    </svg>
  )
}

export function MicIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
    </svg>
  )
}

export function UserIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 20c0-3.7 3.13-6 7-6s7 2.3 7 6" />
    </svg>
  )
}

// ── Share row icons (LinkedIn / X / WhatsApp / email / copy) ──
// Rendered monochrome (never the platforms' brand colors — only Spotify/
// YouTube are the documented brand-color exception, see `platformColors`).

export function LinkedInIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

export function XIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H15.83l-5.394-7.05-6.174 7.05H1.947l7.73-8.835L1.5 2.25h7.372l4.875 6.443zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function WhatsAppIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.44 1.27 4.89L2 22l5.24-1.28A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm5.86 14.16c-.25.7-1.25 1.28-2.03 1.44-.55.11-1.26.2-3.66-.79-3.07-1.27-5.05-4.38-5.2-4.58-.15-.2-1.24-1.65-1.24-3.15s.78-2.23 1.06-2.54c.27-.3.6-.37.8-.37h.57c.18 0 .43-.07.67.51.25.6.85 2.08.92 2.24.07.15.12.33.02.53-.09.2-.14.32-.28.5-.14.17-.29.38-.42.51-.14.14-.28.29-.12.57.15.28.68 1.13 1.47 1.83 1.01.9 1.86 1.18 2.14 1.31.28.14.44.12.61-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.63-.14.26.09 1.63.77 1.91.91.28.14.46.21.53.33.07.12.07.68-.18 1.37z" />
    </svg>
  )
}

export function EmailIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.5 6 8.5 6.5L20.5 6" />
    </svg>
  )
}

export function CopyIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </svg>
  )
}

export function CheckIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  )
}

export function TrashIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7m2 0v13a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20V7h10ZM10 11v6M14 11v6" />
    </svg>
  )
}
