// ── Foro presentational components, ported into the main app's content module ──
// Consumed by `src/apps/main/pages/**` (interacciones/publicaciones screens),
// and by the admin app's live-preview pane (`PublicationDetail`/
// `DiscussionDetail`, keep their prop signatures stable) and demo composer
// (`CategoryTag`, `typeAccent`). `ForoPreviewSection.tsx` (home page, owned
// by a different in-flight redesign) also still imports `heroCtaVerb`,
// `INTERACCIONES_SECTIONS`, `typeAccent` and `formatForoDate` from here —
// keep those five specifically working even as the rest of this module is
// redesigned.

export { CategoryTag } from './CategoryTag'
export { CommentComposer } from './CommentComposer'
export { CommentList } from './CommentList'
export { DetailShell } from './DetailShell'
export { DiscussionDetail } from './DiscussionDetail'
export { ExternalLinksCTA } from './ExternalLinksCTA'
export { ArticleHero } from './ArticleHero'
export { FeaturedCard } from './FeaturedCard'
export { Gallery } from './Gallery'
export { HeaderProfileButton } from './HeaderProfileButton'
export { LatestList } from './LatestList'
export { YouTubeMark } from './PlatformMarks'
export { PublicationDetail } from './PublicationDetail'
export { PublicationListItem } from './PublicationListItem'
export { SaveButton } from './SaveButton'
export { ShareButton, ShareIconRow } from './ShareButtons'
export { SpotifyLink } from './SpotifyLink'
export { TagList } from './TagList'
export { Prose } from './Prose'
export { ComposePreviewPane } from './ComposePreviewPane'
export { TYPE_OPTIONS, TYPE_CONFIG, MAX_NOVEDAD_IMAGES, PUBLICATION_CONTENT_MAX, EMPTY_FORM } from './composeConfig'
export type { CoverMode, TypeFieldConfig, FormState, GalleryImage } from './composeConfig'
export { PublicationComposer } from './PublicationComposer'
export { ActionButton } from './ActionButton'
export type { ActionButtonStatus } from './ActionButton'

export {
  typeAccent,
  hexToRgba,
  isSafeHttpUrl,
  formatForoDate,
  initialsOf,
  GENERIC_BYLINE,
  bylineFor,
  heroMetaValue,
  previewMetaLine,
  latestListHeading,
  shareCardTitle,
  publicationUrl,
  publicationShareUrl,
  getYouTubeEmbedUrl,
  hoverBgSwap,
  heroCtaVerb,
  interactionRows,
} from './foroHelpers'

export { ExternalLinkGuardProvider, SafeExternalLink } from './externalLinkGuard'
export { isTrustedExternalHost, displayHost } from './externalLinkAllowlist'

export * from './ForoIcons'

export {
  INTERACCIONES_SECTIONS,
  findInteraccionSection,
  interaccionRouteForSlug,
  DEFAULT_INTERACCION_ROUTE,
} from './foroSections'
export type { InteraccionSection } from './foroSections'
