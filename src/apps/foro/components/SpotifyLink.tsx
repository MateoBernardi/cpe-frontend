// The channel picture below is a placeholder monogram (navy square, "CPE" in
// serif) drawn locally at src/apps/foro/assets/podcast-channel.svg — swap
// that file for the show's real Spotify profile picture when it's available;
// this component's import path stays the same.
import podcastChannelPicture from '../assets/podcast-channel.svg'

interface SpotifyLinkProps {
  url: string
  episodeTitle?: string
}

/** Inline Spotify wordmark — circle-with-three-arcs, drawn locally (no external fetch/icon font). */
function SpotifyMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.36-.66.48-1.021.24-2.82-1.74-6.36-2.14-10.561-1.16-.418.122-.819-.16-.941-.557-.122-.418.16-.819.578-.941 4.56-1.021 8.52-.6 11.64 1.32.36.24.48.66.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.719-.66 13.439 1.62.361.181.54.78.301 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.56.3z"
      />
    </svg>
  )
}

/**
 * `.foro-spotify-link` — flat, square-cornered "listen card" for a podcast's
 * Spotify link: circular channel profile picture, inline Spotify wordmark,
 * "Escuchar en Spotify" + optional episode title. Self-contained flat/paper
 * surface with a hairline border, so it reads consistently whether it sits
 * on the light hero body (<TypeHero>) or inside the dark `.foro-cta-card`
 * rail (<ExternalLinksCTA>). Always a single top-level `<a>` — never nest
 * this inside another anchor.
 */
export function SpotifyLink({ url, episodeTitle }: SpotifyLinkProps) {
  return (
    <a className="foro-spotify-link" href={url} target="_blank" rel="noopener noreferrer">
      <span className="foro-spotify-avatar">
        <img src={podcastChannelPicture} alt="" />
      </span>
      <span className="foro-spotify-body">
        <span className="foro-spotify-brand">
          <SpotifyMark />
          Escuchar en Spotify
        </span>
        {episodeTitle && <span className="foro-spotify-episode">{episodeTitle}</span>}
      </span>
      <span className="foro-spotify-arrow" aria-hidden="true">→</span>
    </a>
  )
}
