// The channel picture below is a placeholder monogram (navy square, "CPE" in
// serif) drawn locally at ./assets/podcast-channel.svg — swap that file for
// the show's real Spotify profile picture when it's available; this
// component's import path stays the same.
import podcastChannelPicture from './assets/podcast-channel.svg'
import { ChevronRight } from './ForoIcons'
import { hexToRgba, isSafeHttpUrl } from './foroHelpers'
import { SafeExternalLink } from './externalLinkGuard'
import { platformColors } from '../../../../theme'

interface SpotifyLinkProps {
  url: string
  episodeTitle?: string
}

/** Inline Spotify wordmark — circle-with-three-arcs, drawn locally (no external fetch/icon font). */
function SpotifyMark({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.36-.66.48-1.021.24-2.82-1.74-6.36-2.14-10.561-1.16-.418.122-.819-.16-.941-.557-.122-.418.16-.819.578-.941 4.56-1.021 8.52-.6 11.64 1.32.36.24.48.66.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.719-.66 13.439 1.62.361.181.54.78.301 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.56.3z"
      />
    </svg>
  )
}

/**
 * Podcast episode's primary action: a large, unmistakably "the button to
 * press" card — bigger channel picture, a solid Spotify-green badge (not
 * just a small inline mark) and a bold headline, always paired with a
 * circular chevron affordance. Spotify green is the documented brand-color
 * exception (`platformColors`, kept exactly as the brand specifies) — every
 * other Foro control derives its color from the format accent instead.
 * White surface, full width (sized by its container — the podcast detail
 * places it next to the episode cover, see `PublicationDetail`'s
 * `PodcastListenUnit`). Always a single top-level `<a>` — never nest this
 * inside another anchor.
 */
export function SpotifyLink({ url, episodeTitle }: SpotifyLinkProps) {
  const content = (
    <>
      <span className="relative h-16 w-16 shrink-0">
        <img src={podcastChannelPicture} alt="" className="block h-full w-full rounded-full object-cover ring-1 ring-gray-200" />
        <span
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-white ring-2 ring-white"
          style={{ backgroundColor: platformColors.spotifyGreen }}
        >
          <SpotifyMark size={16} />
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-lg font-bold leading-tight text-gray-900">Escuchar en Spotify</span>
        {episodeTitle && (
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-500">
            {episodeTitle}
          </span>
        )}
      </span>
      <span
        className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-150 group-hover:translate-x-1"
        style={{ backgroundColor: platformColors.spotifyGreen }}
        aria-hidden="true"
      >
        <ChevronRight size={20} />
      </span>
    </>
  )

  // Unsafe scheme (javascript:/data:/etc — see `isSafeHttpUrl`): never render
  // this as a clickable anchor, only as an inert card. Stored data can carry
  // a bad URL even though the composer now rejects one on save.
  if (!isSafeHttpUrl(url)) {
    return (
      <div
        className="flex w-full items-center gap-4 rounded-2xl border-2 bg-white px-5 py-4 opacity-60"
        style={{ borderColor: hexToRgba(platformColors.spotifyGreen, 0.35) }}
      >
        {content}
      </div>
    )
  }

  return (
    <SafeExternalLink
      className="group flex w-full items-center gap-4 rounded-2xl border-2 bg-white px-5 py-4 shadow-md no-underline transition-all duration-150 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      href={url}
      style={{ borderColor: hexToRgba(platformColors.spotifyGreen, 0.35) }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = platformColors.spotifyGreen }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = hexToRgba(platformColors.spotifyGreen, 0.35) }}
    >
      {content}
    </SafeExternalLink>
  )
}
