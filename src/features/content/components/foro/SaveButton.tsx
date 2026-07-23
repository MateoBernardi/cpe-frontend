import { useQuery } from '@tanstack/react-query'
import {
  useForoAuth,
  useInteractionToggle,
  foroKeys,
  foroService,
  mapInteractionDTO,
  INTERACTION_TYPE_IDS,
} from '@features/foro'
import { BookmarkIcon } from './ForoIcons'
import { hexToRgba } from './foroHelpers'
import { colors } from '../../../../theme'

/**
 * Whether the signed-in user has already saved this publication — a
 * "guardado" is just an `Interaction` row with `type_id = 4`, owned by the
 * current user; the backend has no dedicated "is this saved?" endpoint, so
 * this reads the same list the toggle mutation invalidates and matches it
 * against `user.id`. Disabled while logged out or for a not-yet-persisted
 * publication (id <= 0 — the admin's live-preview pane).
 */
function useIsSaved(publicationId: number) {
  const { user, isAuthenticated } = useForoAuth()
  const enabled = isAuthenticated && publicationId > 0

  const { data } = useQuery({
    queryKey: foroKeys.interactions(publicationId, INTERACTION_TYPE_IDS.guardado),
    queryFn: ({ signal }) =>
      foroService.listInteractionsForPublication(publicationId, INTERACTION_TYPE_IDS.guardado, signal),
    select: (dtos) => dtos.map(mapInteractionDTO),
    enabled,
  })

  const mine = enabled ? data?.find((i) => i.userId === user?.id) : undefined
  return { isSaved: mine != null, savedInteractionId: mine?.id ?? null }
}

interface SaveButtonProps {
  publicationId: number
  /** `pill`: hero's labeled "Guardar" button. `icon`: bare bookmark icon button used on list rows. */
  variant?: 'pill' | 'icon'
  /** Format accent — only used by the `pill` variant's glass border (matches `<CategoryTag variant="glass">`'s hairline). */
  accent?: string
}

/**
 * Save/bookmark toggle — wired to `useInteractionToggle` (type_id 4,
 * "guardado"). Requires a session; opens the auth dialog when logged out
 * instead of firing a doomed request. The `pill` variant sits over the
 * hero's cover image, so its unsaved state uses the same glass treatment as
 * the hero's other overlaid controls (translucent navy scrim, blur, accent
 * hairline); once saved it switches to a solid accent fill so the toggled
 * state reads unambiguously.
 */
export function SaveButton({ publicationId, variant = 'pill', accent = colors.ctaPrimary }: SaveButtonProps) {
  const { isAuthenticated, openAuthDialog } = useForoAuth()
  const { isSaved, savedInteractionId } = useIsSaved(publicationId)
  const { add, remove } = useInteractionToggle(publicationId, INTERACTION_TYPE_IDS.guardado)
  const pending = add.isPending || remove.isPending

  const handleClick = () => {
    if (!isAuthenticated) {
      openAuthDialog('sign-in')
      return
    }
    if (isSaved && savedInteractionId != null) {
      remove.mutate(savedInteractionId)
    } else {
      add.mutate()
    }
  }

  const label = isSaved ? 'Quitar de guardados' : 'Guardar'

  if (variant === 'icon') {
    const savedClass = 'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60'
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-label={label}
        aria-pressed={isSaved}
        title={label}
        className={isSaved ? `${savedClass} text-white` : `${savedClass} text-gray-400 hover:text-white`}
        style={{ backgroundColor: isSaved ? colors.ctaPrimary : undefined }}
        onMouseEnter={(e) => { if (!isSaved) e.currentTarget.style.backgroundColor = colors.ctaPrimary }}
        onMouseLeave={(e) => { if (!isSaved) e.currentTarget.style.backgroundColor = '' }}
      >
        <BookmarkIcon filled={isSaved} />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={isSaved}
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors duration-200 hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
      style={
        isSaved
          ? { backgroundColor: hexToRgba(accent, 0.9), border: '1px solid transparent' }
          : { backgroundColor: hexToRgba(colors.blueDark, 0.45), border: `1px solid ${hexToRgba(accent, 0.85)}` }
      }
    >
      <BookmarkIcon size={16} filled={isSaved} />
      {label}
    </button>
  )
}
