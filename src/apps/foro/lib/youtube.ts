import type { ExternalLink } from '@features/foro'

/**
 * Novedad-only helper: detects a YouTube link among a publication's
 * `external_links` and turns it into an embeddable URL. Recognizes the
 * three common share/link shapes:
 *   - youtube.com/watch?v=<id>
 *   - youtu.be/<id>
 *   - youtube.com/embed/<id> (already an embed URL)
 * Anything else (Spotify, a plain "sitio web" link, a non-YouTube video
 * host…) returns `null` so callers fall back to the existing
 * `<ExternalLinksCTA>` chip idiom instead of trying to embed it.
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\./, '').replace(/^m\./, '')

  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1).split('/')[0]
    return id ? `https://www.youtube.com/embed/${id}` : null
  }

  if (host === 'youtube.com') {
    if (parsed.pathname === '/watch') {
      const id = parsed.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (parsed.pathname.startsWith('/embed/')) {
      return url
    }
  }

  return null
}

/** First YouTube-recognizable link in a publication's external links, if any. */
export function findYouTubeLink(links: ExternalLink[] | undefined): ExternalLink | undefined {
  return links?.find((link) => getYouTubeEmbedUrl(link.url) !== null)
}
