export { default as TextBlock } from './TextBlock'
export { default as MediaBlock } from './MediaBlock'
export { default as SectionRenderer } from './SectionRenderer'
// NOTE: intentionally no `export * from './foro'` here — that blanket
// re-export used to pull `better-auth` (and the rest of the foro auth
// surface) into every consumer of this barrel, including the admin app via
// `AdminPreviewPage`'s `SectionRenderer` import, even though `SectionRenderer`
// never renders any foro component. Admin has no foro auth and should never
// ship it. Main's foro pages import directly from
// `@features/content/components/foro` (see e.g. `router.tsx`, the `perfil/`
// pages) — keep it that way instead of re-adding this re-export.
