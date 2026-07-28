import type { ExternalLink } from '@features/foro'
import { SpotifyLink } from './SpotifyLink'
import { YouTubeMark } from './PlatformMarks'
import { ChevronRight } from './ForoIcons'
import { hoverBgSwap, isSafeHttpUrl } from './foroHelpers'
import { colors, platformColors } from '../../../../theme'

interface ExternalLinksCTAProps {
  label: string
  title: string
  links: ExternalLink[]
}

/** 'spotify' becomes 'Spotify', 'sitio web' becomes 'Sitio web'. */
function prettyLabel(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/**
 * White "listen/watch" card with the publication's `external_links`. A
 * `spotify`-labeled link (if present) renders first as the richer
 * <SpotifyLink> card; any remaining links keep a simple button treatment —
 * the first as a solid primary button, the rest as an outline pill row. A
 * `youtube`-labeled primary link gets the dedicated near-black/white
 * treatment (AA-legible, brand-exact) plus the inline <YouTubeMark/> logo;
 * every other label keeps the plain teal button. Never hardcodes platform
 * names beyond the Spotify/YouTube special cases. Hides entirely when there
 * are no external links.
 */
export function ExternalLinksCTA({ label, title, links }: ExternalLinksCTAProps) {
  if (links.length === 0) return null
  const spotifyLink = links.find((link) => link.label === 'spotify')
  const otherLinks = links.filter((link) => link.label !== 'spotify')
  const [primary, ...rest] = otherLinks
  const isYouTube = primary?.label === 'youtube'

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.tealDeep }}>{label}</p>
      <h4 className="mb-4 mt-1 text-base font-semibold leading-snug" style={{ color: colors.blueDark }}>{title}</h4>

      {spotifyLink && (
        <div className="mb-3">
          <SpotifyLink url={spotifyLink.url} episodeTitle={title} />
        </div>
      )}

      {primary && (
        isSafeHttpUrl(primary.url) ? (
          <a
            className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: isYouTube ? platformColors.youtubeDarkBg : colors.ctaPrimary }}
            href={primary.url}
            target="_blank"
            rel="noopener noreferrer"
            {...hoverBgSwap(
              isYouTube ? platformColors.youtubeDarkBg : colors.ctaPrimary,
              isYouTube ? platformColors.youtubeDarkBgHover : colors.ctaPrimaryHover,
            )}
          >
            {isYouTube && <YouTubeMark />}
            <span className="inline-flex items-center gap-1.5">
              Ver en {prettyLabel(primary.label)}
              <ChevronRight size={16} />
            </span>
          </a>
        ) : (
          // Unsafe scheme (javascript:/data:/etc — see `isSafeHttpUrl`): never
          // render this as a clickable anchor, only as inert text.
          <span className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-gray-400 ring-1 ring-slate-200">
            {prettyLabel(primary.label)}
          </span>
        )
      )}

      {rest.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {rest.map((link) =>
            isSafeHttpUrl(link.url) ? (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-slate-200 transition-colors hover:bg-gray-50"
                style={{ color: colors.tealDeep }}
              >
                {prettyLabel(link.label)}
              </a>
            ) : (
              // Unsafe scheme — inert text, no anchor.
              <span
                key={link.label}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-slate-200 text-gray-400"
              >
                {prettyLabel(link.label)}
              </span>
            ),
          )}
        </div>
      )}
    </div>
  )
}
