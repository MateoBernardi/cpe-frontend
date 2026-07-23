import type { ExternalLink } from '@features/foro'
import { SpotifyLink } from './SpotifyLink'
import { YouTubeMark } from './PlatformMarks'

interface ExternalLinksCTAProps {
  label: string
  title: string
  links: ExternalLink[]
}

/**
 * `.cta-card` — solid-navy box with the publication's `external_links`. A
 * `spotify`-labeled link (if present) renders first as the richer
 * <SpotifyLink> "listen card"; any remaining links keep the existing
 * treatment — the first of those as the primary full-width button, the rest
 * as a pill row. A `youtube`-labeled primary link gets the dedicated
 * `.foro-btn-youtube` treatment (near-black/white, AA-legible) plus the
 * inline <YouTubeMark/> logo; every other label keeps the plain teal button.
 * Never hardcodes platform names beyond the Spotify/YouTube special cases —
 * renders whatever `label` the backend sent. Hides entirely when there are
 * no external links (nothing to act on).
 */
export function ExternalLinksCTA({ label, title, links }: ExternalLinksCTAProps) {
  if (links.length === 0) return null
  const spotifyLink = links.find((link) => link.label === 'spotify')
  const otherLinks = links.filter((link) => link.label !== 'spotify')
  const [primary, ...rest] = otherLinks
  const isYouTube = primary?.label === 'youtube'

  return (
    <div className="foro-cta-card">
      <div className="foro-lbl">{label}</div>
      <h4>{title}</h4>
      {spotifyLink && <SpotifyLink url={spotifyLink.url} episodeTitle={title} />}
      {primary && (
        <a
          className={['foro-btn', isYouTube ? 'foro-btn-youtube' : 'foro-btn-teal'].join(' ')}
          href={primary.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {isYouTube && <YouTubeMark />}
          {primary.label}
        </a>
      )}
      {rest.length > 0 && (
        <div className="foro-fmt">
          {rest.map((link) => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
