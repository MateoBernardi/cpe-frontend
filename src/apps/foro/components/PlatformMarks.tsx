/**
 * Inline platform logo marks for external-link "visit" CTAs (no external
 * fetch/icon font — plain SVG paths, same convention as `<SpotifyLink>`'s
 * `SpotifyMark`). Shared by <TypeHero> and <ExternalLinksCTA> so a
 * youtube-labeled link always carries its logo next to the button text.
 */

/**
 * YouTube wordmark's "play" glyph: a rounded-rect red badge with a white
 * play triangle. The rect's rounding is part of the logo itself (allowed
 * even though the foro is otherwise square-cornered) — colors are fixed
 * (not `currentColor`) so the mark reads correctly regardless of the
 * button's own background/text color, and red never leaks into the
 * surrounding button chrome.
 */
export function YouTubeMark({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <rect x="1" y="4" width="22" height="16" rx="5" ry="5" fill="#FF0000" />
      <path d="M10 8.3v7.4l6.3-3.7-6.3-3.7z" fill="#fff" />
    </svg>
  )
}
