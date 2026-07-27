import { Link } from 'react-router-dom'
import { useForoAuth } from '@features/foro'
import { UserIcon } from './ForoIcons'
import { initialsOf } from './foroHelpers'
import { colors, foroPalette } from '../../../../theme'

export interface HeaderProfileButtonProps {
  headerActive: boolean
  /** Called after any action that should dismiss the mobile menu. */
  onNavigate?: () => void
}

const iconColor = (headerActive: boolean) => (headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)')

/**
 * Header's trailing auth widget:
 * - loading -> the icon glyph, non-interactive, dimmed (no layout shift)
 * - signed out -> opens <ForoAuthDialog> in sign-in mode. Two desktop
 *   shapes: a labelled CTA over the hero, and — once `headerActive` shrinks
 *   the bar into its pill — an icon-only circular button, because at that
 *   width the label pushed "Servicios" into the logo. Mobile always keeps
 *   the full label: that instance lives in the `md:hidden` panel where the
 *   row is full-width, so the compaction is scoped to `md`+ only.
 * - signed in -> initials avatar that links straight to `/perfil` (the
 *   account dropdown — and sign-out — now live on the profile screen).
 */
export function HeaderProfileButton({ headerActive, onNavigate }: HeaderProfileButtonProps) {
  const { user, isAuthenticated, isLoading, openAuthDialog } = useForoAuth()

  if (isLoading) {
    return (
      <span className="flex-shrink-0 opacity-40" style={{ color: iconColor(headerActive) }} aria-hidden="true">
        <UserIcon className="h-4 w-4 lg:h-5 lg:w-5" />
      </span>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <button
        type="button"
        aria-label="Iniciar sesión o crear cuenta"
        className={[
          'inline-flex flex-shrink-0 items-center justify-center gap-1.5 whitespace-nowrap font-semibold text-white shadow-md transition-colors',
          'rounded-full text-xs lg:text-sm',
          // Scrolled: a circular icon button at md+ so the pill header keeps its
          // breathing room. Otherwise the roomier labelled CTA.
          headerActive ? 'px-3 py-2 md:h-9 md:w-9 md:p-0 lg:h-10 lg:w-10' : 'px-3 py-2',
        ].join(' ')}
        style={{ backgroundColor: colors.ctaPrimary, boxShadow: `0 4px 14px ${colors.ctaShadow}` }}
        onClick={() => { openAuthDialog('sign-in'); onNavigate?.() }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.ctaPrimaryHover }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.ctaPrimary }}
      >
        <UserIcon className="hidden h-4 w-4 md:inline lg:h-[18px] lg:w-[18px]" />
        {/* Short label at md+ only when the bar is roomy; hidden entirely once scrolled. */}
        <span className={headerActive ? 'hidden' : 'hidden md:inline'}>Iniciar sesión</span>
        <span className="md:hidden">Iniciar sesión o crear cuenta</span>
      </button>
    )
  }

  return (
    <Link
      to="/perfil"
      onClick={() => onNavigate?.()}
      className="inline-flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full font-sans text-[11px] font-semibold transition-colors lg:h-[30px] lg:w-[30px]"
      style={{ backgroundColor: foroPalette.tealTint, color: colors.tealDeep }}
      aria-label={`Cuenta de ${user.name}`}
    >
      {initialsOf(user.name)}
    </Link>
  )
}

export default HeaderProfileButton
