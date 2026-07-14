import type { ExternalLink } from '@features/foro'

interface ExternalLinksCTAProps {
  label: string
  title: string
  links: ExternalLink[]
}

/**
 * `.cta-card` — solid-navy box with the publication's `external_links`.
 * The first link renders as the primary full-width button, the rest as a
 * pill row. Never hardcodes platform names — renders whatever `label` the
 * backend sent. Hides entirely when there are no external links (nothing to
 * act on).
 */
export function ExternalLinksCTA({ label, title, links }: ExternalLinksCTAProps) {
  if (links.length === 0) return null
  const [primary, ...rest] = links

  return (
    <div className="foro-cta-card">
      <div className="foro-lbl">{label}</div>
      <h4>{title}</h4>
      <a className="foro-btn foro-btn-teal" href={primary.url} target="_blank" rel="noopener noreferrer">
        {primary.label}
      </a>
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
